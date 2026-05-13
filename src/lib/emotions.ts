import type { Emotion } from './types';

export const EMOTION_CONFIG: Record<Emotion, {
  emoji: string;
  label: string;
  color: string;
  bg: string;
  score: number;
}> = {
  '開心': { emoji: '😊', label: '開心', color: 'text-yellow-600', bg: 'bg-yellow-100', score: 9 },
  '平靜': { emoji: '😌', label: '平靜', color: 'text-green-600', bg: 'bg-green-100', score: 7 },
  '壓力': { emoji: '😤', label: '壓力', color: 'text-orange-600', bg: 'bg-orange-100', score: 4 },
  '焦慮': { emoji: '😰', label: '焦慮', color: 'text-amber-600', bg: 'bg-amber-100', score: 3 },
  '孤獨': { emoji: '🥺', label: '孤獨', color: 'text-purple-600', bg: 'bg-purple-100', score: 3 },
  '憤怒': { emoji: '😠', label: '憤怒', color: 'text-red-600', bg: 'bg-red-100', score: 2 },
  '憂鬱': { emoji: '😢', label: '憂鬱', color: 'text-blue-600', bg: 'bg-blue-100', score: 1 },
  '未知': { emoji: '💭', label: '...',  color: 'text-gray-500', bg: 'bg-gray-100', score: 5 },
};

export const STRESS_KEYWORDS = [
  '受不了', '好累', '快崩潰', '崩潰了', '撐不住', '不想活',
  '太累了', '好煩', '要瘋了', '崩潰', '壓垮', '喘不過氣',
  '撐不下去', '活不下去', '放棄了', '不想了',
];

export function detectStressKeywords(text: string): boolean {
  return STRESS_KEYWORDS.some(kw => text.includes(kw));
}
