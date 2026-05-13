'use client';

import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface MeditationModalProps {
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASES: { phase: Phase; label: string; duration: number }[] = [
  { phase: 'inhale', label: '吸氣...', duration: 4000 },
  { phase: 'hold',   label: '屏住...', duration: 2000 },
  { phase: 'exhale', label: '呼氣...', duration: 4000 },
  { phase: 'rest',   label: '休息...', duration: 2000 },
];

export default function MeditationModal({ onClose }: MeditationModalProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [round, setRound] = useState(1);
  const totalRounds = 3;

  const advance = useCallback(() => {
    setPhaseIndex(prev => {
      const next = (prev + 1) % PHASES.length;
      if (next === 0) setRound(r => r + 1);
      return next;
    });
  }, []);

  useEffect(() => {
    if (round > totalRounds) return;
    const timer = setTimeout(advance, PHASES[phaseIndex].duration);
    return () => clearTimeout(timer);
  }, [phaseIndex, round, advance]);

  const current = PHASES[phaseIndex];
  const isExpanding = current.phase === 'inhale' || current.phase === 'hold';
  const done = round > totalRounds;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade">
      <div className="relative w-80 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="mb-2 text-lg font-semibold text-white">🌬️ 呼吸冥想</h2>
        <p className="mb-8 text-sm text-white/60">跟著節奏，讓自己平靜下來</p>

        {!done ? (
          <>
            <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center">
              <div
                className={`absolute rounded-full bg-white/10 transition-all ease-in-out ${
                  isExpanding ? 'h-40 w-40 opacity-100' : 'h-20 w-20 opacity-60'
                }`}
                style={{ transitionDuration: `${PHASES[phaseIndex].duration}ms` }}
              />
              <div
                className={`absolute rounded-full bg-white/20 transition-all ease-in-out ${
                  isExpanding ? 'h-28 w-28' : 'h-14 w-14'
                }`}
                style={{ transitionDuration: `${PHASES[phaseIndex].duration}ms` }}
              />
              <span className="relative text-4xl">
                {current.phase === 'inhale' || current.phase === 'hold' ? '🌸' : '🌿'}
              </span>
            </div>

            <p className="mb-2 text-2xl font-light text-white">{current.label}</p>
            <p className="text-sm text-white/50">第 {Math.min(round, totalRounds)} / {totalRounds} 輪</p>
          </>
        ) : (
          <div className="py-8">
            <div className="mb-4 text-5xl">✨</div>
            <p className="mb-2 text-xl font-medium text-white">很棒，你做到了</p>
            <p className="mb-6 text-sm text-white/60">現在感覺好一點了嗎？</p>
            <button
              onClick={onClose}
              className="rounded-full bg-white/20 px-6 py-2 text-white hover:bg-white/30 transition-colors"
            >
              繼續對話
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
