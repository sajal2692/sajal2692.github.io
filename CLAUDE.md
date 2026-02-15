# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal website and blog built with **Astro v4.1.1** using the **AstroPaper theme**. The site showcases professional work in Machine Learning, NLP, and AI, with a focus on blog content and portfolio presentation.

**Technology Stack:**
- Astro.js (static site generator)
- React (for interactive components)
- TailwindCSS (styling with custom skin tokens)
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
```

**Pre-commit hooks:** Husky runs `lint-staged` which auto-formats staged files with Prettier before commits.

## Architecture

### Configuration-Driven Design

The site is highly configurable through `src/config.ts`:
- `SITE`: Core site metadata (title, author, description, URL, pagination)
- `SOCIALS`: Social media links with active/inactive flags
- `LOCALE`: Language settings
- `LOGO_IMAGE`: Logo configuration

### Content Collections

Blog posts live in `src/content/blog/` as Markdown files with strict frontmatter schema defined in `src/content/config.ts`:

**Required frontmatter fields:**
- `title`: Post title
- `pubDatetime`: Publication date (Date object)
- `description`: Post description
- `author`: Defaults to SITE.author
- `tags`: Array of strings, defaults to ["others"]

**Optional fields:**
- `featured`: Boolean for featuring posts
- `draft`: Boolean to exclude from production
- `modDatetime`: Last modified date
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

Configured in `astro.config.ts`:
- **Remark plugins**: `remark-toc` (table of contents), `remark-collapse` (collapsible sections), `remark-math` (LaTeX math)
- **Rehype plugins**: `rehype-katex` (math rendering)
- **Syntax highlighting**: Shiki with "one-dark-pro" theme

### Utility Functions (`src/utils/`)

- `getSortedPosts()`: Returns posts sorted by date, filtering drafts in production
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
- `Tag.astro`: Tag display component

## Important Notes

### Post Scheduling
Posts with `pubDatetime` in the future are hidden in production (configurable via `SITE.scheduledPostMargin` - currently 15 minutes).

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
2. **Styling changes**: Modify CSS variables in `src/styles/` or Tailwind config
3. **Site config**: Edit `src/config.ts` for metadata, social links, etc.
4. **Type safety**: Run `npm run build` to catch TypeScript and Astro errors before pushing

## Build Process

The build pipeline runs:
1. `astro check` - Type checking and diagnostics
2. `astro build` - Static site generation
3. `jampack ./dist` - Post-build optimization (compression, image optimization, etc.)

Output goes to `dist/` directory (not tracked in git).
