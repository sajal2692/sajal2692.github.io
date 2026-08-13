import { SOCIALS } from "@config";

/**
 * Profile URLs are read from SOCIALS rather than written out again: the footer
 * already links them on every page, and two copies of a vanity URL is one copy
 * too many. Thrown rather than skipped when an entry is missing or inactive —
 * a link that quietly stops rendering on a page is the kind of thing nobody
 * notices for months, and a failed build is fixed in seconds.
 *
 * Lived inside about.astro until /contact needed the same LinkedIn lookup.
 * Shared rather than copied for the reason the rest of this redesign shares
 * things: two copies of a rule is a constraint nothing enforces.
 */
export default function socialHref(label: string): string {
  const social = SOCIALS.find(s => s.label === label && s.active);
  if (!social) {
    throw new Error(`socialHref: no active ${label} entry in SOCIALS`);
  }
  return social.href;
}
