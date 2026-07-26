const WORDS_PER_MINUTE = 215;

/**
 * Reading time in whole minutes from a post's raw markdown.
 *
 * Code is stripped rather than counted: nobody reads a 40-line snippet at prose
 * speed, and posts here are code-heavy enough that counting it would inflate
 * every estimate. Same for URLs and HTML — the visible link text is kept, the
 * target is not.
 *
 * Pass the body through getPostBody first so the injected
 * `## Table of contents` heading is already gone.
 */
export default function getReadingTime(markdown: string): number {
  const prose = markdown
    // Fenced code in any of markdown's forms: 3+ backticks or tildes, closed by
    // a fence of the same character and at least the same length. The
    // backreference matters — a ````markdown block wrapping ``` examples would
    // otherwise pair the fences positionally and leak its contents into the count.
    .replace(/^([`~]{3,})[^\n]*\n[\s\S]*?^\1[`~]*[ \t]*$/gm, " ")
    .replace(/`[^`\n]*`/g, " ") // inline code
    // Tags only, not any `<`: `/<[^>]+>/` spans newlines, so a single "p < 0.05"
    // in prose swallowed every word up to the next ">" anywhere later on.
    .replace(/<\/?[a-zA-Z][^>\n]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/^#{1,6}\s+/gm, " ") // heading markers
    .replace(/^[>*\-+]\s+/gm, " ") // quote and list markers
    .replace(/^\d+[.)]\s+/gm, " ") // ordered list markers
    .replace(/[*_~]/g, " "); // inline emphasis

  const words = prose.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
