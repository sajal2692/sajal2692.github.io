/**
 * Related-posts generator: four-signal hybrid retrieval.
 *
 * Signals, each producing its own per-source ranking:
 *   1. Title+description embedding cosine (curated summary semantics)
 *   2. Symmetric body-chunk coverage (token-weighted best-match, both
 *      directions averaged, so a broad post cannot absorb a narrow one)
 *   3. Symmetric BM25F lexical similarity (title/description/body fields,
 *      each direction normalized by its query's IDF mass)
 *   4. IDF-weighted tag Jaccard
 *
 * Rankings are fused with weighted reciprocal-rank fusion; a candidate with
 * zero tag overlap or zero lexical score gets no contribution from that
 * channel (weights are not renormalized). Fusion orders candidates; an
 * absolute evidence gate decides admission: strong title+description cosine,
 * or body coverage and lexical similarity agreeing independently. Tags never
 * admit a candidate on their own. Manual relatedPosts pins and series
 * neighbors outrank automatic results and bypass the gate.
 *
 * Embeddings are cached in .cache/related-posts/embeddings.json (gitignored)
 * keyed by content hash: title/description changes re-embed one summary,
 * body edits re-embed only the changed chunks, tag/config changes re-rank
 * locally with no API call. src/generated/related-posts.json is committed.
 *
 * Modes:
 *   check     Verify the committed artifact matches the working tree. Pure
 *             hashing, never loads the OpenAI SDK. Exit 1 when stale.
 *   ensure    Regenerate when stale, but never fail the build: without an
 *             OPENAI_API_KEY (or on API errors) it warns and keeps the
 *             committed artifact. Used by the dev and build scripts; this is
 *             what lets CI run without any OpenAI credentials.
 *   generate  Regenerate incrementally. Requires OPENAI_API_KEY only when at
 *             least one summary or chunk actually needs embedding. --force
 *             discards the cache and re-embeds everything.
 *   report    Write a per-pair calibration report (all component scores,
 *             directional values, ranks, RRF contributions, gate outcome) to
 *             .cache/related-posts/report.json.
 *
 * Flags: --force (generate), --verbose (all modes).
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { slug as slugger } from "github-slugger";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = path.join(ROOT, "src", "content", "blog");
const ARTIFACT_PATH = path.join(
  ROOT,
  "src",
  "generated",
  "related-posts.json"
);
const CACHE_PATH = path.join(
  ROOT,
  ".cache",
  "related-posts",
  "embeddings.json"
);
const REPORT_PATH = path.join(ROOT, ".cache", "related-posts", "report.json");

const SCHEMA_VERSION = 1;

const CONFIG = {
  model: "text-embedding-3-large",
  dimensions: 1024,
  candidateCount: 5,
  rrf: {
    k: 10,
    weights: { titleDescription: 0.45, body: 0.25, bm25: 0.25, tags: 0.05 },
  },
  // Evidence gate: RRF always produces a first-place candidate, so admission
  // requires absolute component evidence. A candidate is eligible when its
  // title+description cosine is strong on its own, or when body coverage and
  // lexical similarity agree independently. Calibrated 2026-07 against
  // labeled pairs (report.json): BAD td tops out at .530 (thin-post pairs
  // like yale x comprehensive), so tdStrong sits well above that band; BAD
  // body coverage tops out at .503 vs genuine pairs at .521+; lex is a
  // corroboration floor (announcement-genre pairs legitimately sit near
  // .05). Recalibrate with related:report before changing.
  gate: { tdStrong: 0.6, body: 0.512, lex: 0.035 },
  bm25: {
    k1: 1.2,
    b: 0.75,
    fieldBoosts: { title: 3.0, description: 2.0, body: 1.0 },
    // The lexical query for a post is its title and description terms plus
    // this many top-TF-IDF body terms, so a long body cannot flood the query
    // with generic vocabulary.
    queryBodyTerms: 40,
  },
  chunking: { targetWords: 375, overlapWords: 50, minTailWords: 120 },
  // Canonical tag aliases, applied after slugification. The slugger already
  // folds case and spacing ("Machine Learning" -> "machine-learning"), so
  // entries are only needed for genuinely different names.
  tagAliases: {
    agents: "ai-agents",
  },
  // Section labels stripped from body text before chunking (the prose under
  // them is kept). Deliberately a frozen list rather than corpus document
  // frequency: chunk cache keys are text hashes, so cleaning must be a
  // function of the post alone or publishing an unrelated post would
  // invalidate other posts' cached chunk embeddings.
  genericHeadings: [
    "acknowledgements",
    "background",
    "conclusion",
    "final thoughts",
    "further reading",
    "future improvements",
    "implementation",
    "introduction",
    "next steps",
    "overview",
    "prerequisites",
    "references",
    "resources",
    "summary",
    "table of contents",
    "testing",
    "wrapping up",
  ],
  // Lexical tokenizer stopwords (BM25F fields and queries). Rare-but-generic
  // content words are left to IDF rather than listed here.
  stopwords: [
    "a", "about", "above", "after", "again", "against", "all", "also", "am",
    "an", "and", "any", "are", "aren", "as", "at", "be", "because", "been",
    "before", "being", "below", "between", "both", "but", "by", "can",
    "cannot", "could", "couldn", "did", "didn", "do", "does", "doesn",
    "doing", "don", "down", "during", "each", "few", "for", "from",
    "further", "had", "hadn", "has", "hasn", "have", "haven", "having",
    "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
    "if", "in", "into", "is", "isn", "it", "its", "itself", "just", "ll",
    "me", "more", "most", "mustn", "my", "myself", "no", "nor", "not",
    "now", "of", "off", "on", "once", "only", "or", "other", "our", "ours",
    "ourselves", "out", "over", "own", "re", "same", "she", "should",
    "shouldn", "so", "some", "such", "than", "that", "the", "their",
    "theirs", "them", "themselves", "then", "there", "these", "they",
    "this", "those", "through", "to", "too", "under", "until", "up", "ve",
    "very", "was", "wasn", "we", "were", "weren", "what", "when", "where",
    "which", "while", "who", "whom", "why", "will", "with", "won", "would",
    "wouldn", "you", "your", "yours", "yourself", "yourselves",
  ],
  // Bump when scoring code changes in a way CONFIG fields do not capture.
  algorithmVersion: 3,
  summaryFormatVersion: 1,
  cleaningVersion: 1,
};

const TAG_ALIASES = new Map(Object.entries(CONFIG.tagAliases));
const GENERIC_HEADINGS = new Set(CONFIG.genericHeadings);
const STOPWORDS = new Set(CONFIG.stopwords);
const BM25_FIELDS = ["title", "description", "body"];

const log = message => console.log(`related-posts: ${message}`);
const warn = message => console.warn(`related-posts: WARNING: ${message}`);

const sha256 = value =>
  "sha256:" + createHash("sha256").update(value).digest("hex");

// ---------------------------------------------------------------------------
// Body cleaning and chunking
// ---------------------------------------------------------------------------

const normalizeHeadingLabel = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Markdown body -> plain-text paragraphs. Keeps meaningful heading labels,
// prose, list items, blockquote text, link anchors, image alt text, and
// inline-code terms; drops fenced code, HTML/iframes, URL destinations,
// markdown syntax, and generic heading labels (prose under them is kept).
function cleanBody(markdown) {
  let text = markdown;
  text = text.replace(/```[\s\S]*?```/g, "\n\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");

  const lines = text.split("\n").map(line => {
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line);
    if (heading) {
      const label = heading[1].replace(/[`*_]/g, "").trim();
      return GENERIC_HEADINGS.has(normalizeHeadingLabel(label)) ? "" : label;
    }
    return line
      .replace(/^\s*>\s?/, "")
      .replace(/^\s*[-+*]\s+/, "")
      .replace(/^\s*\d+\.\s+/, "")
      .replace(/^\s*\|?[-:| ]+\|?\s*$/, "")
      .replace(/[`*_|~]/g, " ");
  });

  return lines
    .join("\n")
    .split(/\n\s*\n+/)
    .map(paragraph => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const splitSentences = paragraph =>
  paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);

// Sentence-aware sliding window over the cleaned paragraphs. Trailing chunks
// shorter than minTailWords are merged into their predecessor.
function chunkParagraphs(paragraphs) {
  const { targetWords, overlapWords, minTailWords } = CONFIG.chunking;
  const units = [];
  for (const paragraph of paragraphs) {
    for (const sentence of splitSentences(paragraph)) {
      const words = sentence.split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        units.push({ text: words.join(" "), words: words.length });
      }
    }
  }
  if (units.length === 0) return [];

  const spans = [];
  let start = 0;
  for (;;) {
    let end = start;
    let count = 0;
    while (end < units.length && count < targetWords) {
      count += units[end].words;
      end += 1;
    }
    spans.push({ start, end });
    if (end >= units.length) break;
    let back = end;
    let overlap = 0;
    while (back > start && overlap < overlapWords) {
      back -= 1;
      overlap += units[back].words;
    }
    start = Math.max(back, start + 1);
  }

  const materialize = ({ start: s, end: e }) => {
    const slice = units.slice(s, e);
    const text = slice.map(u => u.text).join(" ");
    return { text, words: slice.reduce((sum, u) => sum + u.words, 0) };
  };

  if (spans.length > 1) {
    const tail = materialize(spans[spans.length - 1]);
    if (tail.words < minTailWords) {
      spans[spans.length - 2].end = spans[spans.length - 1].end;
      spans.pop();
    }
  }
  return spans.map(materialize).map(chunk => ({
    ...chunk,
    hash: sha256(JSON.stringify({ text: chunk.text })),
  }));
}

// ---------------------------------------------------------------------------
// Corpus loading
// ---------------------------------------------------------------------------

function listMarkdownFiles(dir, base = "") {
  const entries = [];
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    const relative = base ? `${base}/${dirent.name}` : dirent.name;
    if (dirent.isDirectory()) {
      entries.push(...listMarkdownFiles(path.join(dir, dirent.name), relative));
    } else if (dirent.name.endsWith(".md") && !dirent.name.startsWith("_")) {
      entries.push(relative);
    }
  }
  return entries.sort();
}

const normalizeTags = tags =>
  [
    ...new Set(
      (Array.isArray(tags) ? tags : []).map(t => {
        const slug = slugger(String(t));
        return TAG_ALIASES.get(slug) ?? slug;
      })
    ),
  ].sort();

const summaryInput = post =>
  `Title: ${post.title}\nDescription: ${post.description}`;

function loadPosts() {
  const posts = [];
  for (const relative of listMarkdownFiles(BLOG_DIR)) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, relative), "utf8");
    const { data, content } = matter(raw);
    if (data.draft === true) continue;
    // Must mirror generateId in src/content.config.ts exactly: entry ids are
    // the frontmatter slug when present, else the slugified file path.
    const id = data.slug ?? slugger(relative.replace(/\.md$/, ""));
    const paragraphs = cleanBody(content);
    const post = {
      id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      tags: normalizeTags(data.tags),
      series: data.series != null ? String(data.series) : null,
      seriesOrder:
        typeof data.seriesOrder === "number" ? data.seriesOrder : null,
      manualRelated: Array.isArray(data.relatedPosts)
        ? data.relatedPosts.map(String)
        : [],
      bodyText: paragraphs.join("\n"),
      chunks: chunkParagraphs(paragraphs),
    };
    post.summaryHash = sha256(
      JSON.stringify({
        version: CONFIG.summaryFormatVersion,
        text: summaryInput(post),
      })
    );
    posts.push(post);
  }
  posts.sort((a, b) => a.id.localeCompare(b.id));

  const ids = new Set(posts.map(p => p.id));
  if (ids.size !== posts.length) {
    throw new Error("duplicate post ids in src/content/blog");
  }
  for (const post of posts) {
    for (const ref of post.manualRelated) {
      if (ref === post.id) {
        throw new Error(`${post.id}: relatedPosts must not reference itself`);
      }
      if (!ids.has(ref)) {
        throw new Error(
          `${post.id}: relatedPosts references unknown or draft post "${ref}"`
        );
      }
    }
  }
  return posts;
}

// ---------------------------------------------------------------------------
// Hashes and staleness
// ---------------------------------------------------------------------------

const corpusHash = posts =>
  sha256(
    JSON.stringify(
      posts.map(p => [
        p.id,
        p.summaryHash,
        p.chunks.map(c => c.hash),
        p.tags,
        p.series,
        p.seriesOrder,
        p.manualRelated,
      ])
    )
  );

const rankingConfigHash = () => sha256(JSON.stringify(CONFIG));

function readArtifact() {
  if (!fs.existsSync(ARTIFACT_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));
  } catch {
    return null;
  }
}

function artifactStatus(posts) {
  const artifact = readArtifact();
  if (!artifact) return { stale: true, reason: "artifact missing or unreadable" };
  if (artifact.meta?.schemaVersion !== SCHEMA_VERSION) {
    return { stale: true, reason: "artifact schema version changed" };
  }
  if (artifact.meta.corpusHash !== corpusHash(posts)) {
    return { stale: true, reason: "post content or metadata changed" };
  }
  if (artifact.meta.rankingConfigHash !== rankingConfigHash()) {
    return { stale: true, reason: "ranking configuration changed" };
  }
  return { stale: false };
}

// ---------------------------------------------------------------------------
// Embedding cache
// ---------------------------------------------------------------------------

function loadCache() {
  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
    if (
      cache.model !== CONFIG.model ||
      cache.dimensions !== CONFIG.dimensions ||
      typeof cache.summaries !== "object" ||
      cache.summaries === null ||
      typeof cache.chunks !== "object" ||
      cache.chunks === null
    ) {
      warn("embedding cache is for a different config or layout; discarding it");
      return emptyCache();
    }
    return cache;
  } catch (error) {
    if (error.code !== "ENOENT") {
      warn(`embedding cache unreadable (${error.message}); discarding it`);
    }
    return emptyCache();
  }
}

const emptyCache = () => ({
  model: CONFIG.model,
  dimensions: CONFIG.dimensions,
  summaries: {},
  chunks: {},
});

function atomicWriteJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2) + "\n");
  fs.renameSync(tmpPath, filePath);
}

async function embedTexts(texts) {
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI();
  const vectors = [];
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const response = await client.embeddings.create({
      model: CONFIG.model,
      dimensions: CONFIG.dimensions,
      input: batch,
    });
    const ordered = [...response.data].sort((a, b) => a.index - b.index);
    vectors.push(...ordered.map(d => d.embedding));
  }
  return vectors;
}

// Embeds only summaries and chunks whose hash is missing from the cache,
// prunes entries no longer in the corpus, and persists the refreshed cache.
// Returns { summaryVectors: Map<postId, vector>, chunkVectors: Map<hash, vector> }.
async function ensureEmbeddings(posts, { force = false } = {}) {
  const cache = force ? emptyCache() : loadCache();

  const missing = [];
  for (const post of posts) {
    if (!cache.summaries[post.summaryHash]) {
      missing.push({ kind: "summary", hash: post.summaryHash, text: summaryInput(post) });
    }
  }
  const seenChunkHashes = new Set();
  for (const post of posts) {
    for (const chunk of post.chunks) {
      if (seenChunkHashes.has(chunk.hash)) continue;
      seenChunkHashes.add(chunk.hash);
      if (!cache.chunks[chunk.hash]) {
        missing.push({ kind: "chunk", hash: chunk.hash, text: chunk.text });
      }
    }
  }

  if (missing.length > 0) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        `${missing.length} embedding(s) needed but OPENAI_API_KEY is not set; ` +
          "add it to .env"
      );
    }
    const summaries = missing.filter(m => m.kind === "summary").length;
    log(
      `embedding ${summaries} summar${summaries === 1 ? "y" : "ies"} and ` +
        `${missing.length - summaries} chunk(s) with ${CONFIG.model}`
    );
    const vectors = await embedTexts(missing.map(m => m.text));
    missing.forEach((m, i) => {
      const target = m.kind === "summary" ? cache.summaries : cache.chunks;
      target[m.hash] = vectors[i];
    });
  } else {
    log("all embeddings reused from cache");
  }

  const summaryHashes = new Set(posts.map(p => p.summaryHash));
  for (const hash of Object.keys(cache.summaries)) {
    if (!summaryHashes.has(hash)) delete cache.summaries[hash];
  }
  for (const hash of Object.keys(cache.chunks)) {
    if (!seenChunkHashes.has(hash)) delete cache.chunks[hash];
  }
  atomicWriteJson(CACHE_PATH, cache);

  return {
    summaryVectors: new Map(
      posts.map(p => [p.id, cache.summaries[p.summaryHash]])
    ),
    chunkVectors: new Map(
      posts.flatMap(p => p.chunks.map(c => [c.hash, cache.chunks[c.hash]]))
    ),
  };
}

// ---------------------------------------------------------------------------
// Lexical: tokenizer, BM25F, tag IDF
// ---------------------------------------------------------------------------

// Lowercase, drop stopwords and single characters, fold plain plurals so
// agent/agents match without a stemmer mangling acronyms like MCP or RAG.
function tokenize(text) {
  const tokens = [];
  for (const raw of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    tokens.push(
      raw.length > 3 && raw.endsWith("s") && !raw.endsWith("ss")
        ? raw.slice(0, -1)
        : raw
    );
  }
  return tokens;
}

// BM25-style idf(term) = ln(1 + (N - df + 0.5) / (df + 0.5)): stays positive,
// but near-universal terms contribute almost nothing while rare terms keep
// their weight. Used for lexical terms and tags alike.
function buildIdf(termSets) {
  const documentFrequency = new Map();
  for (const set of termSets) {
    for (const term of set) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }
  const n = termSets.length;
  const idf = new Map();
  for (const [term, df] of documentFrequency) {
    idf.set(term, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
  }
  return idf;
}

function buildLexicalIndex(posts) {
  const docs = new Map();
  for (const post of posts) {
    const fields = {
      title: tokenize(post.title),
      description: tokenize(post.description),
      body: tokenize(post.bodyText),
    };
    const tf = {};
    const len = {};
    for (const field of BM25_FIELDS) {
      tf[field] = new Map();
      len[field] = fields[field].length;
      for (const token of fields[field]) {
        tf[field].set(token, (tf[field].get(token) ?? 0) + 1);
      }
    }
    const allTerms = new Set(BM25_FIELDS.flatMap(f => [...tf[f].keys()]));
    docs.set(post.id, { tf, len, allTerms });
  }

  const avgLen = {};
  for (const field of BM25_FIELDS) {
    const total = [...docs.values()].reduce((sum, d) => sum + d.len[field], 0);
    avgLen[field] = total / docs.size;
  }
  const idf = buildIdf([...docs.values()].map(d => d.allTerms));

  // Query terms per post: title + description terms plus the top-TF-IDF body
  // terms, deduplicated. Ties broken by term for determinism.
  const queries = new Map();
  for (const post of posts) {
    const doc = docs.get(post.id);
    const terms = new Set([
      ...doc.tf.title.keys(),
      ...doc.tf.description.keys(),
    ]);
    const scored = [...doc.tf.body.entries()]
      .map(([term, tf]) => [term, tf * (idf.get(term) ?? 0)])
      .filter(([, weight]) => weight > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    for (const [term] of scored.slice(0, CONFIG.bm25.queryBodyTerms)) {
      terms.add(term);
    }
    queries.set(post.id, [...terms].sort());
  }

  return { docs, avgLen, idf, queries };
}

// One direction of BM25F, normalized by the query's own IDF mass so the
// result is a [0, 1) "fraction of query evidence found" and directions with
// different query lengths stay comparable.
function bm25Direction(queryTerms, doc, index) {
  const { k1, b, fieldBoosts } = CONFIG.bm25;
  let score = 0;
  let mass = 0;
  for (const term of queryTerms) {
    const idf = index.idf.get(term) ?? 0;
    if (idf <= 0) continue;
    mass += idf;
    let wtf = 0;
    for (const field of BM25_FIELDS) {
      const tf = doc.tf[field].get(term) ?? 0;
      if (tf === 0 || index.avgLen[field] === 0) continue;
      const norm = 1 - b + b * (doc.len[field] / index.avgLen[field]);
      wtf += (fieldBoosts[field] * tf) / norm;
    }
    if (wtf > 0) score += (idf * wtf) / (k1 + wtf);
  }
  return mass === 0 ? 0 : score / mass;
}

// IDF-weighted Jaccard: shared idf mass over union idf mass, bounded [0, 1].
function weightedJaccard(setA, setB, idf) {
  let shared = 0;
  let union = 0;
  const seen = new Set([...setA, ...setB]);
  for (const term of seen) {
    const weight = idf.get(term) ?? 0;
    union += weight;
    if (setA.has(term) && setB.has(term)) shared += weight;
  }
  return union === 0 ? 0 : shared / union;
}

// ---------------------------------------------------------------------------
// Semantic components
// ---------------------------------------------------------------------------

function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dot / denominator;
}

// Token-weighted symmetric chunk coverage. forward = how well a's chunks are
// covered by their best match in b; a broad post scores high against a narrow
// one in one direction only, and the average exposes that.
function bodyCoverage(postA, postB, chunkVectors) {
  if (postA.chunks.length === 0 || postB.chunks.length === 0) {
    return { forward: 0, reverse: 0, similarity: 0 };
  }
  const sims = postA.chunks.map(ca =>
    postB.chunks.map(cb =>
      cosine(chunkVectors.get(ca.hash), chunkVectors.get(cb.hash))
    )
  );
  const direction = (chunks, best) => {
    let num = 0;
    let den = 0;
    chunks.forEach((chunk, i) => {
      num += chunk.words * best(i);
      den += chunk.words;
    });
    return den === 0 ? 0 : num / den;
  };
  const forward = direction(postA.chunks, i => Math.max(...sims[i]));
  const reverse = direction(postB.chunks, j =>
    Math.max(...sims.map(row => row[j]))
  );
  return { forward, reverse, similarity: (forward + reverse) / 2 };
}

// ---------------------------------------------------------------------------
// Pair scoring, rankings, RRF fusion, evidence gate
// ---------------------------------------------------------------------------

// All four signals for every unordered pair, computed once.
function computePairScores(posts, summaryVectors, chunkVectors) {
  const lexical = buildLexicalIndex(posts);
  const tagIdf = buildIdf(posts.map(p => new Set(p.tags)));
  const tagSets = new Map(posts.map(p => [p.id, new Set(p.tags)]));

  const pairs = new Map();
  const pairKey = (a, b) => (a < b ? `${a} ${b}` : `${b} ${a}`);

  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const a = posts[i];
      const b = posts[j];
      const body = bodyCoverage(a, b, chunkVectors);
      const forward = bm25Direction(
        lexical.queries.get(a.id),
        lexical.docs.get(b.id),
        lexical
      );
      const reverse = bm25Direction(
        lexical.queries.get(b.id),
        lexical.docs.get(a.id),
        lexical
      );
      const sharedTags = a.tags.filter(t => tagSets.get(b.id).has(t));
      pairs.set(pairKey(a.id, b.id), {
        titleDescription: cosine(
          summaryVectors.get(a.id),
          summaryVectors.get(b.id)
        ),
        // forward/reverse are stored from the lower id's perspective.
        bodyForward: body.forward,
        bodyReverse: body.reverse,
        bodySimilarity: body.similarity,
        bm25Forward: forward,
        bm25Reverse: reverse,
        bm25Similarity: (forward + reverse) / 2,
        sharedTags,
        tagSimilarity: weightedJaccard(
          tagSets.get(a.id),
          tagSets.get(b.id),
          tagIdf
        ),
      });
    }
  }

  return (a, b) => {
    const scores = pairs.get(pairKey(a, b));
    if (a < b) return scores;
    return {
      ...scores,
      bodyForward: scores.bodyReverse,
      bodyReverse: scores.bodyForward,
      bm25Forward: scores.bm25Reverse,
      bm25Reverse: scores.bm25Forward,
    };
  };
}

// Tie-aware midrank: equal scores share the mean of the positions they span.
function midranks(entries) {
  const sorted = [...entries].sort(
    (a, b) => b.score - a.score || a.id.localeCompare(b.id)
  );
  const ranks = new Map();
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].score === sorted[i].score) {
      j += 1;
    }
    const rank = (i + j + 2) / 2;
    for (let k = i; k <= j; k++) ranks.set(sorted[k].id, rank);
    i = j + 1;
  }
  return ranks;
}

const gateResult = scores => {
  const { tdStrong, body, lex } = CONFIG.gate;
  const byTd = scores.titleDescription >= tdStrong;
  const byBodyLex =
    scores.bodySimilarity >= body && scores.bm25Similarity >= lex;
  return {
    eligible: byTd || byBodyLex,
    reason: byTd
      ? "strong-title-description"
      : byBodyLex
        ? "body-and-lexical"
        : null,
  };
};

function rankAll(posts, summaryVectors, chunkVectors, verbose) {
  const scoresFor = computePairScores(posts, summaryVectors, chunkVectors);
  const { k, weights } = CONFIG.rrf;
  const rankedById = {};
  const details = {};

  for (const post of posts) {
    const candidates = posts
      .filter(p => p.id !== post.id)
      .map(p => ({ id: p.id, scores: scoresFor(post.id, p.id) }));

    const tdRanks = midranks(
      candidates.map(c => ({ id: c.id, score: c.scores.titleDescription }))
    );
    const bodyRanks = midranks(
      candidates.map(c => ({ id: c.id, score: c.scores.bodySimilarity }))
    );
    // Zero lexical or tag evidence contributes nothing: those candidates get
    // no rank in that channel and the weights are not renormalized.
    const bm25Ranks = midranks(
      candidates
        .filter(c => c.scores.bm25Similarity > 0)
        .map(c => ({ id: c.id, score: c.scores.bm25Similarity }))
    );
    const tagRanks = midranks(
      candidates
        .filter(c => c.scores.tagSimilarity > 0)
        .map(c => ({ id: c.id, score: c.scores.tagSimilarity }))
    );

    const fused = candidates.map(c => {
      const contributions = {
        titleDescription: weights.titleDescription / (k + tdRanks.get(c.id)),
        body: weights.body / (k + bodyRanks.get(c.id)),
        bm25: bm25Ranks.has(c.id) ? weights.bm25 / (k + bm25Ranks.get(c.id)) : 0,
        tags: tagRanks.has(c.id) ? weights.tags / (k + tagRanks.get(c.id)) : 0,
      };
      const rawRrf =
        contributions.titleDescription +
        contributions.body +
        contributions.bm25 +
        contributions.tags;
      return {
        ...c,
        ranks: {
          titleDescription: tdRanks.get(c.id),
          body: bodyRanks.get(c.id),
          bm25: bm25Ranks.get(c.id) ?? null,
          tags: tagRanks.get(c.id) ?? null,
        },
        contributions,
        rawRrf,
        gate: gateResult(c.scores),
      };
    });
    fused.sort((a, b) => b.rawRrf - a.rawRrf || a.id.localeCompare(b.id));

    const chosen = [];
    const add = (id, via) => {
      if (id === post.id || chosen.some(c => c.id === id)) return;
      if (chosen.length >= CONFIG.candidateCount) return;
      chosen.push({ id, via });
    };

    // Manual selections and series neighbors are editorial/structural: they
    // outrank fused candidates and bypass the evidence gate.
    for (const id of post.manualRelated) add(id, "manual");

    if (post.series && post.seriesOrder != null) {
      const neighbors = posts
        .filter(
          p =>
            p.id !== post.id &&
            p.series === post.series &&
            p.seriesOrder != null
        )
        .sort(
          (a, b) =>
            Math.abs(a.seriesOrder - post.seriesOrder) -
              Math.abs(b.seriesOrder - post.seriesOrder) ||
            a.seriesOrder - b.seriesOrder
        );
      for (const neighbor of neighbors) add(neighbor.id, "series");
    }

    for (const entry of fused) {
      if (!entry.gate.eligible) continue;
      add(entry.id, "rrf");
    }

    if (verbose) {
      log(`${post.id}:`);
      for (const c of chosen) {
        const entry = fused.find(f => f.id === c.id);
        const label =
          c.via === "rrf"
            ? `rrf ${entry.rawRrf.toFixed(4)} (${entry.gate.reason})`
            : c.via;
        console.log(`    ${c.id}  (${label})`);
      }
      if (chosen.length === 0) console.log("    (none eligible)");
    }
    rankedById[post.id] = chosen.map(c => c.id);
    details[post.id] = { chosen, fused };
  }
  return { rankedById, details };
}

function validateRanking(posts, rankedById) {
  const ids = new Set(posts.map(p => p.id));
  const rankedIds = Object.keys(rankedById);
  if (
    rankedIds.length !== posts.length ||
    rankedIds.some(id => !ids.has(id))
  ) {
    throw new Error("ranking result does not cover the post corpus exactly");
  }
  for (const [id, related] of Object.entries(rankedById)) {
    if (related.length > CONFIG.candidateCount) {
      throw new Error(`${id}: too many related candidates`);
    }
    if (new Set(related).size !== related.length) {
      throw new Error(`${id}: duplicate related candidates`);
    }
    for (const ref of related) {
      if (ref === id) throw new Error(`${id}: refers to itself`);
      if (!ids.has(ref)) throw new Error(`${id}: unknown candidate "${ref}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

const FIX_COMMAND =
  "run: npm run related:generate && git add src/generated/related-posts.json";

function runCheck(verbose) {
  const posts = loadPosts();
  if (verbose) {
    log(`corpusHash        ${corpusHash(posts)}`);
    log(`rankingConfigHash ${rankingConfigHash()}`);
    for (const post of posts) {
      log(
        `input ${post.id} summary=${post.summaryHash.slice(0, 15)} ` +
          `chunks=${post.chunks.length}`
      );
    }
  }
  const status = artifactStatus(posts);
  if (status.stale) {
    console.error(`related-posts: STALE (${status.reason}); ${FIX_COMMAND}`);
    process.exitCode = 1;
    return;
  }
  log("up to date");
}

async function runGenerate({ force = false, verbose = false } = {}) {
  const posts = loadPosts();
  if (!force && !artifactStatus(posts).stale) {
    log("already up to date (use related:force to rebuild)");
    return;
  }

  const { summaryVectors, chunkVectors } = await ensureEmbeddings(posts, {
    force,
  });
  const { rankedById } = rankAll(posts, summaryVectors, chunkVectors, verbose);
  validateRanking(posts, rankedById);

  const artifact = {
    meta: {
      schemaVersion: SCHEMA_VERSION,
      model: CONFIG.model,
      dimensions: CONFIG.dimensions,
      corpusHash: corpusHash(posts),
      rankingConfigHash: rankingConfigHash(),
    },
    posts: Object.fromEntries(
      Object.keys(rankedById)
        .sort()
        .map(id => [id, rankedById[id]])
    ),
  };
  atomicWriteJson(ARTIFACT_PATH, artifact);
  log(`wrote ${path.relative(ROOT, ARTIFACT_PATH)}`);
}

// Calibration aid: every ordered pair with all component scores, directional
// values, per-channel ranks, RRF contributions, and the gate and selection
// outcome. Gitignored output.
async function runReport() {
  const posts = loadPosts();
  const { summaryVectors, chunkVectors } = await ensureEmbeddings(posts);
  const { details } = rankAll(posts, summaryVectors, chunkVectors, false);

  const round = (value, places = 4) =>
    value == null ? null : Number(value.toFixed(places));
  const pairs = [];
  for (const post of posts) {
    const { chosen, fused } = details[post.id];
    const finalRankById = new Map(chosen.map((c, i) => [c.id, i + 1]));
    const viaById = new Map(chosen.map(c => [c.id, c.via]));
    for (const entry of fused) {
      const s = entry.scores;
      pairs.push({
        source: post.id,
        candidate: entry.id,
        titleDescriptionCosine: round(s.titleDescription),
        titleDescriptionRank: entry.ranks.titleDescription,
        bodyCoverageForward: round(s.bodyForward),
        bodyCoverageReverse: round(s.bodyReverse),
        bodySimilarity: round(s.bodySimilarity),
        bodyRank: entry.ranks.body,
        bm25Forward: round(s.bm25Forward),
        bm25Reverse: round(s.bm25Reverse),
        bm25Similarity: round(s.bm25Similarity),
        bm25Rank: entry.ranks.bm25,
        sharedTags: s.sharedTags,
        tagSimilarity: round(s.tagSimilarity),
        tagRank: entry.ranks.tags,
        rrfContributions: {
          titleDescription: round(entry.contributions.titleDescription, 6),
          body: round(entry.contributions.body, 6),
          bm25: round(entry.contributions.bm25, 6),
          tags: round(entry.contributions.tags, 6),
        },
        rawRrf: round(entry.rawRrf, 6),
        consensus: round(entry.rawRrf * (CONFIG.rrf.k + 1), 4),
        eligible: entry.gate.eligible,
        eligibilityReason: entry.gate.reason,
        acceptedBy:
          viaById.get(entry.id) ??
          (entry.gate.eligible ? "rejected-capacity" : "rejected-gate"),
        finalRank: finalRankById.get(entry.id) ?? null,
      });
    }
  }

  atomicWriteJson(REPORT_PATH, {
    meta: {
      corpusHash: corpusHash(posts),
      rankingConfigHash: rankingConfigHash(),
      config: CONFIG,
    },
    pairs,
  });
  log(`wrote ${path.relative(ROOT, REPORT_PATH)} (${pairs.length} pairs)`);
}

async function runEnsure(verbose) {
  try {
    const posts = loadPosts();
    const status = artifactStatus(posts);
    if (!status.stale) {
      log("up to date");
      return;
    }
    if (!process.env.OPENAI_API_KEY) {
      degrade(`stale (${status.reason}) and OPENAI_API_KEY is not set`);
      return;
    }
    await runGenerate({ verbose });
  } catch (error) {
    degrade(error.message);
  }
}

// A stale recommendation list is never worth a failed build or deploy: warn,
// make sure an importable artifact exists, and exit 0.
function degrade(reason) {
  warn(`${reason}; keeping the committed artifact (${FIX_COMMAND})`);
  if (!readArtifact()) {
    atomicWriteJson(ARTIFACT_PATH, {
      meta: {
        schemaVersion: SCHEMA_VERSION,
        model: CONFIG.model,
        dimensions: CONFIG.dimensions,
        corpusHash: null,
        rankingConfigHash: null,
      },
      posts: {},
    });
    warn("wrote an empty placeholder artifact so the build can proceed");
  }
}

async function main() {
  const [, , mode = "", ...flags] = process.argv;
  const force = flags.includes("--force");
  const verbose = flags.includes("--verbose");
  if (mode === "check") return runCheck(verbose);
  if (mode === "generate") return runGenerate({ force, verbose });
  if (mode === "ensure") return runEnsure(verbose);
  if (mode === "report") return runReport();
  console.error(
    "usage: node scripts/related-posts.mjs <check|ensure|generate|report> [--force] [--verbose]"
  );
  process.exitCode = 2;
}

main().catch(error => {
  console.error(`related-posts: ERROR: ${error.message}`);
  process.exitCode = 1;
});
