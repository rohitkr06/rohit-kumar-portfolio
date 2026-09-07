# Rohit Kumar — Portfolio

A personal portfolio built for a backend engineer, not a template. Dark,
glassmorphic, particle-field background rendered with react-three-fiber,
terminal/dev-tool visual language throughout, and a centerpiece
**"Ask Me Anything"** widget that runs a real retrieval-augmented pipeline
over Rohit's actual resume content — no hardcoded FAQ, no hallucinated LLM
output with nothing behind it.

```
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion
react-three-fiber / drei · shadcn-style UI primitives · Vercel AI SDK
```

---

## 1. Quick start

```bash
npm install
npm run embeddings:build   # builds the AMA retrieval index (see §3)
npm run dev                # http://localhost:3000
```

The site works with **zero environment variables**. The "Ask Me Anything"
widget is fully functional out of the box in retrieval-only mode (see §4).

---

## 2. Project structure

```
app/
  page.tsx              → assembles the page from components/sections/*
  layout.tsx            → fonts, metadata, global chrome (nav, background, command palette)
  api/ask/route.ts       → the AMA endpoint: retrieve → (optionally) generate → stream
  opengraph-image.tsx    → dynamic OG image (next/og)
  robots.ts, sitemap.ts  → SEO file-convention routes

content/
  profile.ts             → SINGLE SOURCE OF TRUTH for all resume content (UI-facing)
  chunks.json             → the curated RAG corpus: short, retrievable passages

lib/
  retrieval.ts            → embeds the query + cosine/BM25 search over data/embeddings.json
  generate.ts             → turns retrieved chunks into a streamed answer (LLM or fallback)
  hashing-embedder.js      → the zero-network fallback retriever (see §4)

scripts/
  build-embeddings.mjs     → run this to (re)generate data/embeddings.json

components/
  background/              → the WebGL particle field (lazy-loaded, see §6)
  hero/, ama/               → hero section + the AMA terminal widget
  sections/                 → Impact, Experience, Skills, Achievements, Contact
  nav/                       → Navbar + Cmd+K command palette (cmdk)
  terminal/                  → the `whoami` / `experience --list` easter egg
  ui/                         → small shadcn-style primitives (button, badge, glass card)
```

**To update the content** (a new role, a new number, a new award): edit
`content/profile.ts` for what's displayed on the page, and `content/chunks.json`
for what the AMA widget can answer questions about, then re-run
`npm run embeddings:build`. These two files are intentionally kept separate
(see §3) rather than mechanically derived from one another.

---

## 3. How the RAG pipeline works

1. **Chunking** — `content/chunks.json` holds ~28 short, self-contained
   passages (one per resume bullet / skill group / achievement / etc.),
   each written so it stands alone without needing surrounding context
   ("Rohit built X..." rather than just "built X...").
2. **Embedding (build time)** — `scripts/build-embeddings.mjs` embeds every
   chunk and writes `data/embeddings.json`. This is a **flat JSON file, not
   a vector database** — for ~30 vectors, a full brute-force scan is
   sub-millisecond, and Pinecone/pgvector would add real operational
   overhead (a hosted service, auth, a schema to maintain) for zero benefit
   at this scale. Reach for a real vector DB once the corpus is in the
   thousands of chunks, not before.
3. **Retrieval (request time)** — `lib/retrieval.ts` embeds the visitor's
   question with the *same* method used at build time, scores every stored
   chunk, and returns the top matches.
4. **Generation** — `lib/generate.ts` either streams a real LLM's grounded
   answer (if an API key is configured) or streams the best-matching
   chunk(s) directly (if not). Either way, **only the retrieved chunks are
   ever shown to the model / user as fact** — there is no path where the
   widget can state something not present in `content/chunks.json`.

### Embeddings: local model vs. API — and the fallback you should know about

