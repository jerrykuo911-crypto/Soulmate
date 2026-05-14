import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text') ?? '';
  const lang = req.nextUrl.searchParams.get('lang') ?? 'zh-TW';

  if (!text.trim()) return new NextResponse('missing text', { status: 400 });

  const url =
    `https://translate.google.com/translate_tts` +
    `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob&ttsspeed=1`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
    },
    signal: AbortSignal.timeout(5000),
  }).catch(() => null);

  if (!res || !res.ok) return new NextResponse('TTS fetch failed', { status: 502 });

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
