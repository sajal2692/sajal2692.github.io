function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    // Remove the following screen breakpoint or add other breakpoints
    // if one breakpoint is not enough for you
    screens: {
      sm: "640px",
      // Deliberate second breakpoint: the article's sticky TOC rail needs the
      // measure (40rem) + gap (4.5rem) + rail (14rem) to fit beside the text
      // without crowding it. 86% of readers are on desktop, so it earns its keep.
      // rem (67.5rem = 1080px by default) so it scales with the reader's browser
      // font size in step with the grid it gates — a px breakpoint let the rail
      // appear at widths where the rem-sized columns no longer fit.
      lg: "67.5rem",
    },

    extend: {
      maxWidth: {
        // The reading measure: 40rem is 640px at the default root size, ~81
        // characters per line at Source Sans 3 18px (600px was ~76, 680px ~86).
        // `ch` is a trap here — 68ch of this face measures 86 characters, not 68.
        // rem, not px, so the article grid keeps its arithmetic when a reader
        // raises the browser's default font size: with a px measure beside rem
        // gaps, a 24px root pushed the rail 58px past the viewport.
        measure: "40rem",
        // Non-article page content: wide enough for archive rows and two useful
        // card columns, but narrower than the article/header shell so the page
        // does not feel anchored to the left edge of that wider frame.
        content: "56rem",
        // The page shell: measure (40) + gap (4.5) + TOC rail (14) + padding (3).
        // The header and footer use it too, so their rules line up with the
        // article's outer edges.
        shell: "61.5rem",
      },
      textColor: {
        skin: {
          base: withOpacity("--color-text-base"),
          muted: withOpacity("--color-muted"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-fill"),
        },
      },
      backgroundColor: {
        skin: {
          fill: withOpacity("--color-fill"),
          accent: withOpacity("--color-accent"),
          inverted: withOpacity("--color-text-base"),
          card: withOpacity("--color-card"),
          line: withOpacity("--color-border"),
          code: withOpacity("--color-code-fill"),
        },
      },
      outlineColor: {
        skin: {
          fill: withOpacity("--color-accent"),
        },
      },
      borderColor: {
        skin: {
          line: withOpacity("--color-border"),
          fill: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
      },
      // No `fill` or `stroke` scale: the only SVG colouring left on the site is
      // `.icon`, which uses core's `fill-none` and `stroke-current` and takes
      // its colour from the parent's `color`. `fill-skin-*` and
      // `fill-transparent` lost their last callers when the icons became one
      // stroke set; `stroke` was never extended at all, which is how the
      // visualiser's `stroke-skin-line` came to compile to nothing.
      // Three self-hosted families (src/styles/fonts.css): Plex Serif for
      // display, Source Sans 3 for everything read, Plex Mono for metadata and
      // code. The sans fallbacks are the ones measured closest to Source Sans 3.
      // Family names are quoted deliberately: "Source Sans 3" ends in a digit,
      // and an unquoted CSS identifier cannot start with one, so the whole
      // font-family declaration gets dropped as invalid without the quotes.
      fontFamily: {
        // "Source Sans 3 Fallback" is the metrics-matched face declared in
        // fonts.css; it sits ahead of the system stack so the swap does not
        // re-wrap paragraphs. See the comment there for the measurements.
        sans: [
          '"Source Sans 3"',
          '"Source Sans 3 Fallback"',
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "sans-serif",
        ],
        serif: ['"IBM Plex Serif"', '"Iowan Old Style"', "Georgia", "serif"],
        mono: [
          '"IBM Plex Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },

      typography: {
        DEFAULT: {
          css: {
            // These four have to live here rather than in base.css: the plugin
            // sets them on `.prose` itself (not through :where()), and its
            // styles land in a later layer, so a `.prose` rule in @layer base
            // loses on source order.
            fontSize: "1.125rem",
            lineHeight: "1.72",
            // Ink, not the plugin's cool gray-700, which fights the warm paper.
            color: "rgb(var(--color-text-base))",
            // The measure comes from the article column (max-w-measure), not
            // from the plugin's 65ch — which is 74 characters in this face.
            maxWidth: "none",
            pre: {
              color: false,
            },
            code: {
              color: false,
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
