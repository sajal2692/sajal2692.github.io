// Tailwind v3 is wired through PostCSS directly; the @astrojs/tailwind
// integration only supports Astro <= 5.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
