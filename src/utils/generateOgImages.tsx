import { readFile } from "node:fs/promises";
import { join } from "node:path";
import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

// Satori needs ttf/otf, so it cannot reuse the woff2 files in public/fonts.
// The families still match the site's: Plex Serif for display, Plex Mono for
// the metadata line.
//
// Read from disk rather than fetched from 1001fonts.com at build time. The site
// rebuilds on a nightly cron now, so a fetch here is a third-party dependency
// exercised unattended every night — and satori cannot render a card without
// its faces, so an outage there is a failed build rather than a degraded one.
// These live outside public/ deliberately: they are build inputs, not assets
// the site should serve. See fonts/README.md for provenance.
//
// Resolved from the project root, not from `import.meta.url`: this module is
// bundled into dist/.prerender/chunks before it runs, so a module-relative URL
// points at a chunk directory the fonts were never copied into. The build only
// ever runs from the project root, which makes cwd the stable anchor.
const FONT_DIR = join(process.cwd(), "src/utils/og-templates/fonts");
const readFont = (file: string): Promise<Buffer> =>
  readFile(join(FONT_DIR, file));

const [serifRegular, serifSemibold, monoRegular] = await Promise.all([
  readFont("ibm-plex-serif.regular.ttf"),
  readFont("ibm-plex-serif.semibold.ttf"),
  readFont("ibm-plex-mono.regular.ttf"),
]);

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "IBM Plex Serif",
      data: serifRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "IBM Plex Serif",
      data: serifSemibold,
      weight: 600,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: monoRegular,
      weight: 400,
      style: "normal",
    },
  ],
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await satori(postOgImage(post), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await satori(siteOgImage(), options);
  return svgBufferToPngBuffer(svg);
}
