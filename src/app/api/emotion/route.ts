import { NextRequest, NextResponse } from 'next/server';
import { createGroq, FAST_MODEL } from '@/lib/groqClient';
import type { Emotion } from '@/lib/types';

const VALID: Emotion[] = ['憂鬱', '焦慮', '憤怒', '開心', '平靜', '孤獨', '壓力', '未知'];

export async function POST(req: NextRequest) {
  const { text } = await req.json() as { text: string };

  try {
    const groq = createGroq();
    const res = await groq.chat.completions.create({
      model: FAST_MODEL,
      max_tokens: 10,
      messages: [
        {
          role: 'system',
          content: `你是情緒分析助手。根據使用者的文字，判斷其主要情緒。
只能回答以下其中一個詞（不要加任何其他文字）：
憂鬱、焦慮、憤怒、開心、平靜、孤獨、壓力、未知`,
        },
        { role: 'user', content: text },
      ],
    });

    const raw = res.choices[0]?.message?.content?.trim() ?? '未知';
    const emotion: Emotion = VALID.includes(raw as Emotion) ? (raw as Emotion) : '未知';
    return NextResponse.json({ emotion });
  } catch {
    return NextResponse.json({ emotion: '未知' });
  }
}
