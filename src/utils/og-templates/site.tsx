import { SITE } from "@config";
import { OG } from "./theme";

export default () => {
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
            fontSize: 76,
            lineHeight: 1.15,
            letterSpacing: "-1px",
            color: OG.ink,
            margin: 0,
          }}
        >
          {SITE.title}
        </p>
        <p
          style={{
            fontFamily: OG.serif,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.4,
            color: OG.muted,
            marginTop: "24px",
            maxHeight: "180px",
            overflow: "hidden",
          }}
        >
          {SITE.desc}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          fontFamily: OG.mono,
          fontSize: 24,
          letterSpacing: "2px",
          color: OG.muted,
        }}
      >
        <span>{new URL(SITE.website).hostname.toUpperCase()}</span>
      </div>
    </div>
  );
};
