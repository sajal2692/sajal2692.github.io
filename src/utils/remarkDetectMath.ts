import type { Root } from "mdast";
import type { VFile } from "vfile";

/**
 * Flags posts that actually contain math, so the KaTeX stylesheet can be loaded
 * only where it does something.
 *
 * The alternative — grepping the raw markdown for `$` — would have to
 * re-implement remark-math's own delimiter rules to avoid firing on a `$` in
 * prose or inside a fenced block. Reading the tree after remark-math has parsed
 * it asks the parser instead of guessing at it.
 *
 * Must run after remarkMath: before it, the math nodes do not exist yet and
 * every post looks math-free. The flag surfaces on `remarkPluginFrontmatter`
 * from `render()`, which does not go through the collection schema.
 */
export default function remarkDetectMath() {
  return (tree: Root, file: VFile) => {
    const data = file.data as {
      astro?: { frontmatter?: Record<string, unknown> };
    };
    const frontmatter = data.astro?.frontmatter;
    if (!frontmatter) return;

    frontmatter.hasMath = containsMath(tree);
  };
}

interface MaybeParent {
  type: string;
  children?: MaybeParent[];
}

/** remark-math emits `math` for display blocks and `inlineMath` for `$…$`. */
function containsMath(node: MaybeParent): boolean {
  if (node.type === "math" || node.type === "inlineMath") return true;
  return node.children?.some(containsMath) ?? false;
}
