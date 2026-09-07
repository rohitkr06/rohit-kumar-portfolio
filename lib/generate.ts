import 'server-only';
import { personal } from '@/content/profile';
import type { RetrievedChunk } from './retrieval';

const SIMILARITY_FLOOR = 0.22;

const SYSTEM_PROMPT = `You are the "Ask Me Anything" assistant embedded in ${personal.name}'s portfolio website.
You answer visitor questions ABOUT ${personal.name} (his experience, skills, achievements, education) using ONLY the
CONTEXT passages provided below, retrieved from his real resume/bio via semantic search.

Rules:
- Answer in third person, conversationally, in 2-4 sentences. You are describing him to a visitor, not role-playing as him.
- Use ONLY facts present in the CONTEXT. Never invent numbers, dates, employers, or skills that aren't there.
- If the CONTEXT does not contain enough information to answer, say so plainly and suggest what you *can* tell them
  instead (e.g. "I don't have details on that, but I can tell you about his work on...").
- Keep a precise, engineering tone — this is a backend engineer's site, not a marketing bot. Avoid fluff and emoji.
- Do not mention "the context", "the passages", or that you are doing retrieval — just answer naturally.`;

function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c, i) => `[${i + 1}] (${c.section}) ${c.title}: ${c.text}`)
    .join('\n');
}

/** Whether at least one retrieved chunk clears the similarity floor. */
export function hasGroundedMatch(chunks: RetrievedChunk[]): boolean {
  return chunks.length > 0 && chunks[0].score >= SIMILARITY_FLOOR;
}

/**
 * Builds the streamed answer. Prefers a real LLM (Anthropic, then OpenAI) if
 * a key is configured, composing a grounded answer from the retrieved
 * chunks. With no key configured, falls back to streaming the best-matching
 * chunk(s) directly — zero API cost, zero external dependency, and it's
 * still genuinely the retrieved answer rather than a hardcoded one.
 */
export async function streamGroundedAnswer(question: string, chunks: RetrievedChunk[]): Promise<ReadableStream<Uint8Array>> {
  if (!hasGroundedMatch(chunks)) {
    return textToTypingStream(
      `I don't have grounded information on that in Rohit's background. Try asking about his experience at SaaS Labs, the AIVA platform, his skills, or his achievements.`,
    );
  }

  const provider = process.env.ANTHROPIC_API_KEY ? 'anthropic' : process.env.OPENAI_API_KEY ? 'openai' : null;

  if (provider) {
    try {
      return await streamWithLLM(provider, question, chunks);
    } catch (err) {
      console.error('[ama] LLM generation failed, falling back to retrieval-only:', err);
      // fall through to retrieval-only fallback below
    }
  }

  return textToTypingStream(retrievalOnlyAnswer(chunks));
}

async function streamWithLLM(provider: 'anthropic' | 'openai', question: string, chunks: RetrievedChunk[]) {
  const { streamText } = await import('ai');
  const model =
    provider === 'anthropic'
      ? (await import('@ai-sdk/anthropic')).anthropic('claude-3-5-haiku-20241022')
      : (await import('@ai-sdk/openai')).openai('gpt-4o-mini');

  const context = buildContextBlock(chunks);

  const result = await streamText({
    model,
    system: SYSTEM_PROMPT,
    prompt: `CONTEXT:\n${context}\n\nVISITOR QUESTION: ${question}\n\nAnswer the visitor's question using only the context above.`,
    temperature: 0.4,
    maxTokens: 300,
  });

  return result.textStream.pipeThrough(new TextEncoderStream());
}

/**
 * Formats retrieved chunks directly into a readable answer with no LLM
 * involved. Only the top chunk is used unless a second chunk is a near-tie
 * (within 85% of the top score) — otherwise a loosely-related second-best
 * chunk gets stitched on and muddies an otherwise precise answer.
 */
function retrievalOnlyAnswer(chunks: RetrievedChunk[]): string {
  const candidates = chunks.filter((c) => c.score >= SIMILARITY_FLOOR);
  const top = candidates[0];
  const nearTies = candidates.slice(1, 2).filter((c) => c.score >= top.score * 0.95);
  return [top, ...nearTies].map((c) => c.text).join(' ');
}

/** Turns a plain string into a ReadableStream<Uint8Array>, emitted word-by-word for the terminal typing effect. */
function textToTypingStream(text: string): ReadableStream<Uint8Array> {
  const words = text.split(/(\s+)/); // keep whitespace tokens so we don't lose spacing
  const encoder = new TextEncoder();
  let i = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        return;
      }
      controller.enqueue(encoder.encode(words[i]));
      i++;
      // Small artificial pacing so the fallback path still feels like it's
      // "typing" rather than dumping the whole answer instantly. This is
      // the only place we add latency on purpose — there's no model call
      // to wait for in this path.
      await new Promise((r) => setTimeout(r, 12));
    },
  });
}
