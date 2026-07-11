import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
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
      ],
      rehypePlugins: [rehypeKatex],
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
