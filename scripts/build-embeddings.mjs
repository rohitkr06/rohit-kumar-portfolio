#!/usr/bin/env node
/**
 * Build-time index generation for the "Ask Me Anything" RAG corpus.
 *
 * Reads content/chunks.json (the curated, short passages that make up
 * Rohit's retrievable background) and generates a vector embedding for
 * each chunk using a small local sentence-embedding model via
 * @xenova/transformers (Xenova/all-MiniLM-L6-v2, 384 dimensions).
 *
 * Why this approach instead of an embeddings API:
 *   - Zero API cost, zero API key, works offline after the first model
 *     download.
 *   - The corpus here is ~30 short passages — nowhere near large enough
 *     to benefit from a hosted embeddings API's higher throughput, and
 *     the semantic-quality gap between MiniLM and e.g. OpenAI's
 *     text-embedding-3-small is negligible at this scale/domain.
 *   - The exact same model is loaded at query time (see lib/retrieval.ts)
 *     so the query vector and the stored chunk vectors live in the same
 *     embedding space.
 *
 * If huggingface.co isn't reachable (offline dev box, restrictive CI/proxy),
 * this script automatically falls back to a zero-network hashed-BM25 index
 * instead of failing outright — see lib/hashing-embedder.js for why that's
 * BM25 rather than hashed cosine similarity.
 *
 * Output: data/embeddings.json. This is intentionally NOT a vector
 * database. For a corpus this small, a flat file + brute-force similarity
 * search (see lib/retrieval.ts) is both simpler and faster than standing
 * up Pinecone/pgvector — there is no indexing structure that pays for
 * itself under ~1000 vectors.
 *
 * Run this whenever content/chunks.json changes:
 *   npm run embeddings:build
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tokenize, buildBm25Stats, documentTermVector, HASHING_DIMENSIONS, HASHING_MODEL_ID } from '../lib/hashing-embedder.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CHUNKS_PATH = path.join(ROOT, 'content', 'chunks.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'embeddings.json');
const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

/**
 * Tries to build a real local sentence-transformer extractor. Returns null
 * (rather than throwing) if the model can't be downloaded — e.g. no
 * network access, or huggingface.co blocked by a proxy/firewall — so the
 * caller can fall back to the zero-network hashed-BM25 index instead of
 * hard failing.
 */
async function tryLoadNeuralExtractor() {
  try {
    console.log(`[embeddings] Loading local embedding model "${MODEL_ID}" (first run downloads ~23MB, then cached)...`);
    const { pipeline, env } = await import('@xenova/transformers');
    // Keep the model cache inside the project so re-runs (and CI) are fast
    // and don't depend on a writable home directory.
    env.cacheDir = path.join(ROOT, '.cache', 'transformers');
    env.allowRemoteModels = true;
    return await pipeline('feature-extraction', MODEL_ID, { quantized: true });
  } catch (err) {
    console.warn(`[embeddings] Could not load "${MODEL_ID}" (${err?.message ?? err}).`);
    console.warn('[embeddings] Falling back to the zero-network hashed-BM25 index (lib/hashing-embedder.js).');
    console.warn('[embeddings] Re-run this script with network access to huggingface.co to upgrade to real semantic embeddings.');
    return null;
  }
}

async function main() {
  console.log(`\n[embeddings] Loading chunks from ${path.relative(ROOT, CHUNKS_PATH)} ...`);
  const raw = await readFile(CHUNKS_PATH, 'utf-8');
  const chunks = JSON.parse(raw);
  console.log(`[embeddings] ${chunks.length} chunks found.`);

  const extractor = await tryLoadNeuralExtractor();
  const usingNeural = extractor !== null;

  console.log(`[embeddings] Building index using ${usingNeural ? MODEL_ID : HASHING_MODEL_ID} ...`);

  const inputTexts = chunks.map((chunk) => `${chunk.title}. ${chunk.text}`);
  const tokenizedDocs = inputTexts.map(tokenize);

  // The BM25 fallback needs corpus-wide stats (document frequency per
  // hashed bucket, average doc length) fitted before scoring anything —
  // see lib/hashing-embedder.js. Persisted below so query time reuses them.
  const bm25Stats = usingNeural ? null : buildBm25Stats(tokenizedDocs, HASHING_DIMENSIONS);

  const embedded = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const inputText = inputTexts[i];

    if (usingNeural) {
      const output = await extractor(inputText, { pooling: 'mean', normalize: true });
      embedded.push({ ...chunk, embedding: Array.from(output.data) });
    } else {
      const tokens = tokenizedDocs[i];
      embedded.push({
        ...chunk,
        termVector: documentTermVector(tokens, HASHING_DIMENSIONS),
        docLength: tokens.length,
      });
    }
    process.stdout.write(`  ✓ ${chunk.id}\n`);
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(
    OUTPUT_PATH,
    JSON.stringify(
      {
        model: usingNeural ? MODEL_ID : HASHING_MODEL_ID,
        dimensions: usingNeural ? embedded[0]?.embedding.length ?? 0 : HASHING_DIMENSIONS,
        bm25: bm25Stats ?? undefined,
        generatedAt: new Date().toISOString(),
        chunks: embedded,
      },
      null,
      2,
    ),
  );

  console.log(`\n[embeddings] Wrote ${embedded.length} entries to ${path.relative(ROOT, OUTPUT_PATH)}`);
  if (!usingNeural) {
    console.log('[embeddings] NOTE: running in hashed-BM25 fallback mode. Quality improves once run with network access.');
  }
  console.log('[embeddings] Done.\n');
}

main().catch((err) => {
  console.error('[embeddings] Failed:', err);
  process.exitCode = 1;
});
