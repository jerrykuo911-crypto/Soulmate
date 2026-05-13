import type { CharacterConfig } from './types';

export const CHARACTERS: Record<'leo' | 'mia', CharacterConfig> = {
  leo: {
    name: 'Leo',
    title: '可靠的他',
    description: '理性分析、具體建議、溫柔陪伴。\n讓你在迷霧中找到方向。',
    trait: '穩定 · 理性 · 溫暖',
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-600',
    textColor: 'text-indigo-600',
    avatar: '🌊',
  },
  mia: {
    name: 'Mia',
    title: '溫柔的她',
    description: '強烈情感共鳴、深度傾聽。\n讓你感受到被這個世界接住。',
    trait: '溫柔 · 共情 · 細心',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    textColor: 'text-rose-600',
    avatar: '🌸',
  },
};
