export declare const HASHING_DIMENSIONS: number;
export declare const HASHING_MODEL_ID: string;

/**
 * Sparse hashed-bucket-index -> count map. Stored (and serialized to
 * data/embeddings.json) as a plain object with numeric-string keys rather
 * than a dense array, since with 512 buckets and a few dozen tokens per
 * document the vast majority of entries would be zero.
 */
export type SparseVector = Record<string, number>;

export type Bm25Stats = {
  df: SparseVector;
  avgDocLength: number;
  n: number;
};

export declare function tokenize(text: string): string[];
export declare function documentTermVector(tokens: string[], dims?: number): SparseVector;
export declare function buildBm25Stats(tokenizedDocs: string[][], dims?: number): Bm25Stats;
export declare function bm25Score(
  queryTokens: string[],
  docTermVector: SparseVector,
  docLength: number,
  bm25Stats: Bm25Stats,
  dims?: number,
): number;
export declare function normalizeScore(rawScore: number): number;
