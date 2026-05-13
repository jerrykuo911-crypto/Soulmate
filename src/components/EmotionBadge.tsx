'use client';

import { EMOTION_CONFIG } from '@/lib/emotions';
import type { Emotion } from '@/lib/types';

interface EmotionBadgeProps {
  emotion: Emotion;
}

export default function EmotionBadge({ emotion }: EmotionBadgeProps) {
  if (emotion === '未知') return null;
  const cfg = EMOTION_CONFIG[emotion];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} animate-fade`}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
