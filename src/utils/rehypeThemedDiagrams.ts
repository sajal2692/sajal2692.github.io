import type { Element, Root } from "hast";
import diagrams from "../data/blog-diagrams.json";

/** Enhance only registered diagrams; raw Markdown keeps one PNG for feeds. */
export default function rehypeThemedDiagrams() {
  return (tree: Root) => walk(tree);
}

function walk(parent: Root | Element): void {
  parent.children = parent.children.map(node => {
    if (node.type !== "element") return node;
    const image =
      node.tagName === "p" && node.children.length === 1
        ? node.children[0]
        : null;
    const diagram =
      image?.type === "element" && image.tagName === "img"
        ? diagrams.find(item => item.fallback === image.properties.src)
        : null;

    if (!diagram) {
      walk(node);
      return node;
    }

    const wide = diagram.width / diagram.height > 2;
    const variants: Element[] = (["light", "dark"] as const).map(theme => ({
      type: "element",
      tagName: "a",
      properties: {
        className: [`diagram-${theme}`],
        href: diagram[theme],
        title: "Open diagram at full size",
      },
      children: [
        {
          type: "element",
          tagName: "img",
          properties: {
            src: diagram[theme],
            alt: diagram.alt,
            width: diagram.width,
            height: diagram.height,
            loading: "lazy",
            decoding: "async",
          },
          children: [],
        },
      ],
    }));

    return {
      type: "element",
      tagName: "figure",
      properties: { className: ["themed-diagram"] },
      children: [
        {
          type: "element",
          tagName: "div",
          properties: wide
            ? {
                className: ["diagram-scroll"],
                role: "region",
                ariaLabel: `${diagram.title} — scroll horizontally`,
                tabIndex: 0,
              }
            : {},
          children: variants,
        },
        {
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [
            {
              type: "text",
              value: wide
                ? "Scroll to see all three models. Select the diagram to open it at full size."
                : "Select the diagram to open it at full size.",
            },
          ],
        },
      ],
    } satisfies Element;
  });
}
