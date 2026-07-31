import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, modDatetime, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    // 21px — the prose h3 rank, one step under the 28px .section-heading that
    // introduces the list, so the section boundary always outranks its items.
    // At the old 19px a title sat 1px above its own 18px description, so the
    // summary carried more visual mass than the link it belonged to.
    className: "text-[1.3125rem] leading-snug",
  };

  return (
    /* A card is title-over-summary — one block of prose, so the whole card
       takes the measure rather than the shell width its list now spans. Split
       the other way (long title to 936px, summary clamped to 640) the two
       stopped reading as one item. The bare-title rows on /posts are the
       opposite case and do run the full width. */
    <li className="my-8 max-w-measure">
      <a
        href={href}
        className="inline-block text-skin-base transition-colors hover:text-skin-accent"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      <Datetime
        pubDatetime={pubDatetime}
        modDatetime={modDatetime}
        className="mt-1.5"
      />
      {/* 16px: a summary in a list is secondary text, not article body copy.
          Leading is set explicitly because body's 1.72 is tuned for a 640px
          measure at 18px and reads loose at this size. */}
      <p className="mt-2 text-[1rem] leading-[1.6] text-skin-base">
        {description}
      </p>
    </li>
  );
}