You chose the **free, local option**: chunks are embedded with a small
open-source sentence-transformer (`Xenova/all-MiniLM-L6-v2`, 384
dimensions) run via [`@xenova/transformers`](https://github.com/xenova/transformers.js)
— no OpenAI key, no per-call cost, works forever. The tradeoff against an
API like OpenAI's `text-embedding-3-small` is a small hit to semantic
quality; at ~30 short, single-topic chunks about one person, that gap is
not noticeable in practice.

**One real constraint:** that model has to be downloaded from the Hugging
Face Hub (`huggingface.co`) the first time `npm run embeddings:build` runs.
If that host isn't reachable — an offline machine, a locked-down CI
runner, a corporate proxy — the script **automatically falls back** to
`lib/hashing-embedder.js`: a zero-dependency, zero-network hashed-BM25
retriever (the same ranking function Elasticsearch/Lucene use by default).
It's not a neural embedding and won't catch paraphrase the way MiniLM
does, but for a keyword-dense corpus like a resume (company names, tech
names, numbers) lexical BM25 ranking is genuinely strong — and it's what
this repo ships with, because the sandbox this was built in had no route
to huggingface.co either. **Run `npm run embeddings:build` again on a
machine with normal internet access (your laptop, or as part of your
Vercel build) to upgrade to the real semantic embeddings** — the script
will pick MiniLM automatically the moment it can reach the model.

You can tell which mode is active from the top of `data/embeddings.json`:
`"model": "Xenova/all-MiniLM-L6-v2"` (neural) vs. `"model": "hashing-bm25-v1"`
(fallback). Both are wired all the way through `lib/retrieval.ts` — the
query is always embedded with whatever method built the index, so
similarity scores are never compared across incompatible spaces.

**Re-run this whenever `content/chunks.json` changes:**
```bash
npm run embeddings:build
```

---

## 4. Generation: LLM vs. retrieval-only — and what you chose

You chose **retrieval-only, zero cost, zero API key**. At query time, the
widget still does the full real pipeline (embed the question → cosine/BM25
search → pick the best chunk), it just streams that chunk's actual text
back verbatim instead of paraphrasing it through a model. This means:

- No API key required, no per-visitor cost, works immediately.
- Every answer is, by construction, a direct quote from `content/chunks.json`
  — there's no way for it to invent something.
- Off-topic questions ("what's the capital of France?") correctly get a
  "I don't have grounded information on that" response rather than a guess
  — see the similarity floor in `lib/generate.ts`.
- The tradeoff: answers read like resume bullets, not like a conversational
  reply, and can't synthesize across multiple chunks as fluidly as an LLM.

**To upgrade to an LLM-composed answer** (still 100%-grounded — the model
is only ever shown the retrieved chunks, with an explicit system prompt
forbidding it from adding outside facts), set **one** environment variable:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...   # preferred if both are set
# or
OPENAI_API_KEY=sk-...
```

That's it — no code changes. `lib/generate.ts` checks for these at request
time and switches to `streamText` from the Vercel AI SDK (Claude 3.5 Haiku
or GPT-4o-mini — both cheap, fast models appropriate for a few-sentence
grounded answer) the moment either is present. If the LLM call fails for
any reason (bad key, rate limit, provider outage), it silently falls back
to the retrieval-only path rather than showing an error, so the widget
never fully breaks.

---

## 5. Environment variables

All optional. Copy `.env.example` to `.env.local` and fill in what you want.

| Variable | Required? | Effect |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Upgrades AMA answers to Claude-generated, still fully grounded. |
| `OPENAI_API_KEY` | No | Same, via GPT-4o-mini, used if no Anthropic key is set. |
| `NEXT_PUBLIC_SITE_URL` | No | Used for canonical/OpenGraph URLs; defaults to a placeholder domain — set this to your real deployed URL. |

---

## 6. Design & performance notes

- **3D background** (`components/background/`): the WebGL particle field is
  loaded via `next/dynamic` with `ssr: false` and no eager preload, so
  three.js/@react-three/fiber (~200KB gzipped) is fetched *after* the page
  is already interactive, not blocking first paint. It's skipped entirely
  (not just paused) when `prefers-reduced-motion` is set.
- **Fonts** are loaded via a `<link>` tag to Google Fonts rather than
  `next/font/google`, specifically so this repo's own build doesn't
  require build-time network access to `fonts.googleapis.com` (the sandbox
  this was built in couldn't reach it either — see §3 for the same
  situation with the embedding model). If your deploy target has normal
  internet access, switching to `next/font/google` in `app/layout.tsx` is
  a small, worthwhile upgrade (self-hosted fonts, zero extra requests,
  fixes a minor Lighthouse/ESLint warning) — it's a couple of lines.
- **Accessibility**: full keyboard navigation (Cmd+K palette, Esc to close
  dialogs, a skip-to-content link, visible focus rings on every interactive
  element), and every animation (particle field, scroll reveals, typing
  effects, custom cursor) is disabled outright — not just shortened — when
  `prefers-reduced-motion: reduce` is set.
- **SEO**: full OpenGraph/Twitter metadata, a dynamically generated OG image
  (`app/opengraph-image.tsx`), `robots.ts`/`sitemap.ts` via Next's file
  conventions.

---

## 7. Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Before the first deploy (or in a `postinstall`/build step), make sure
   `data/embeddings.json` exists and is committed, **or** run
   `npm run embeddings:build` as part of the Vercel build command
   (`npm run embeddings:build && next build`) so it regenerates fresh each
   deploy. Either works; committing it is simpler and means a deploy never
   depends on Hugging Face being reachable at build time.
4. If you want LLM-composed AMA answers, add `ANTHROPIC_API_KEY` and/or
   `OPENAI_API_KEY` in the Vercel project's Environment Variables.
5. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
6. Deploy. The `/api/ask` route runs on the Node.js serverless runtime
   (not Edge) because `@xenova/transformers` needs Node APIs — this is
   already configured (`export const runtime = 'nodejs'` in
   `app/api/ask/route.ts`), no action needed.

**Cold starts:** the first request to `/api/ask` after a serverless
function spins up pays a one-time cost to load the embedding model
(~1-2s if using the neural path; negligible for the hashing fallback).
Subsequent requests on the same warm instance are fast. This is normal for
any serverless deployment doing on-the-fly ML inference and isn't
something to "fix" — Vercel keeps functions warm under regular traffic.

---

## 8. Editing content

Everything a visitor can see or ask about traces back to
`content/profile.ts` (display) and `content/chunks.json` (retrieval
corpus). There is deliberate small duplication between the two — the UI
wants nicely formatted bullets, the RAG corpus wants short, self-contained,
context-repeating passages that read well in isolation — but the
underlying facts should always match. After editing either file:

```bash
npm run embeddings:build   # only needed after editing chunks.json
npm run typecheck          # sanity check
npm run dev
```
