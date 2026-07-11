import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import getPostBody from "@utils/getPostBody";
import { absolutizeMarkdown } from "@utils/absolutizeUrls";
import { SITE } from "@config";

/**
 * /llms-full.txt - the full text of every published post as clean markdown.
 *
 * One fetch gives an AI assistant the entire corpus (raw markdown, which LLMs
 * consume better than rendered HTML), each section prefixed with the post's
 * title, canonical URL, and dates so quotes can be attributed correctly.
 */
export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);

  const documents = sortedPosts.map(post => {
    const { data, id } = post;
    const url = new URL(`posts/${id}/`, SITE.website).href;
    const published = data.pubDatetime.toISOString().slice(0, 10);
    const updated = data.modDatetime
      ? data.modDatetime.toISOString().slice(0, 10)
      : null;

    const meta = [
      `# ${data.title}`,
      "",
      `Source: ${url}`,
      `Author: ${data.author}`,
      `Published: ${published}${updated ? ` | Updated: ${updated}` : ""}`,
      data.tags.length ? `Tags: ${data.tags.join(", ")}` : null,
      "",
      data.description,
    ]
      .filter(line => line !== null)
      .join("\n");

    return `${meta}\n\n${absolutizeMarkdown(getPostBody(post))}`;
  });

  const body = [
    `# ${SITE.author} — Full Blog Content`,
    "",
    `> ${SITE.desc}`,
    "",
    "Every published post in full, as markdown. Free to read and cite with attribution.",
    "",
    documents.join("\n\n---\n\n"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
