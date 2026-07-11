import type { CollectionEntry } from "astro:content";

/**
 * Returns a post's raw markdown body cleaned for plain-text/LLM export.
 *
 * Strips the injected "## Table of contents" heading (remark-toc fills the list
 * in at render time, so the raw body carries only an empty heading that would
 * otherwise leak into llms-full.txt and the RSS content) and collapses the
 * blank lines it leaves behind.
 */
const getPostBody = (post: CollectionEntry<"blog">): string =>
  (post.body ?? "")
    .replace(/^##\s+Table of contents\s*$/im, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export default getPostBody;
