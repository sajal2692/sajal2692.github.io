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
    // Tags the content pass folded away, 31 down to 12. Same argument as the
    // pagination URLs above: every one of these was built from the frontmatter,
    // listed in main's sitemap and indexed, so without a rule here they 404 for
    // anyone holding a search result. Each points at the tag that actually
    // absorbed its posts, taken from the frontmatter diff rather than chosen by
    // feel — `agentic-workflows -> ai-agents` and `aws -> machine-learning` were
    // literal substitutions in the posts that carried them. Tag URL to tag URL,
    // so the destination still lists the post the reader was looking for.
    //
    // The `/1` twin of each is spelled out rather than left to the
    // `/tags/[tag]/1` rule above: that one is a dynamic redirect, so Astro
    // enumerates it from the destination route's getStaticPaths and it covers
    // only the twelve tags that still exist. None of these had a `/2` — the
    // largest ran to four posts against the old five-per-page setting.
    "/tags/agentic-workflows": "/tags/ai-agents/",
    "/tags/agentic-workflows/1": "/tags/ai-agents/",
    "/tags/ai-integration": "/tags/ai-engineering/",
    "/tags/ai-integration/1": "/tags/ai-engineering/",
    "/tags/ai-tools": "/tags/ai-coding/",
    "/tags/ai-tools/1": "/tags/ai-coding/",
    "/tags/automation": "/tags/ai-agents/",
    "/tags/automation/1": "/tags/ai-agents/",
    "/tags/aws": "/tags/machine-learning/",
    "/tags/aws/1": "/tags/machine-learning/",
    "/tags/claude-code": "/tags/ai-coding/",
    "/tags/claude-code/1": "/tags/ai-coding/",
    "/tags/computer-vision": "/tags/machine-learning/",
    "/tags/computer-vision/1": "/tags/machine-learning/",
    "/tags/fastai": "/tags/machine-learning/",
    "/tags/fastai/1": "/tags/machine-learning/",
    "/tags/generative-ai": "/tags/llms/",
    "/tags/generative-ai/1": "/tags/llms/",
    "/tags/interviews": "/tags/career/",
    "/tags/interviews/1": "/tags/career/",
    "/tags/machine-learning-from-scratch": "/tags/machine-learning/",
    "/tags/machine-learning-from-scratch/1": "/tags/machine-learning/",
    "/tags/mcp": "/tags/ai-engineering/",
    "/tags/mcp/1": "/tags/ai-engineering/",
    "/tags/online-learning": "/tags/teaching/",
    "/tags/online-learning/1": "/tags/teaching/",
    "/tags/productivity": "/tags/ai-coding/",
    "/tags/productivity/1": "/tags/ai-coding/",
    "/tags/reflections": "/tags/career/",
    "/tags/reflections/1": "/tags/career/",
    "/tags/sandboxing": "/tags/ai-agents/",
    "/tags/sandboxing/1": "/tags/ai-agents/",
    "/tags/software-architecture": "/tags/ai-engineering/",
    "/tags/software-architecture/1": "/tags/ai-engineering/",
    "/tags/software-development": "/tags/ai-coding/",
    "/tags/software-development/1": "/tags/ai-coding/",
    "/tags/ventures": "/tags/product/",
    "/tags/ventures/1": "/tags/product/",
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
