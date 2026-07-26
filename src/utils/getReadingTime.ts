const WORDS_PER_MINUTE = 215;

/**
 * Reading time in whole minutes from a post's raw markdown.
 *
 * Code is stripped rather than counted: nobody reads a 40-line snippet at prose
 * speed, and posts here are code-heavy enough that counting it would inflate
 * every estimate. Same for URLs, HTML and image markup — the visible link text
 * is kept, the target is not.
 */
export default function getReadingTime(markdown: string): number {
  const prose = markdown
    .replace(/^---\n[\s\S]*?\n---/, " ") // frontmatter, if handed a raw file
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/`[^`\n]*`/g, " ") // inline code
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/^#{1,6}\s+/gm, " ") // heading markers
    .replace(/^[>*\-+]\s+/gm, " ") // quote and list markers
    .replace(/[*_~]/g, " "); // inline emphasis

  const words = prose.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
