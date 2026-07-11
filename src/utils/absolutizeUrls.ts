import { SITE } from "@config";

// Posts use root-relative paths for images (/images/blog/...) and some internal
// links (/posts/...). Those only resolve on this domain, so exports meant to be
// read elsewhere (the feed, llms-full.txt) must rewrite them to absolute URLs.
const base = SITE.website.replace(/\/$/, "");

/** Rewrite root-relative src/href attributes in rendered HTML to absolute URLs. */
export const absolutizeHtml = (html: string): string =>
  html.replace(/(src|href)="\/(?!\/)/g, `$1="${base}/`);

/** Rewrite root-relative markdown link/image targets — ](/path) — to absolute URLs. */
export const absolutizeMarkdown = (markdown: string): string =>
  markdown.replace(/\]\(\/(?!\/)/g, `](${base}/`);
