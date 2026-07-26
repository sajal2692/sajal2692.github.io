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
      // measure (600px) + gap + rail (216px) to fit beside the text without
      // crowding it. 86% of readers are on desktop, so the rail earns its keep.
      lg: "1080px",
    },

    extend: {
      maxWidth: {
        // The reading measure: 640px is ~81 characters per line at Source Sans 3
        // 18px (600px was ~76, 680px ~86). `ch` is a trap here — 68ch of this
        // face measures 86 characters, not 68.
        measure: "640px",
        // The page shell: measure + gap + TOC rail + padding. The header uses it
        // too, so the nav rule lines up with the article's outer edges.
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
      fill: {
        skin: {
          base: withOpacity("--color-text-base"),
          accent: withOpacity("--color-accent"),
        },
        transparent: "transparent",
      },
      // Three self-hosted families (src/styles/fonts.css): Plex Serif for
      // display, Source Sans 3 for everything read, Plex Mono for metadata and
      // code. The sans fallbacks are the ones measured closest to Source Sans 3.
      // Family names are quoted deliberately: "Source Sans 3" ends in a digit,
      // and an unquoted CSS identifier cannot start with one, so the whole
      // font-family declaration gets dropped as invalid without the quotes.
      fontFamily: {
        sans: [
          '"Source Sans 3"',
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
