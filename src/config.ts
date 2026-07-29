import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://sajalsharma.com/", // replace this with your deployed domain
  author: "Sajal Sharma",
  desc: "Internet home of Sajal Sharma — AI engineer and O'Reilly instructor specializing in agentic AI systems, LLMs, and machine learning.",
  title: "Sajal Sharma",
  ogImage: "sajalsharma-og.png",
  lightAndDarkMode: true,
  // Tag pages only — the post archive is a single unpaginated index. 20 is
  // above every tag's current count, so nothing splits today; the pagination
  // machinery stays wired for when one genuinely grows past a page.
  postPerPage: 20,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    label: "GitHub",
    href: "https://github.com/sajal2692",
    linkTitle: `${SITE.title} on GitHub`,
    active: true,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/sajals",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    // "Email", not "Mail": it is a word in a row of words now, not an envelope.
    label: "Email",
    href: "mailto:contact@sajalsharma.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
];
