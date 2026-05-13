import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface LogEntry {
  sessionId: string;
  character: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
}

export async function POST(req: NextRequest) {
  const body = await req.json() as LogEntry;

  const dir = path.join(process.cwd(), 'data', 'conversations');
  fs.mkdirSync(dir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const file = path.join(dir, `${today}-${body.character}.jsonl`);
  const line = JSON.stringify({ ...body, timestamp: Date.now() }) + '\n';

  fs.appendFileSync(file, line, 'utf8');
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const dir = path.join(process.cwd(), 'data', 'conversations');
  if (!fs.existsSync(dir)) return NextResponse.json({ sessions: [] });

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsonl')).sort().reverse();
  const sessions: LogEntry[] = [];

  for (const file of files.slice(0, 10)) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    content.trim().split('\n').filter(Boolean).forEach(line => {
      try { sessions.push(JSON.parse(line) as LogEntry); } catch { /* skip */ }
    });
  }

  return NextResponse.json({ sessions: sessions.slice(0, 50) });
}
