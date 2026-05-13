'use client';

import { useState } from 'react';
import { Heart, X } from 'lucide-react';
import type { Character, Emotion } from '@/lib/types';

interface ComfortBoxProps {
  character: Character;
  emotion: Emotion;
  recentContext: string;
  colorClass: string;
}

export default function ComfortBox({ character, emotion, recentContext, colorClass }: ComfortBoxProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function open_comfort() {
    if (loading) return;
    setOpen(true);
    if (message) return;
    setLoading(true);
    try {
      const res = await fetch('/api/comfort', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character, emotion, recentContext }),
      });
      const data = await res.json() as { message: string };
      setMessage(data.message);
    } catch {
      setMessage('你不是一個人，我一直在這裡陪著你。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={open_comfort}
        title="心靈安慰盒"
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r ${colorClass} animate-pulse-slow shadow-lg hover:scale-105 transition-transform`}
      >
        <Heart size={14} />
        <span>安慰盒</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">💝</span>
                <span className="font-semibold text-gray-700">心靈安慰盒</span>
              </div>
              <button
                onClick={() => { setOpen(false); setMessage(''); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 py-4 text-gray-500">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">準備一段話給你…</span>
              </div>
            ) : (
              <p className="leading-relaxed text-gray-700">{message}</p>
            )}
          </div>
          <div
            className="absolute inset-0 -z-10"
            onClick={() => { setOpen(false); setMessage(''); }}
          />
        </div>
      )}
    </>
  );
}
