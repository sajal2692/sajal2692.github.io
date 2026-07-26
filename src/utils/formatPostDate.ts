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

/** Machine-readable form for <time datetime>. */
export const toIsoDate = (value: string | Date): string =>
  new Date(value).toISOString();
