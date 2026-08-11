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
 * announced rather than being a silent one. The name comes from the heading the
 * table sits under: a post with two regions both announced "Table" gives a
 * screen reader user nothing to steer by when moving between regions.
 */
export default function rehypeTableScroll() {
  return (tree: Root) => {
    // State is per-document: the used-name map must not leak between posts.
    walk(tree, { heading: null, used: new Map() });
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

interface State {
  /** Text of the nearest heading seen so far, in document order. */
  heading: string | null;
  /** Names already handed out on this page, for disambiguating duplicates. */
  used: Map<string, number>;
}

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function walk(parent: Root | Element, state: State): void {
  const children = parent.children as Child[];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    // Tables written as raw HTML in the markdown (the fastai post pastes two
    // pandas `.to_html()` blocks) never become elements, so the element pass
    // below cannot see them. They still have to be constrained or they size the
    // article column and scroll the page.
    if (child.type === "raw") {
      child.value = wrapRawTables(child.value, state);
      continue;
    }

    if (child.type !== "element") continue;

    if (HEADINGS.has(child.tagName)) {
      state.heading = textOf(child) || null;
      continue;
    }

    if (child.tagName === "table") {
      children[i] = wrapTable(child, state);
      continue;
    }

    walk(child, state);
  }
}

/**
 * Concatenated text of an element, for use as a region name. Structural typing
 * rather than hast's node unions: this only ever reads `value` and `children`,
 * and the unions differ by parent type in ways that add nothing here.
 */
interface TextBearing {
  type: string;
  value?: string;
  children?: TextBearing[];
}

function textOf(node: Element): string {
  const parts: string[] = [];
  const visit = (n: TextBearing): void => {
    if (n.type === "text" && n.value) parts.push(n.value);
    n.children?.forEach(visit);
  };
  visit(node as unknown as TextBearing);
  return parts.join("").replace(/\s+/g, " ").trim();
}

/**
 * "Rotten fruit dataset table", not "Table" — and a trailing ordinal only when
 * a page repeats a name, which is the case the plain label failed at.
 */
function nameFor(state: State): string {
  const base = state.heading ? `${truncate(state.heading)} table` : "Table";
  const seen = (state.used.get(base) ?? 0) + 1;
  state.used.set(base, seen);
  return seen === 1 ? base : `${base} ${seen}`;
}

/** Headings run long enough to be tiring read aloud as a region name. */
function truncate(text: string, max = 60): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function wrapRawTables(html: string, state: State): string {
  if (!html.includes("<table")) return html;
  // Already wrapped (a rebuild, or the author wrapped it by hand).
  if (html.includes('class="table-scroll"')) return html;
  return html.replace(
    /<table[\s\S]*?<\/table>/g,
    match =>
      `<div class="table-scroll" role="region" aria-label="${escapeAttr(
        nameFor(state)
      )}" tabindex="0">${match}</div>`
  );
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function wrapTable(table: Element, state: State): Element {
  return {
    type: "element",
    tagName: "div",
    properties: {
      className: ["table-scroll"],
      role: "region",
      ariaLabel: nameFor(state),
      tabIndex: 0,
    },
    children: [table],
  };
}
