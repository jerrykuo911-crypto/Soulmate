'use client';

import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { MoodEntry } from '@/lib/types';
import { EMOTION_CONFIG } from '@/lib/emotions';

interface MoodChartProps {
  entries: MoodEntry[];
  color: string;
}

export default function MoodChart({ entries, color }: MoodChartProps) {
  const data = useMemo(() => {
    const last7days: { day: string; score: number | null; emotion: string }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayEntries = entries.filter(e => {
        const ed = new Date(e.timestamp);
        return ed.getDate() === d.getDate() && ed.getMonth() === d.getMonth();
      });
      if (dayEntries.length > 0) {
        const avg = dayEntries.reduce((s, e) => s + e.score, 0) / dayEntries.length;
        const lastEmotion = dayEntries[dayEntries.length - 1].emotion;
        last7days.push({ day: label, score: Math.round(avg * 10) / 10, emotion: lastEmotion });
      } else {
        last7days.push({ day: label, score: null, emotion: '未知' });
      }
    }
    return last7days;
  }, [entries]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: { emotion: string } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && payload[0].value !== null) {
      const emotion = payload[0].payload.emotion as keyof typeof EMOTION_CONFIG;
      const cfg = EMOTION_CONFIG[emotion] ?? EMOTION_CONFIG['未知'];
      return (
        <div className="rounded-xl bg-white px-3 py-2 shadow-lg border border-gray-100">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-medium">{cfg.emoji} {cfg.label}</p>
          <p className="text-xs text-gray-400">心情分數 {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center text-sm text-gray-400">
        開始對話後，這裡會顯示你的心情趨勢 📈
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
