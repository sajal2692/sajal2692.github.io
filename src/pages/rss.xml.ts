import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import getSortedPosts from "@utils/getSortedPosts";
import getPostBody from "@utils/getPostBody";
import { absolutizeHtml } from "@utils/absolutizeUrls";
import { SITE } from "@config";

const parser = new MarkdownIt({ html: true, linkify: true });

export async function GET() {
  const posts = await getCollection("blog");
  const sortedPosts = getSortedPosts(posts);
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: sortedPosts.map(post => {
      const { data, id } = post;
      const content = absolutizeHtml(
        sanitizeHtml(parser.render(getPostBody(post)), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt", "title"],
          },
        })
      );
      return {
        link: `posts/${id}`,
        title: data.title,
        description: data.description,
        pubDate: new Date(data.modDatetime ?? data.pubDatetime),
        content,
      };
    }),
  });
}
