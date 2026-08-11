# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website and blog built with **Astro v7** using the **AstroPaper theme**. The site showcases professional work in Machine Learning, NLP, and AI, with a focus on blog content and portfolio presentation.

**Technology Stack:**
- Astro.js (static site generator)
- React (for interactive components)
- TailwindCSS v3 (styling with custom skin tokens, wired via `postcss.config.mjs` — not the deprecated `@astrojs/tailwind` integration)
- TypeScript
- Markdown with MDX support

**Deployment:** GitHub Pages (automated via GitHub Actions on push to `main` branch)

## Essential Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:4321
npm start            # Alias for dev

# Build & Deploy
npm run build        # Type-check, build, and optimize with jampack
npm run preview      # Preview production build locally

# Code Quality
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run lint         # Lint with ESLint

# Related posts
npm run related:generate # Embed changed posts (needs OPENAI_API_KEY in .env) and refresh the artifact
npm run related:check    # Verify src/generated/related-posts.json is current (pure hashing, no API calls)
npm run related:force    # Discard the embedding cache and re-embed everything
npm run related:report   # Write per-pair calibration report to .cache/related-posts/report.json

# KaTeX
npm run katex:vendor # Re-copy the stylesheet + woff2 faces from the installed katex into public/katex
npm run katex:check  # Verify public/katex matches the installed version (runs in build)
```

**Pre-commit hooks:** Husky runs `related:check` (blocks commits when the related-posts artifact is stale or regenerated but unstaged) and `lint-staged` (auto-formats staged files with Prettier).

## Architecture

### Configuration-Driven Design

The site is highly configurable through `src/config.ts`:
- `SITE`: Core site metadata (title, author, description, URL, pagination)
- `SOCIALS`: Social media links with active/inactive flags
- `LOCALE`: Language settings
- `LOGO_IMAGE`: Logo configuration

### Content Collections

Blog posts live in `src/content/blog/` as Markdown files, loaded with the `glob()` loader and validated against the schema in `src/content.config.ts`:

**Required frontmatter fields:**
- `title`: Post title
- `pubDatetime`: Publication date (Date object)
- `description`: Post description
- `author`: Defaults to SITE.author
- `tags`: Array of strings, defaults to ["others"]

**Optional fields:**
- `slug`: Overrides the URL slug (otherwise derived from the filename). The `generateId` callback in `src/content.config.ts` makes entry ids honor this field, so existing post URLs must not change when files are renamed
- `featured`: Boolean for featuring posts
- `draft`: Boolean to exclude from production
- `modDatetime`: Last modified date. Set/refresh this whenever a published post is materially updated (drives the "updated" timestamp and `article:modified_time` meta tag)
- `series` / `seriesOrder`: Group posts into an ordered series (e.g. `agentic-rag`); adjacent entries rank first in Related Posts
- `relatedPosts`: Up to 3 entry ids to pin as related, outranking automatic results
- `ogImage`: Must be ≥1200x630px or string path
- `canonicalURL`: For cross-posted content

### Dynamic Routing

- `/posts/[slug]/` - Individual blog posts (from content collections)
- `/posts/` - Paginated blog listing
- `/tags/[tag]/` - Posts filtered by tag
- `/` - Homepage with featured posts

### Styling System

TailwindCSS with **CSS variable-based theming** for light/dark mode:
- Uses `--color-*` CSS variables (e.g., `--color-text-base`, `--color-accent`)
- Custom `withOpacity()` function for RGBA color utilities
- Access via `skin-*` utility classes (e.g., `text-skin-base`, `bg-skin-fill`). Only the scales `tailwind.config.cjs` extends exist — `text`, `bg`, `border`, `outline`. There is deliberately no `fill`/`stroke` scale, so `fill-skin-*` silently compiles to nothing
- Custom breakpoints: `sm: 640px` and `lg: 67.5rem` (the second gates the article's TOC rail, which needs measure + gap + rail to fit; it is in `rem` so it scales with the reader's font size)
- Self-hosted type in `src/styles/fonts.css` (IBM Plex Serif display, Source Sans 3 body, IBM Plex Mono metadata/code), with the above-the-fold faces preloaded in `Layout.astro`
- The measure/content/shell widths are named `maxWidth` tokens, not ad-hoc values. Note that `mx-auto` on a grid item turns off `stretch` and makes it shrink-to-fit — pair it with `w-full` or a wide code block will size the column

### Markdown Processing

Configured in `astro.config.ts` using the `unified()` processor from `@astrojs/markdown-remark` (not Astro 7's default Sätteri processor) so the remark/rehype plugins keep working:
- **Remark plugins**: `remark-toc` (table of contents), `remark-collapse` (collapsible sections), `remark-math` (LaTeX math), `remarkDetectMath` (sets `hasMath` on `remarkPluginFrontmatter` — must stay *after* `remark-math`, or the math nodes it looks for do not exist yet)
- **Rehype plugins**: `rehype-katex` (math rendering), `rehypeTableScroll` (wraps every table in a focusable, labelled scroll container — the table itself must stay `display: table` or it loses its row/cell roles and pushes the article column sideways)
- **Syntax highlighting**: Shiki dual themes ("github-light" / "one-dark-pro"), swapped by CSS variables in `src/styles/base.css`. A `shikiConfig.transformers` entry moves shiki's `tabindex` from the `<pre>` onto `pre > code`, which is the element `base.css` makes the scroll port. Rehype plugins run *before* shiki, so anything touching shiki's output belongs in a transformer, not a plugin

### Utility Functions (`src/utils/`)

- `getSortedPosts()`: Returns posts sorted by date, filtering drafts in production
- `getRelatedPosts()`: Resolves the precomputed related-posts artifact against the collection, filtering drafts/scheduled posts
- `getPostsByTag()`: Filter posts by tag name
- `getUniqueTags()`: Extract all unique tags from posts
- `postFilter()`: Filter logic for draft/scheduled posts
- `slugify()`: Convert strings to URL-safe slugs
- `getPagination()`: Calculate pagination boundaries
- `formatPostDate()`: The site's one post-date format (UTC-pinned, `LOCALE.langTag`). Every surface printing a post date goes through it
- `getReadingTime()`: Reading-time estimate for the article kicker
- `generateOgImages.tsx`: Generate Open Graph images with Satori. Templates in `src/utils/og-templates/`; their palette mirrors the light theme via `og-templates/theme.ts` and must be kept in step with `base.css`
- `rehypeTableScroll.ts`: The table-wrapping rehype plugin described above

### Component Structure

**Layout Components:**
- `Layout.astro`: Base layout with SEO, analytics (Google Analytics gtag on the main thread, plus the delegated `link_click` listener)
- `Main.astro`: Main content wrapper — owns the page title/kicker/deck block every non-article page renders through
- `PostDetails.astro`: Blog post layout, including the article grid and the sticky TOC rail. The rail sits *before* the article in source order (tab order) and is placed into the right column with explicit `grid-column`/`grid-row`
- `TagPosts.astro`: Tag listing layout

There is no `Posts.astro` or `AboutLayout.astro`: the archive is `src/pages/posts/index.astro` and About is `src/pages/about.astro`, both rendering through `Main.astro`.

**Key Components:**
- `Header.astro`: Navigation with hamburger menu
- `Search.tsx`: Client-side search using Fuse.js
- `Card.tsx`: Blog post preview cards
- `CourseCard.astro`: Shared course card, used by both the homepage and `/teaching` so the two cannot drift
- `Datetime.tsx`: Formatted datetime display
- `Newsletter.astro`: Newsletter signup form
- `RelatedPosts.astro`: Static "Related Posts" section on post pages (hidden when empty)
- `Tag.astro`: Tag display component

**Data:**
- `src/data/teaching.ts`: The single source of truth for courses, talks and mentoring. Session visibility is computed against build time, so the site needs a scheduled rebuild for expiries to take effect (see the deploy workflow's `schedule` trigger)

## Important Notes

### Post Scheduling
Posts with `pubDatetime` in the future are hidden in production (configurable via `SITE.scheduledPostMargin` - currently 15 minutes).

### Related Posts
Each post page shows up to 3 related posts (5 stored), precomputed at authoring time — no runtime lookups and no API calls in CI:
- `scripts/related-posts.mjs` scores every pair with four signals, each producing its own per-source ranking: title+description embedding cosine (OpenAI `text-embedding-3-large`), symmetric body-chunk coverage (cleaned prose in ~375-word chunks; fenced code, HTML, and generic heading labels like "Introduction" are stripped first), symmetric BM25F lexical similarity (title/description/body fields, each direction normalized by its query's IDF mass), and IDF-weighted tag overlap. Rankings fuse via weighted RRF (0.45 title+description / 0.25 body / 0.25 BM25F / 0.05 tags, K=10); an absolute evidence gate then admits a candidate only on strong title+description cosine (>= 0.60) or body coverage and lexical similarity agreeing independently (>= 0.512 and >= 0.035). Tags never admit a candidate alone. Manual `relatedPosts` pins and series neighbors outrank automatic results and bypass the gate — posts may legitimately have fewer than 3 related posts or none. Recalibrate gate thresholds with `npm run related:report` after changing scoring; pin cross-topic pairs the signals undervalue via `relatedPosts` instead of lowering thresholds
- Committed artifact: `src/generated/related-posts.json` (keys/values are entry ids, which mirror `generateId` in `src/content.config.ts`). Embedding vectors live in the gitignored `.cache/related-posts/`, cached per summary and per body chunk: title/description edits re-embed one summary, body edits re-embed only the changed chunks, and tag or config changes re-rank locally with no API call (fenced code never affects embeddings)
- `npm run dev` and `npm run build` run `related:ensure`, which never fails a build: without `OPENAI_API_KEY` it warns and keeps the committed artifact. GitHub Actions therefore needs no OpenAI credentials and must not be given any — regeneration happens locally, enforced by the pre-commit `related:check`

### Analytics (GA4 link-click tracking)
GA4 loads as a plain async main-thread script in `Layout.astro`, gated on the build-time `GA_TRACKING_ID` env var and a runtime `sajalsharma.com` hostname check (Partytown was removed: its worker transport dropped most events, and main-thread cost measured at 0 Lighthouse points / +9-14ms TBT). A delegated listener in `Layout.astro` fires a `link_click` event for every anchor click (`click` + middle-click `auxclick`; same-document hash jumps skipped) with params `link_section`, `link_url`, `link_domain`, `link_text`, `outbound` — the last four reuse Enhanced Measurement's names so GA4's built-in dimensions pick them up; `link_section` is a registered event-scoped custom dimension:
- `link_section` comes from the nearest `data-track` container attribute (`header`, `footer`, `socials`, `share-links`, `related-posts`, `pagination`, `search-results`, `home-hero`, `courses`, `featured-posts`, `home-all-posts`, `home-all-teaching`, `teaching-courses`, `teaching-talks`, `teaching-mentorship`, `teaching-contact`, `posts-list`, `post-body`, `post-nav`, `post-tags`, `about`), falling back to `other`. When adding a new link-bearing section, put `data-track` on its container — never on individual anchors; `LinkButton.astro` does not forward extra props
- Off-production hostnames log the payload via `console.debug("[link_click]", ...)` instead of sending — click through pages in the dev server to verify
- Query from the terminal with the `ga4` CLI (see `.claude/skills/ga4-cli`), e.g. `ga4 report -m eventCount -d customEvent:link_section -f 'eventName==link_click' -r 28d`

### KaTeX (math rendering)

The stylesheet is self-hosted at `/katex/katex.min.css` and loaded **only on
posts that contain math** — `remarkDetectMath` reads the parsed tree and sets
`hasMath`, which `PostDetails.astro` passes to `Layout.astro` to emit the
`<link>` in `<head>`. One of 18 posts uses math today; the old setup shipped a
render-blocking jsdelivr link from the document *body* on all 18.

`public/katex/` is vendored from the installed `katex` package by
`scripts/vendor-katex.mjs`, woff2 only (324 KB; the woff/ttf fallbacks would
triple it for browsers the site already does not serve). `npm run katex:check`
runs as part of `npm run build` and fails when the copy falls behind a version
bump — the previous hardcoded CDN URL had drifted to 0.15.2 while the markup
was being generated by 0.16.47. Re-vendor with `npm run katex:vendor`.

### OG Image Generation
The `/og.png.ts` endpoint dynamically generates Open Graph images. Custom templates live in `src/utils/og-templates/`.

### RSS Feed
Auto-generated at `/rss.xml` from all published posts. Full-content feed: each item's `content:encoded` carries the whole post, rendered from raw markdown with `markdown-it` + `sanitize-html`. Autodiscoverable via `<link rel="alternate">` in `Layout.astro`.

### llms.txt (AI assistant discovery)
Two static endpoints make the content easy for AI assistants to discover and cite:
- `/llms.txt` (`src/pages/llms.txt.ts`) — an [llmstxt.org](https://llmstxt.org)-format index: title + description + absolute URL for every published post, plus key pages
- `/llms-full.txt` (`src/pages/llms-full.txt.ts`) — the full text of every post as clean markdown, one fetch for the whole corpus

Both reuse `getSortedPosts`/`postFilter` (no draft/scheduled leakage) and share URL helpers: `getPostBody` (strips the injected `## Table of contents` heading) and `absolutizeUrls` (rewrites root-relative `/images` and `/posts` paths to absolute, also used by the RSS feed). Pure string-building, no API calls — generated statically at build.

### SEO
- Sitemap auto-generated via `@astrojs/sitemap`
- robots.txt dynamically generated in `src/pages/robots.txt.ts`
- Canonical URLs supported via frontmatter

## Development Workflow

1. **Adding blog posts**: Create `.md` files in `src/content/blog/` with proper frontmatter
2. **Updating blog posts**: When materially updating a published post, set/refresh `modDatetime` in its frontmatter
3. **Styling changes**: Modify CSS variables in `src/styles/` or Tailwind config
4. **Site config**: Edit `src/config.ts` for metadata, social links, etc.
5. **Type safety**: Run `npm run build` to catch TypeScript and Astro errors before pushing

## Build Process

The build pipeline runs:
1. `astro check` - Type checking and diagnostics
2. `astro build` - Static site generation
3. `jampack ./dist` - Post-build optimization (compression, image optimization, etc.)

Output goes to `dist/` directory (not tracked in git).
