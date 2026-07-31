import type { Element, ElementContent, Root } from "hast";

/**
 * Wraps every markdown table in a scroll container.
 *
 * Making the `<table>` itself `display: block` so it could scroll cost the
 * table its layout box, and with it the implicit table/row/cell roles a screen
 * reader navigates by. It also did not do the job it was there for: a block box
 * still reports its full content width as a min-content contribution, so a wide
 * table sized the article column past the viewport and scrolled the whole page
 * sideways instead of scrolling in place.
 *
 * The wrapper carries `tabindex` so a keyboard user can scroll the region at
 * all (WCAG 2.1.1), plus `role="region"` and a name so that focus stop is
 * announced rather than being a silent one.
 */
export default function rehypeTableScroll() {
  return (tree: Root) => {
    walk(tree);
  };
}

/**
 * Raw HTML passed straight through from the markdown. `hast`'s own content
 * types do not include it — the node only exists between mdast-to-hast and
 * serialisation — so it is declared here rather than imported.
 */
interface RawNode {
  type: "raw";
  value: string;
}

type Child = ElementContent | RawNode;

function walk(parent: Root | Element): void {
  const children = parent.children as Child[];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Tables written as raw HTML in the markdown (the fastai post pastes two
    // pandas `.to_html()` blocks) never become elements, so the element pass
    // below cannot see them. They still have to be constrained or they size the
    // article column and scroll the page.
    if (child.type === "raw") {
      child.value = wrapRawTables(child.value);
      continue;
    }

    if (child.type !== "element") continue;

    if (child.tagName === "table") {
      children[i] = wrapTable(child);
    }

    walk(child);
  }
}

const OPEN_TAG =
  '<div class="table-scroll" role="region" aria-label="Table" tabindex="0">';

function wrapRawTables(html: string): string {
  if (!html.includes("<table")) return html;
  // Already wrapped (a rebuild, or the author wrapped it by hand).
  if (html.includes('class="table-scroll"')) return html;
  return html.replace(
    /<table[\s\S]*?<\/table>/g,
    match => `${OPEN_TAG}${match}</div>`
  );
}

function wrapTable(table: Element): Element {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: ["table-scroll"],
      role: "region",
      ariaLabel: "Table",
      tabIndex: 0,
    },
    children: [table],
  };
}
