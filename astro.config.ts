import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import partytown from "@astrojs/partytown";

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
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
      "remark-math",
    ],
    rehypePlugins: ["rehype-katex"],
    shikiConfig: {
      // Dual theme: light syntax palette in light mode, one-dark-pro in dark mode.
      // shikiji applies the light theme's colors inline and exposes the dark
      // theme via --shiki-dark* CSS variables, which base.css swaps in for dark mode.
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
