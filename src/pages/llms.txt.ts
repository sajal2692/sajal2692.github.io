import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import getSortedPosts from "@utils/getSortedPosts";
import { SITE } from "@config";

/**
 * /llms.txt - an llmstxt.org-format index of the site for AI assistants.
 *
 * A curated map (title + description + absolute URL) of every published post
 * plus key pages, so an assistant can discover and cite the content. The full
 * prose lives in /llms-full.txt; this file is the table of contents.
 */
export const GET: APIRoute = async () => {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);

  const postLines = sortedPosts.map(({ data, id }) => {
    const url = new URL(`posts/${id}/`, SITE.website).href;
    return `- [${data.title}](${url}): ${data.description}`;
  });

  const pageLines = [
    // Trailing slashes: these are the pages' own canonical URLs. Without them
    // every link here costs a redirect hop and disagrees with the sitemap.
    `- [About Me](${new URL("about/", SITE.website).href}): About ${SITE.author} — background, experience, and work.`,
    `- [Teaching](${new URL("teaching/", SITE.website).href}): O'Reilly courses on AI agents and RAG, Yale guest lectures, and mentoring.`,
    `- [Contact](${new URL("contact/", SITE.website).href}): How to reach ${SITE.author}, and the work he takes on.`,
    `- [Blog](${new URL("posts/", SITE.website).href}): All blog posts.`,
    `- [Full content](${new URL("llms-full.txt", SITE.website).href}): Every post's full text as markdown.`,
  ];

  const body = [
    `# ${SITE.author}`,
    "",
    `> ${SITE.desc}`,
    "",
    "This site publishes long-form writing on agentic AI systems, LLMs, RAG, and machine learning engineering. Content is free to read and cite with attribution.",
    "",
    "## Blog Posts",
    "",
    ...postLines,
    "",
    "## Pages",
    "",
    ...pageLines,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
