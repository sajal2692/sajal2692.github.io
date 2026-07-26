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
    },

    extend: {
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
            // Body copy at 18px/1.72. This has to live here rather than in
            // base.css: the plugin sets font-size and line-height on `.prose`
            // itself (not through :where()), and its styles land in a later
            // layer, so a `.prose` rule in @layer base loses on source order.
            fontSize: "1.125rem",
            lineHeight: "1.72",
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
