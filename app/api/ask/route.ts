import { NextRequest } from 'next/server';
import { retrieveRelevantChunks } from '@/lib/retrieval';
import { streamGroundedAnswer } from '@/lib/generate';

// @xenova/transformers needs Node APIs (fs, onnxruntime-node/wasm) — not edge-compatible.
export const runtime = 'nodejs';
// Every question needs a fresh embedding + similarity search; nothing here should be cached.
export const dynamic = 'force-dynamic';

const MAX_QUESTION_LENGTH = 300;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const question = typeof (body as any)?.question === 'string' ? (body as any).question.trim() : '';

  if (!question) {
    return new Response('Missing "question" field', { status: 400 });
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    return new Response(`Question too long (max ${MAX_QUESTION_LENGTH} characters)`, { status: 413 });
  }

  try {
    const chunks = await retrieveRelevantChunks(question, 4);
    const stream = await streamGroundedAnswer(question, chunks);

    const sources = chunks
      .filter((c) => c.score >= 0.22)
      .slice(0, 3)
      .map((c) => ({ id: c.id, title: c.title, section: c.section, score: Number(c.score.toFixed(3)) }));

    const sourcesHeader = Buffer.from(JSON.stringify(sources), 'utf-8').toString('base64');

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Retrieved-Sources': sourcesHeader,
      },
    });
  } catch (err) {
    console.error('[api/ask] Failed to answer question:', err);
    return new Response('Something went wrong answering that question. Please try again.', { status: 500 });
  }
}
