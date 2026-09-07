/**
 * Zero-dependency, zero-network fallback retriever.
 *
 * This project's primary embedding path is a real local neural model
 * (Xenova/all-MiniLM-L6-v2, run via @xenova/transformers — see
 * scripts/build-embeddings.mjs and lib/retrieval.ts). That model has to be
 * downloaded from the Hugging Face Hub the first time it's used, and its
 * dense sentence vectors are compared with plain cosine similarity.
 *
 * If that download isn't possible (no network access at build time, a
 * restrictive proxy/firewall, an offline dev environment), both the build
 * script and the runtime retrieval code fall back to this module instead.
 *
 * The fallback deliberately does NOT do hashed-bag-of-words + cosine
 * similarity — that combination systematically under-ranks longer, more
 * detailed passages, because a document's vector norm grows with its
 * vocabulary breadth, drowning out a single strong keyword match. Instead
 * this implements hashed BM25, the standard lexical-ranking function used
 * by real search engines (Elasticsearch/Lucene's default). BM25 saturates
 * term-frequency contributions and normalizes for document length, which
 * is exactly the property needed when comparing a 6-word question against
 * resume bullets of very different lengths.
 *
 * It is not a neural embedding and it doesn't capture paraphrase/semantic
 * similarity the way MiniLM does, but it IS a real, non-hardcoded ranking
 * over the actual text — a keyword-heavy question about a resume (company
 * names, technology names, numbers) is exactly the case lexical ranking
 * handles well.
 */

const HASHING_DIMENSIONS = 512;
const HASHING_MODEL_ID = 'hashing-bm25-v1';
const BM25_K1 = 1.5;
const BM25_B = 0.75;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'he', 'his', 'him',
  'is', 'was', 'were', 'as', 'by', 'at', 'that', 'this', 'it', 'be', 'are', 'from', 'into',
  'has', 'have', 'had', 'not', 'but', 'also', 'you', 'your', 'about', 'can', 'i', 'me', 'do',
  'does', 'did', 'what', 'tell',
]);

/**
 * Very light suffix-stripping so simple plural/verb variants (e.g.
 * "awards" vs "award", "campaigns" vs "campaign") land on the same hashed
 * bucket as their base form. This does not need to produce real
 * linguistic stems — it only needs to be applied identically at index
 * time and query time, which it is (both paths call `tokenize`).
 */
function lightStem(word) {
  if (word.length > 4 && word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.length > 4 && word.endsWith('es') && !word.endsWith('ses')) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

/** Splits text into cleaned, stopword-filtered, lightly-stemmed unigrams. */
function tokenize(text) {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9+\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned
    .split(' ')
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(lightStem);
}

// FNV-1a — small, fast, deterministic, no dependencies.
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function hashToken(token, dims) {
  return fnv1a(token) % dims;
}

/**
 * Raw hashed term-frequency counts for one document's tokens, stored
 * SPARSELY as { "<bucketIndex>": count } — with 512 buckets and a few
 * dozen tokens per resume-bullet-sized document, a dense array would be
 * >90% zeros. Sparse storage keeps data/embeddings.json small without
 * changing any scoring math (bm25Score below reads through the same
 * `obj[idx] ?? 0` shape either way).
 */
function documentTermVector(tokens, dims = HASHING_DIMENSIONS) {
  const vec = {};
  for (const token of tokens) {
    const idx = hashToken(token, dims);
    vec[idx] = (vec[idx] ?? 0) + 1;
  }
  return vec;
}

/**
 * Fits corpus-level BM25 statistics (document frequency per hashed bucket,
 * average document length) once over the whole corpus at build time.
 * Must be reused as-is at query time. `df` is sparse for the same reason
 * as documentTermVector above.
 */
function buildBm25Stats(tokenizedDocs, dims = HASHING_DIMENSIONS) {
  const df = {};
  let totalLength = 0;
  for (const tokens of tokenizedDocs) {
    totalLength += tokens.length;
    const seen = new Set(tokens.map((t) => hashToken(t, dims)));
    for (const idx of seen) df[idx] = (df[idx] ?? 0) + 1;
  }
  const n = tokenizedDocs.length;
  return { df, avgDocLength: n > 0 ? totalLength / n : 0, n };
}

/**
 * Scores one document against a (tokenized) query using Okapi BM25 over
 * hashed term buckets. Returns a raw, unbounded (>= 0) relevance score —
 * higher is more relevant, 0 means no query term appeared in the document
 * at all. `docTermVector` and `bm25Stats.df` are the sparse objects
 * produced above (or a plain array works too — both support `obj[idx]`).
 */
function bm25Score(queryTokens, docTermVector, docLength, bm25Stats, dims = HASHING_DIMENSIONS) {
  const { df, avgDocLength, n } = bm25Stats;
  const seenBuckets = new Set();
  let score = 0;

  for (const token of queryTokens) {
    const idx = hashToken(token, dims);
    if (seenBuckets.has(idx)) continue; // don't double-count repeated query words
    seenBuckets.add(idx);

    const f = docTermVector[idx] ?? 0;
    if (f === 0) continue;

    const bucketDf = df[idx] ?? 0;
    const idf = Math.log((n - bucketDf + 0.5) / (bucketDf + 0.5) + 1); // BM25 IDF, always >= 0
    const denom = f + BM25_K1 * (1 - BM25_B + (BM25_B * docLength) / (avgDocLength || 1));
    score += idf * ((f * (BM25_K1 + 1)) / denom);
  }

  return score;
}

/** Squashes an unbounded BM25 score into (0, 1) for display/threshold purposes, without changing ranking order. */
function normalizeScore(rawScore) {
  return rawScore / (rawScore + 3);
}

module.exports = {
  HASHING_DIMENSIONS,
  HASHING_MODEL_ID,
  tokenize,
  documentTermVector,
  buildBm25Stats,
  bm25Score,
  normalizeScore,
};
