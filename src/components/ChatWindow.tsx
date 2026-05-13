'use client';

import { useState, useRef, useEffect, useCallback, useId } from 'react';
import {
  ArrowLeft, MessageSquare, X, Mic, MicOff,
  Volume2, VolumeX, Send, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import type { Character, Emotion, Message, MoodEntry } from '@/lib/types';
import { CHARACTERS } from '@/lib/characters';
import { detectStressKeywords } from '@/lib/emotions';
import CharacterAvatar, { type AvatarState } from './CharacterAvatar';
import MeditationModal from './MeditationModal';

// ── Web Speech types ────────────────────────────────────────────────────────
interface SREvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SRInstance extends EventTarget {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: Event) => void) | null;
  start(): void; stop(): void; abort(): void;
}
declare global {
  interface Window {
    SpeechRecognition: new () => SRInstance;
    webkitSpeechRecognition: new () => SRInstance;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const MOOD_KEY = (c: Character) => `soul-mate-mood-${c}`;
function loadMood(c: Character): MoodEntry[] {
  try { return JSON.parse(localStorage.getItem(MOOD_KEY(c)) ?? '[]') as MoodEntry[]; }
  catch { return []; }
}

const SENT_END = /[。！？…!?\n]/;

// ── Waveform ─────────────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  const bars = [4, 7, 12, 9, 14, 8, 11, 6, 13, 10, 7, 12];
  return (
    <div className={`flex items-end gap-[3px] h-8 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
      {bars.map((h, i) => (
        <div key={i} className="w-1 rounded-full bg-white"
          style={{
            height: `${h}px`,
            animation: active ? `waveBar 0.6s ease-in-out infinite alternate` : 'none',
            animationDelay: `${i * 0.05}s`,
          }} />
      ))}
    </div>
  );
}

// ── Voice selection ──────────────────────────────────────────────────────────
function pickVoice(character: Character, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const zh = voices.filter(v => v.lang.startsWith('zh'));
  if (!zh.length) return null;
  if (character === 'mia') {
    return (
      zh.find(v => /Mei-Jia|HsiaoChun|Tingting|Ting-Ting|Yaoyao/i.test(v.name)) ||
      zh.find(v => v.lang === 'zh-TW' && /female|woman/i.test(v.name)) ||
      zh.find(v => v.lang === 'zh-TW') ||
      zh.find(v => v.lang === 'zh-CN' && /female|woman/i.test(v.name)) ||
      zh.find(v => v.lang === 'zh-CN') ||
      zh[zh.length - 1]
    );
  }
  return (
    zh.find(v => /Yu-shu|Yushu|YunJhe|Kangkang|Yunxi/i.test(v.name)) ||
    zh.find(v => /male|man/i.test(v.name)) ||
    zh.find(v => v.lang === 'zh-TW') ||
    zh[0]
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ChatWindow({ character }: { character: Character }) {
  const cfg = CHARACTERS[character];
  const sessionId = useId();

  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const [emotion, setEmotion]     = useState<Emotion>('未知');
  const [avatar, setAvatar]       = useState<AvatarState>('idle');
  const [panelOpen, setPanel]     = useState(false);
  const [voiceOn, setVoiceOn]     = useState(true);   // always-on by default
  const [listening, setListening] = useState(false);
  const [speechOK, setSpeechOK]   = useState(false);
  const [showMed, setShowMed]     = useState(false);
  const [apiError, setApiError]   = useState('');
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioUnlockedRef = useRef(false);

  const recogRef       = useRef<SRInstance | null>(null);
  const ttsQueue       = useRef<string[]>([]);
  const ttsBusy        = useRef(false);
  const currentAudio   = useRef<HTMLAudioElement | null>(null);
  const sentBuf        = useRef('');
  const voiceOnRef     = useRef(true);
  const listeningRef   = useRef(false);
  const streamingRef   = useRef(false);
  const streamAbort    = useRef<AbortController | null>(null);
  const sendMsgRef     = useRef<((text: string) => void) | null>(null);
  const recognizedText = useRef('');
  const restartTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => { voiceOnRef.current = voiceOn; }, [voiceOn]);
  useEffect(() => { listeningRef.current = listening; }, [listening]);
  useEffect(() => { streamingRef.current = streaming; }, [streaming]);

  // ── iOS audio unlock via silent Audio element ────────────────────────────
  useEffect(() => {
    const unlock = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      setAudioUnlocked(true);
      // Play a silent audio blob to unlock HTMLAudioElement on iOS
      const silence = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
      silence.play().catch(() => {});
    };
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('click', unlock, { once: true });
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);

  // ── TTS via server-side audio (works on iOS) ─────────────────────────────
  const drainTTS = useCallback(() => {
    if (ttsBusy.current || ttsQueue.current.length === 0) return;
    const text = ttsQueue.current.shift()!;
    ttsBusy.current = true;

    const lang = 'zh-TW';
    const src = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
    const audio = new Audio(src);
    audio.playbackRate = character === 'leo' ? 1.05 : 0.92;
    currentAudio.current = audio;

    audio.onplay  = () => setAvatar('talking');
    audio.onended = () => {
      ttsBusy.current = false;
      currentAudio.current = null;
      if (ttsQueue.current.length > 0) {
        drainTTS();
      } else {
        setAvatar('idle');
        if (voiceOnRef.current && !listeningRef.current) scheduleRestart(300);
      }
    };
    audio.onerror = () => {
      ttsBusy.current = false;
      currentAudio.current = null;
      drainTTS();
    };
    audio.play().catch(() => {
      ttsBusy.current = false;
      currentAudio.current = null;
    });
  }, [character]);

  function enqueueTTS(text: string) {
    if (!voiceOnRef.current) return;
    ttsQueue.current.push(text);
    drainTTS();
  }

  function stopTTS() {
    ttsQueue.current = [];
    ttsBusy.current = false;
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current = null;
    }
  }

  // ── Speech recognition ───────────────────────────────────────────────────
  function scheduleRestart(ms = 400) {
    if (restartTimer.current) clearTimeout(restartTimer.current);
    restartTimer.current = setTimeout(() => {
      if (voiceOnRef.current && !listeningRef.current) {
        startListening();
      }
    }, ms);
  }

  function startListening() {
    const r = recogRef.current;
    if (!r || listeningRef.current) return;
    recognizedText.current = '';
    try {
      r.start();
      setListening(true);
      listeningRef.current = true;
      setAvatar('listening');
    } catch { /* already running */ }
  }

  function stopListening() {
    const r = recogRef.current;
    if (!r) return;
    try { r.stop(); } catch { /* */ }
    setListening(false);
    listeningRef.current = false;
    setAvatar('idle');
  }

  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    setSpeechOK(true);

    const rec = new SR();
    rec.lang = 'zh-TW';
    rec.interimResults = true;
    rec.continuous = false;   // restart manually for reliability
    rec.maxAlternatives = 1;

    rec.onresult = (e: SREvent) => {
      // If user starts speaking while TTS is running → interrupt immediately
      if (ttsBusy.current || ttsQueue.current.length > 0) {
        stopTTS();
        if (streamAbort.current) { streamAbort.current.abort(); streamAbort.current = null; }
      }

      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      recognizedText.current = transcript;
      setInput(transcript);
    };

    rec.onend = () => {
      setListening(false);
      listeningRef.current = false;

      const text = recognizedText.current.trim();
      recognizedText.current = '';
      setInput('');

      if (text) {
        setAvatar('idle');
        sendMsgRef.current?.(text);
      } else {
        setAvatar('idle');
        // Nothing was said — restart listening right away
        if (voiceOnRef.current) scheduleRestart(300);
      }
    };

    rec.onerror = () => {
      setListening(false);
      listeningRef.current = false;
      setAvatar('idle');
      if (voiceOnRef.current) scheduleRestart(600);
    };

    recogRef.current = rec;

    // Auto-start when component mounts if voiceOn is true
    scheduleRestart(500);

    return () => {
      voiceOnRef.current = false;
      if (restartTimer.current) clearTimeout(restartTimer.current);
      try { rec.abort(); } catch { /* */ }
      ttsQueue.current = [];
      ttsBusy.current = false;
      if (currentAudio.current) { currentAudio.current.pause(); currentAudio.current = null; }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    voiceOnRef.current = next;
    if (!next) {
      stopTTS();
      stopListening();
      if (restartTimer.current) clearTimeout(restartTimer.current);
    } else {
      scheduleRestart(300);
    }
  }

  function toggleMic() {
    if (listeningRef.current) {
      stopListening();
    } else {
      // Interrupt AI if speaking
      stopTTS();
      if (streamAbort.current) { streamAbort.current.abort(); streamAbort.current = null; }
      startListening();
    }
  }

  useEffect(() => {
    if (panelOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, panelOpen]);

  // ── Log ──────────────────────────────────────────────────────────────────
  async function logConv(msgs: Message[]) {
    try {
      await fetch('/api/log', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, character, messages: msgs.map(m => ({ role: m.role, content: m.content })) }),
      });
    } catch { /* */ }
  }

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMsg = useCallback(async (textArg?: string) => {
    const text = (textArg ?? input).trim();
    if (!text) return;

    stopTTS();
    setInput('');
    setApiError('');
    if (detectStressKeywords(text)) setShowMed(true);

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => { const n = [...prev, userMsg]; logConv(n); return n; });
    setStreaming(true);
    streamingRef.current = true;

    const aid = crypto.randomUUID();
    sentBuf.current = ''; ttsQueue.current = [];
    setMessages(prev => [...prev, { id: aid, role: 'assistant', content: '', timestamp: new Date() }]);

    const abort = new AbortController();
    streamAbort.current = abort;

    // Detect emotion in background
    fetch('/api/emotion', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      .then(r => r.json())
      .then(d => { if (d.emotion) setEmotion(d.emotion); })
      .catch(() => { /* */ });

    try {
      const history = messages.concat(userMsg).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, character, emotion }),
        signal: abort.signal,
      });
      if (!res.body) throw new Error('no body');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6).trim();
          if (d === '[DONE]') break;
          try {
            const parsed = JSON.parse(d) as { text?: string; error?: string };
            if (parsed.error) {
              const errMsg = parsed.error === 'NO_API_KEY'
                ? '⚠️ 尚未設定 Groq API Key'
                : `⚠️ ${parsed.error}`;
              setApiError(errMsg);
              setMessages(prev => prev.map(m => m.id === aid ? { ...m, content: errMsg } : m));
              break;
            }
            if (!parsed.text) continue;

            sentBuf.current += parsed.text;
            if (SENT_END.test(sentBuf.current) && sentBuf.current.trim().length > 3) {
              const idx = sentBuf.current.search(SENT_END);
              const sentence = sentBuf.current.slice(0, idx + 1).trim();
              sentBuf.current = sentBuf.current.slice(idx + 1);
              if (sentence) enqueueTTS(sentence);
            }

            setMessages(prev => prev.map(m =>
              m.id === aid ? { ...m, content: m.content + parsed.text } : m
            ));
          } catch { /* */ }
        }
      }

      if (sentBuf.current.trim()) { enqueueTTS(sentBuf.current.trim()); sentBuf.current = ''; }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setMessages(prev => prev.filter(m => !(m.id === aid && m.content === '')));
        return;
      }
      const msg = err instanceof Error ? err.message : '連線錯誤';
      setApiError(msg);
      setMessages(prev => prev.map(m => m.id === aid ? { ...m, content: `⚠️ ${msg}` } : m));
    } finally {
      streamAbort.current = null;
      setStreaming(false);
      streamingRef.current = false;
      if (!ttsBusy.current && ttsQueue.current.length === 0) {
        setAvatar('idle');
      }
      setMessages(prev => { logConv(prev); return prev; });
    }
  }, [character, emotion, input, messages, enqueueTTS]);

  // Keep sendMsgRef updated
  useEffect(() => { sendMsgRef.current = sendMsg; }, [sendMsg]);

  const statusText: Record<AvatarState, string> = {
    idle: '', talking: `${cfg.name} 正在說話`, listening: '正在聆聽…',
  };

  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="relative h-screen w-screen overflow-hidden">

      <CharacterAvatar character={character} state={avatar} className="absolute inset-0" />

      {/* iOS audio unlock prompt */}
      {isIOS && !audioUnlocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(8,10,28,0.82)', backdropFilter: 'blur(8px)' }}>
          <div className="text-center px-8">
            <div className="text-5xl mb-4">🔊</div>
            <p className="text-white text-lg font-semibold mb-2">點一下開始</p>
            <p className="text-white/60 text-sm">iOS 需要你先點擊才能播放聲音</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35 pointer-events-none" />

      {apiError && (
        <div className="absolute top-16 left-4 right-4 z-50 bg-red-900/90 backdrop-blur text-white text-xs rounded-xl px-4 py-3 border border-red-500/50 animate-slide-up">
          <strong>⚠️ 錯誤：</strong> {apiError}
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors drop-shadow font-semibold">
          <ArrowLeft size={20} />
          <span className="text-sm">Soul Mate</span>
        </Link>

        <div className="flex items-center gap-2">
          {speechOK && (
            <button onClick={toggleVoice} title={voiceOn ? '關閉語音模式' : '開啟語音模式'}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${voiceOn ? 'bg-white/25 text-white shadow-lg' : 'bg-black/20 text-white/70 hover:text-white'}`}>
              {voiceOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          )}
          <button onClick={() => setPanel(p => !p)} title="對話紀錄"
            className={`p-2 rounded-full backdrop-blur-sm transition-all ${panelOpen ? 'bg-white/25 text-white shadow-lg' : 'bg-black/20 text-white/70 hover:text-white'}`}>
            <MessageSquare size={18} />
          </button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-10 gap-3">
        <Waveform active={avatar === 'talking'} />

        <div className="h-5 text-center">
          {avatar !== 'idle' && (
            <span className="text-white/90 text-sm font-medium drop-shadow animate-fade">
              {avatar === 'listening' ? '🎙 ' : '💬 '}{statusText[avatar]}
            </span>
          )}
        </div>

        {speechOK && (
          <button onClick={toggleMic}
            className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all
              ${listening
                ? 'bg-red-500 scale-110'
                : voiceOn
                  ? 'bg-white/25 backdrop-blur border-2 border-white/50 hover:scale-105'
                  : 'bg-white/15 backdrop-blur border border-white/30 hover:bg-white/25 hover:scale-105'}`}
            style={{ width: '68px', height: '68px' }}>
            {listening && <span className="absolute inset-0 rounded-full bg-red-400/50 animate-ping" />}
            {listening
              ? <MicOff size={26} className="text-white relative z-10" />
              : <Mic size={26} className="text-white relative z-10" />}
          </button>
        )}

        <p className="text-white/40 text-xs drop-shadow text-center">
          {voiceOn
            ? listening
              ? '說完後自動送出 · 或點麥克風取消'
              : '全程聆聽中 · 說話即可，隨時可打斷'
            : '語音已關閉，點麥克風或使用文字輸入'}
        </p>
      </div>

      {/* Slide tab */}
      {!panelOpen && (
        <button onClick={() => setPanel(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-20 bg-black/30 backdrop-blur rounded-l-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-black/50 transition-all">
          <ChevronLeft size={14} />
        </button>
      )}

      {/* Chat panel */}
      <div className={`absolute top-0 right-0 h-full z-30 flex transition-transform duration-300 ease-out
        ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 'min(360px, 100vw)' }}>

        {panelOpen && (
          <button onClick={() => setPanel(false)}
            className="flex-shrink-0 self-center -ml-8 w-8 h-16 bg-black/40 backdrop-blur-md rounded-l-xl flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="flex-1 flex flex-col bg-black/70 backdrop-blur-xl border-l border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
            <span className="text-white font-semibold text-sm">{cfg.name} · 對話紀錄</span>
            <button onClick={() => setPanel(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-white/30 text-sm mt-10">開始說話，對話紀錄會出現在這裡</p>
            )}
            {messages.map(msg => (
              <div key={msg.id}
                className={`flex gap-2 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-white/15 text-white rounded-tr-sm'
                    : 'bg-white/8 text-white/90 rounded-tl-sm border border-white/10'}`}>
                  {msg.content || (
                    <span className="flex gap-1">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/10 px-3 py-3 flex-shrink-0">
            <div className="flex items-end gap-2">
              {speechOK && (
                <button onClick={toggleMic}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all
                    ${listening ? 'bg-red-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {listening ? <MicOff size={14} /> : <Mic size={14} />}
                </button>
              )}
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                placeholder={`和 ${cfg.name} 說說心情…`}
                rows={1}
                className="flex-1 resize-none rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 max-h-24 overflow-y-auto"
              />
              <button onClick={() => sendMsg()} disabled={!input.trim()}
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-40
                  ${character === 'leo' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMed && <MeditationModal onClose={() => setShowMed(false)} />}
    </div>
  );
}
