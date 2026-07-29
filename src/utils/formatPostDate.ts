import { LOCALE } from "@config";

/**
 * The site's one post-date format. Every surface that prints a post date — the
 * article kicker, the list rows, the archive — goes through here, so they cannot
 * drift apart the way three hand-rolled copies did (one of them was still on a
 * hardcoded "en-US" with a 2-digit day).
 *
 * timeZone is pinned to UTC because post dates are authored as UTC midnight:
 * without it a local dev build and the UTC CI build disagree about the day, and
 * two pages rendering the same post could show different dates.
 */
export const formatPostDate = (value: string | Date): string =>
  new Date(value).toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/**
 * Day and month only, for list rows that sit under a year heading. Same UTC
 * pinning as `formatPostDate` and for the same reason — this started life as a
 * private helper in the archive page, and the first other page to want it
 * promptly rebuilt it without the timeZone, printing dates a day early.
 */
export const formatPostDayMonth = (value: string | Date): string =>
  new Date(value).toLocaleDateString(LOCALE.langTag, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

/** Machine-readable form for <time datetime>. */
export const toIsoDate = (value: string | Date): string =>
  new Date(value).toISOString();
