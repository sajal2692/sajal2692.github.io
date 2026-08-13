import { SITE } from "@config";
import type { CollectionEntry } from "astro:content";
import { OG } from "./theme";

export default (post: CollectionEntry<"blog">) => {
  return (
    <div
      style={{
        background: OG.paper,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* The same short accent rule that opens a section on the site. */}
        <div
          style={{
            width: "64px",
            height: "4px",
            background: OG.accent,
            marginBottom: "44px",
          }}
        />
        <p
          style={{
            fontFamily: OG.serif,
            fontWeight: 600,
            fontSize: 64,
            lineHeight: 1.18,
            letterSpacing: "-1px",
            color: OG.ink,
            margin: 0,
            maxHeight: "360px",
            overflow: "hidden",
          }}
        >
          {post.data.title}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: OG.mono,
          fontSize: 24,
          letterSpacing: "2px",
          color: OG.muted,
        }}
      >
        <span>{post.data.author.toUpperCase()}</span>
        <span>{new URL(SITE.website).hostname.toUpperCase()}</span>
      </div>
    </div>
  );
};
