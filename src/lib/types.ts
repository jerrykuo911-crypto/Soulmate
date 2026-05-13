export type Character = 'leo' | 'mia';

export type Emotion = '憂鬱' | '焦慮' | '憤怒' | '開心' | '平靜' | '孤獨' | '壓力' | '未知';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: Emotion;
}

export interface MoodEntry {
  timestamp: number;
  emotion: Emotion;
  score: number;
  character: Character;
}

export interface CharacterConfig {
  name: string;
  title: string;
  description: string;
  trait: string;
  color: string;
  gradient: string;
  textColor: string;
  avatar: string;
}
