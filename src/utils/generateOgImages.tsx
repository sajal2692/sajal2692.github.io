import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

// Satori needs ttf/otf, so it cannot reuse the woff2 files in public/fonts.
// The families still match the site's: Plex Serif for display, Plex Mono for
// the metadata line.
const FONT_URLS = {
  serifRegular:
    "https://www.1001fonts.com/download/font/ibm-plex-serif.regular.ttf",
  serifSemibold:
    "https://www.1001fonts.com/download/font/ibm-plex-serif.semibold.ttf",
  monoRegular:
    "https://www.1001fonts.com/download/font/ibm-plex-mono.regular.ttf",
} as const;

const fetchFont = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OG font fetch failed (${response.status}): ${url}`);
  }
  return response.arrayBuffer();
};

const [serifRegular, serifSemibold, monoRegular] = await Promise.all([
  fetchFont(FONT_URLS.serifRegular),
  fetchFont(FONT_URLS.serifSemibold),
  fetchFont(FONT_URLS.monoRegular),
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
