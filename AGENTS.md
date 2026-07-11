# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

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
- Access via `skin-*` utility classes (e.g., `text-skin-base`, `bg-skin-fill`)
- Custom breakpoint: only `sm: 640px` defined

### Markdown Processing

Configured in `astro.config.ts` using the `unified()` processor from `@astrojs/markdown-remark` (not Astro 7's default Sätteri processor) so the remark/rehype plugins keep working:
- **Remark plugins**: `remark-toc` (table of contents), `remark-collapse` (collapsible sections), `remark-math` (LaTeX math)
- **Rehype plugins**: `rehype-katex` (math rendering)
- **Syntax highlighting**: Shiki dual themes ("github-light" / "one-dark-pro"), swapped by CSS variables in `src/styles/base.css`

### Utility Functions (`src/utils/`)

- `getSortedPosts()`: Returns posts sorted by date, filtering drafts in production
- `getRelatedPosts()`: Resolves the precomputed related-posts artifact against the collection, filtering drafts/scheduled posts
- `getPostsByTag()`: Filter posts by tag name
- `getUniqueTags()`: Extract all unique tags from posts
- `postFilter()`: Filter logic for draft/scheduled posts
- `slugify()`: Convert strings to URL-safe slugs
- `getPagination()`: Calculate pagination boundaries
- `generateOgImages.tsx`: Generate Open Graph images with Satori

### Component Structure

**Layout Components:**
- `Layout.astro`: Base layout with SEO, analytics (Google Analytics via Partytown)
- `Main.astro`: Main content wrapper
- `PostDetails.astro`: Blog post layout
- `Posts.astro`: Blog listing layout
- `AboutLayout.astro`: About page layout

**Key Components:**
- `Header.astro`: Navigation with hamburger menu
- `Search.tsx`: Client-side search using Fuse.js
- `Card.tsx`: Blog post preview cards
- `Datetime.tsx`: Formatted datetime display
- `Newsletter.astro`: Newsletter signup form
- `RelatedPosts.astro`: Static "Related Posts" section on post pages (hidden when empty)
- `Tag.astro`: Tag display component

## Important Notes

### Post Scheduling
Posts with `pubDatetime` in the future are hidden in production (configurable via `SITE.scheduledPostMargin` - currently 15 minutes).

### Related Posts
Each post page shows up to 3 related posts (5 stored), precomputed at authoring time — no runtime lookups and no API calls in CI:
- `scripts/related-posts.mjs` scores every pair with four signals, each producing its own per-source ranking: title+description embedding cosine (OpenAI `text-embedding-3-large`), symmetric body-chunk coverage (cleaned prose in ~375-word chunks; fenced code, HTML, and generic heading labels like "Introduction" are stripped first), symmetric BM25F lexical similarity (title/description/body fields, each direction normalized by its query's IDF mass), and IDF-weighted tag overlap. Rankings fuse via weighted RRF (0.45 title+description / 0.25 body / 0.25 BM25F / 0.05 tags, K=10); an absolute evidence gate then admits a candidate only on strong title+description cosine (>= 0.60) or body coverage and lexical similarity agreeing independently (>= 0.512 and >= 0.035). Tags never admit a candidate alone. Manual `relatedPosts` pins and series neighbors outrank automatic results and bypass the gate — posts may legitimately have fewer than 3 related posts or none. Recalibrate gate thresholds with `npm run related:report` after changing scoring; pin cross-topic pairs the signals undervalue via `relatedPosts` instead of lowering thresholds
- Committed artifact: `src/generated/related-posts.json` (keys/values are entry ids, which mirror `generateId` in `src/content.config.ts`). Embedding vectors live in the gitignored `.cache/related-posts/`, cached per summary and per body chunk: title/description edits re-embed one summary, body edits re-embed only the changed chunks, and tag or config changes re-rank locally with no API call (fenced code never affects embeddings)
- `npm run dev` and `npm run build` run `related:ensure`, which never fails a build: without `OPENAI_API_KEY` it warns and keeps the committed artifact. GitHub Actions therefore needs no OpenAI credentials and must not be given any — regeneration happens locally, enforced by the pre-commit `related:check`

### OG Image Generation
The `/og.png.ts` endpoint dynamically generates Open Graph images. Custom templates live in `src/utils/og-templates/`.

### RSS Feed
Auto-generated at `/rss.xml` from all published posts.

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
