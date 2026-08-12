/**
 * The share card's half of the design system.
 *
 * Satori cannot read the site's CSS custom properties, so the light-theme
 * values from src/styles/base.css are mirrored here. Keep them in step: a card
 * is often the first thing anyone sees of the site, and it should not arrive in
 * a palette the site itself no longer uses.
 */
export const OG = {
  paper: "#FAFAFA", // --color-fill
  ink: "#1C1C1C", // --color-text-base
  muted: "#6B6B6B", // --color-muted
  accent: "#0D7085", // --color-accent
  serif: "IBM Plex Serif",
  mono: "IBM Plex Mono",
} as const;
