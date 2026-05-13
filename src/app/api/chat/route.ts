import { NextRequest } from 'next/server';
import { createGroq, CHAT_MODEL } from '@/lib/groqClient';
import { getSystemPrompt } from '@/lib/systemPrompts';
import type { Character, Emotion } from '@/lib/types';

export async function POST(req: NextRequest) {
  const { messages, character, emotion } = await req.json() as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    character: Character;
    emotion: Emotion;
  };

  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (data: string) => ctrl.enqueue(enc.encode(`data: ${data}\n\n`));

      try {
        const groq = createGroq();
        const systemPrompt = getSystemPrompt(character, emotion);

        const groqStream = await groq.chat.completions.create({
          model: CHAT_MODEL,
          max_tokens: 1024,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
        });

        for await (const chunk of groqStream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) send(JSON.stringify({ text }));
        }

        send('[DONE]');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        send(JSON.stringify({ error: msg === 'NO_API_KEY' ? 'NO_API_KEY' : msg }));
      }

      ctrl.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
