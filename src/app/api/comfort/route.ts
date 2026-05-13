import { NextRequest, NextResponse } from 'next/server';
import { createGroq, CHAT_MODEL } from '@/lib/groqClient';
import type { Character, Emotion } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { character, emotion, recentContext } = await req.json() as {
    character: Character; emotion: Emotion; recentContext: string;
  };

  const name  = character === 'leo' ? 'Leo' : 'Mia';
  const style = character === 'leo' ? '穩重溫暖、有力量感' : '溫柔細膩、充滿愛意';

  try {
    const groq = createGroq();
    const res = await groq.chat.completions.create({
      model: CHAT_MODEL,
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `你是 ${name}，用${style}的語氣，生成一段50字以內的溫暖鼓勵小語。用繁體中文，語氣真誠自然。`,
        },
        {
          role: 'user',
          content: `情緒：${emotion}\n對話：${recentContext}\n請給安慰小語。`,
        },
      ],
    });

    const message = res.choices[0]?.message?.content ?? '你不是一個人，我一直在這裡陪著你。';
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ message: '你不是一個人，我一直在這裡陪著你。' });
  }
}
