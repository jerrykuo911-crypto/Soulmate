import Groq from 'groq-sdk';

export const CHAT_MODEL    = 'llama-3.3-70b-versatile';
export const FAST_MODEL    = 'llama-3.1-8b-instant';   // 情緒偵測用，速度快

export function createGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('NO_API_KEY');
  return new Groq({ apiKey });
}
