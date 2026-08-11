import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import remarkDetectMath from "./src/utils/remarkDetectMath";
import rehypeKatex from "rehype-katex";
import rehypeTableScroll from "./src/utils/rehypeTableScroll";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  // Static redirects (emitted as meta-refresh pages, which GitHub Pages can serve)
  redirects: {
    // Legacy pre-Astro URL still linked from old external threads and bookmarks
    "/coding-k-means-clustering-using-python-and-num-py":
      "/posts/coding-kmeans-clustering-python-numpy/",
    // The post's slug had a typo (missing "r") until July 2026
    "/posts/overview-multi-agent-fameworks":
      "/posts/overview-multi-agent-frameworks/",
    // The interactive backpropagation page was removed in July 2026. It was
    // never a post and nothing on the site linked to it, but it was live and
    // indexed, so anyone arriving from search lands on the writing instead of
    // a 404. There is no successor post to point at.
    "/backprop-visualization": "/posts/",
    // Pagination URLs main published and the redesign retired. postPerPage went
    // 5 -> 20, and the archive stopped emitting a second, unlinked paginated
    // copy of itself, so every numbered page below was live and in main's
    // sitemap and would otherwise 404 for anyone holding a search result.
    "/posts/1": "/posts/",
    "/posts/2": "/posts/",
    "/posts/3": "/posts/",
    "/posts/4": "/posts/",
    // Page 1 of every tag was always a duplicate of the bare tag URL. No
    // trailing slash on the destination, unlike every other redirect here: a
    // dynamic destination has to match a route pattern, and the route is
    // `/tags/[tag]`, so `/tags/[tag]/` fails the build outright. The cost is
    // that these land on the slashless URL and take GitHub Pages' own 301 to
    // the canonical one — a second hop, on a legacy URL nothing links to.
    "/tags/[tag]/1": "/tags/[tag]",
    // Tags that ran past one page at the old 5-per-page setting.
    "/tags/ai-engineering/2": "/tags/ai-engineering/",
    "/tags/ai-engineering/3": "/tags/ai-engineering/",
    "/tags/llms/2": "/tags/llms/",
    "/tags/ai-agents/2": "/tags/ai-agents/",
    "/tags/langgraph/2": "/tags/langgraph/",
  },
  integrations: [react(), sitemap()],
  markdown: {
    // Keep the remark/rehype pipeline (TOC, collapsible sections, LaTeX math)
    // instead of Astro 7's default Sätteri processor.
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [
          remarkCollapse,
          {
            test: "Table of contents",
          },
        ],
        remarkMath,
        // After remarkMath: before it the math nodes do not exist yet, and every
        // post would look math-free. Sets `hasMath` on remarkPluginFrontmatter,
        // which PostDetails uses to load the KaTeX stylesheet only where there
        // is math to style.
        remarkDetectMath,
      ],
      rehypePlugins: [rehypeKatex, rehypeTableScroll],
    }),
    shikiConfig: {
      // Dual theme: light syntax palette in light mode, one-dark-pro in dark mode.
      // Shiki applies the light theme's colors inline and exposes the dark
      // theme via --shiki-dark* CSS variables, which base.css swaps in for dark mode.
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      wrap: true,
      // Shiki puts `tabindex="0"` on the <pre> because it assumes the <pre> is
      // the scroll port. base.css moves the scroll to `pre > code` so the
      // language bar and copy button do not slide out of view with the code,
      // which left the focus stop on a box that no longer scrolls and made the
      // code itself unreachable from the keyboard. Move the affordance to the
      // box that actually scrolls. Done here rather than in a rehype plugin
      // because shiki runs after those and would put the attribute back.
      transformers: [
        {
          name: "scroll-affordance-on-code",
          pre(node) {
            delete node.properties.tabindex;
          },
          code(node) {
            node.properties.tabindex = "0";
          },
        },
      ],
    },
  },
  // Preserve pre-v7 whitespace handling between inline elements.
  compressHTML: true,
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
