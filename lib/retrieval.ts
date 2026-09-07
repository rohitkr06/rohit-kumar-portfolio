import 'server-only';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { tokenize, bm25Score, normalizeScore, HASHING_DIMENSIONS, HASHING_MODEL_ID, type Bm25Stats, type SparseVector } from './hashing-embedder';

export type EmbeddedChunk = {
  id: string;
  section: string;
  title: string;
  text: string;
  /** Present when the index was built with the neural model. */
  embedding?: number[];
  /** Present when the index was built with the hashed-BM25 fallback. Sparse: see SparseVector. */
  termVector?: SparseVector;
  docLength?: number;
};

type EmbeddingsFile = {
  model: string;
  dimensions: number;
  /** Only present when `model` is the hashed-BM25 fallback. */
  bm25?: Bm25Stats;
  generatedAt: string;
  chunks: EmbeddedChunk[];
};

let cachedIndex: EmbeddingsFile | null = null;

/** Loads the pre-built index (data/embeddings.json), memoized per server instance. */
async function loadIndex(): Promise<EmbeddingsFile> {
  if (cachedIndex) return cachedIndex;
  const filePath = path.join(process.cwd(), 'data', 'embeddings.json');
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch {
    throw new Error(
      'data/embeddings.json not found. Run "npm run embeddings:build" first to generate the Ask-Me-Anything retrieval index.',
    );
  }
  cachedIndex = JSON.parse(raw) as EmbeddingsFile;
  return cachedIndex;
}

// The feature-extraction pipeline is fairly heavy to initialize (it loads
// and runs an ONNX model), so we keep a single instance alive for the
// lifetime of the server process / serverless instance rather than
// re-creating it per request. First request after a cold start pays the
// model-load cost (~1-2s); subsequent requests on a warm instance are fast.
let extractorPromise: Promise<any> | null = null;
let extractorFailed = false;

async function getExtractor() {
  if (extractorFailed) return null;
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers');
      env.cacheDir = path.join(process.cwd(), '.cache', 'transformers');
      env.allowRemoteModels = true;
      return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
    })().catch((err) => {
      extractorFailed = true;
      console.warn('[retrieval] Neural embedder unavailable at query time:', err?.message ?? err);
      return null;
    });
  }
  return extractorPromise;
}

async function embedQueryNeural(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  if (!extractor) {
    throw new Error(
      'Index was built with the neural model but it could not be loaded at query time. ' +
        'Re-run "npm run embeddings:build" without network access to switch to the hashed-BM25 fallback end-to-end.',
    );
  }
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data as Float32Array);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // Both vectors are already L2-normalized at embedding time, so the dot
  // product IS cosine similarity — no need to divide by magnitudes.
  return dot;
}

export type RetrievedChunk = Pick<EmbeddedChunk, 'id' | 'section' | 'title' | 'text'> & { score: number };

/**
 * Embeds/scores `query` against the pre-built index and returns the top-k
 * most relevant chunks, brute-force. This is intentionally simple: with a
 * few dozen entries, a full scan is sub-millisecond and a real vector
 * database (Pinecone/pgvector/etc.) would add operational overhead with
 * zero latency or accuracy benefit at this scale.
 *
 * Two backends, matching whichever built data/embeddings.json:
 *  - neural: dense MiniLM sentence vectors, ranked by cosine similarity.
 *  - hashed-BM25 fallback: ranked by Okapi BM25 over hashed term buckets,
 *    normalized into (0,1) for a threshold/display score comparable in
 *    spirit to the neural path's cosine score.
 */
export async function retrieveRelevantChunks(query: string, topK = 3): Promise<RetrievedChunk[]> {
  const index = await loadIndex();

  if (index.model === HASHING_MODEL_ID) {
    if (!index.bm25) throw new Error('Hashed-BM25 index is missing its corpus statistics.');
    const queryTokens = tokenize(query);
    const scored: RetrievedChunk[] = index.chunks.map((chunk) => {
      const raw = bm25Score(queryTokens, chunk.termVector ?? {}, chunk.docLength ?? 0, index.bm25!, HASHING_DIMENSIONS);
      return { id: chunk.id, section: chunk.section, title: chunk.title, text: chunk.text, score: normalizeScore(raw) };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  const queryVec = await embedQueryNeural(query);
  const scored: RetrievedChunk[] = index.chunks.map((chunk) => ({
    id: chunk.id,
    section: chunk.section,
    title: chunk.title,
    text: chunk.text,
    score: cosineSimilarity(chunk.embedding ?? [], queryVec),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
