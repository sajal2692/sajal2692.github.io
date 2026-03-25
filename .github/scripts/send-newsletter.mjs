#!/usr/bin/env node

/**
 * Newsletter send script for Kit (ConvertKit) API v4.
 *
 * Reads blog posts from src/content/blog/, converts them to email-friendly HTML,
 * and creates/sends broadcasts via the Kit API.
 *
 * Usage:
 *   node .github/scripts/send-newsletter.mjs [--dry-run] [--draft-only] [--tag=TAG_NAME]
 *
 * Environment variables:
 *   KIT_API_KEY            - Kit v4 API key (required unless --dry-run)
 *   NEWSLETTER_START_DATE  - Only posts after this date are eligible (e.g. 2026-03-01)
 *   SITE_URL               - Base URL of the site (default: https://sajalsharma.com)
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import juice from "juice";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SITE_URL = (process.env.SITE_URL || "https://sajalsharma.com").replace(
  /\/$/,
  ""
);
const KIT_API_KEY = process.env.KIT_API_KEY || "";
const NEWSLETTER_START_DATE = process.env.NEWSLETTER_START_DATE || "2026-03-01";
const KIT_API_BASE = "https://api.kit.com/v4";
const BLOG_DIR = path.resolve("src/content/blog");

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const DRAFT_ONLY = args.includes("--draft-only");
const TAG_FLAG = args.find(a => a.startsWith("--tag="));
const TARGET_TAG = TAG_FLAG ? TAG_FLAG.split("=")[1] : null;

// ---------------------------------------------------------------------------
// Kit API helpers
// ---------------------------------------------------------------------------

async function kitFetch(endpoint, options = {}) {
  const url = `${KIT_API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": KIT_API_KEY,
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kit API ${res.status} ${res.statusText}: ${body}`);
  }

  return res.json();
}

async function listRecentBroadcasts() {
  const data = await kitFetch("/broadcasts?per_page=50");
  return data.broadcasts || [];
}

async function getTagByName(tagName) {
  const data = await kitFetch("/tags?per_page=100");
  const tags = data.tags || [];
  return tags.find(
    t => t.name.toLowerCase() === tagName.toLowerCase()
  );
}

async function createBroadcast({ subject, content, description }) {
  return kitFetch("/broadcasts", {
    method: "POST",
    body: JSON.stringify({
      subject,
      content,
      description,
      email_layout_template: "Text only",
      public: false,
    }),
  });
}

async function sendBroadcast(broadcastId, { tagId } = {}) {
  const sendAt = new Date(Date.now() + 60 * 1000).toISOString();
  const body = {
    public: true,
    send_at: sendAt,
  };

  if (tagId) {
    body.subscriber_filter = [
      { type: "tag", id: tagId, state: "active" },
    ];
  }

  return kitFetch(`/broadcasts/${broadcastId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Blog post discovery
// ---------------------------------------------------------------------------

function discoverPosts() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md"));
  const cutoff = new Date(NEWSLETTER_START_DATE);
  const now = new Date();
  const posts = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    // Must have required fields
    if (!frontmatter.title || !frontmatter.pubDatetime) {
      console.log(`  SKIP (missing fields): ${file}`);
      continue;
    }

    const pubDate = new Date(frontmatter.pubDatetime);

    // Filter: drafts
    if (frontmatter.draft) {
      console.log(`  SKIP (draft): ${file}`);
      continue;
    }

    // Filter: future-dated
    if (pubDate > now) {
      console.log(`  SKIP (future): ${file}`);
      continue;
    }

    // Filter: before cutoff
    if (pubDate <= cutoff) {
      console.log(`  SKIP (before cutoff ${NEWSLETTER_START_DATE}): ${file}`);
      continue;
    }

    const slug =
      frontmatter.slug || file.replace(/\.md$/, "");

    posts.push({
      file,
      slug,
      title: frontmatter.title,
      description: frontmatter.description || "",
      pubDate,
      author: frontmatter.author || "Sajal Sharma",
      content,
    });
  }

  // Sort newest first
  posts.sort((a, b) => b.pubDate - a.pubDate);
  return posts;
}

// ---------------------------------------------------------------------------
// Markdown to email HTML
// ---------------------------------------------------------------------------

function rewriteUrls(html) {
  // Rewrite relative src and href attributes to absolute URLs
  return html
    .replace(/(src|href)="(?!https?:\/\/|mailto:|#)([^"]+)"/g, (match, attr, url) => {
      const absoluteUrl = url.startsWith("/")
        ? `${SITE_URL}${url}`
        : `${SITE_URL}/${url}`;
      return `${attr}="${absoluteUrl}"`;
    });
}

function stripTableOfContents(markdown) {
  // Remove "## Table of contents" heading (remark-toc generates content after it)
  // The generated TOC is a list of links that follows the heading until the next heading
  return markdown.replace(
    /^## Table of contents\n(?:[\s\S]*?)(?=^## |\n$)/im,
    ""
  );
}

function stripMath(markdown) {
  // Replace display math blocks with a note
  let result = markdown.replace(
    /\$\$[\s\S]*?\$\$/g,
    "[Mathematical formula - view on web]"
  );
  // Replace inline math
  result = result.replace(
    /\$([^$\n]+)\$/g,
    (_, expr) => expr.trim()
  );
  return result;
}

function convertToEmailHtml(post) {
  // Pre-process markdown
  let markdown = post.content;
  markdown = stripTableOfContents(markdown);
  markdown = stripMath(markdown);

  // Convert to HTML
  const bodyHtml = marked.parse(markdown, { async: false });
  const rewrittenHtml = rewriteUrls(bodyHtml);

  const postUrl = `${SITE_URL}/posts/${post.slug}/`;
  const formattedDate = post.pubDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Email template with embedded styles (juice will inline them)
  const template = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
    font-family: Georgia, "Times New Roman", Times, serif;
    font-size: 17px;
    line-height: 1.7;
    color: #2d2d2d;
  }
  .wrapper {
    width: 100%;
    background-color: #f4f4f4;
    padding: 20px 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 4px;
  }
  .header {
    padding: 30px 40px 20px;
    border-bottom: 1px solid #e8e8e8;
  }
  .header a {
    color: #2d2d2d;
    text-decoration: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 18px;
    font-weight: 600;
  }
  .content {
    padding: 30px 40px;
  }
  .post-title {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.3;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  .post-date {
    font-size: 14px;
    color: #888;
    margin: 0 0 30px 0;
  }
  .post-body h2 {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 22px;
    font-weight: 600;
    margin: 32px 0 12px;
    color: #1a1a1a;
  }
  .post-body h3 {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 18px;
    font-weight: 600;
    margin: 28px 0 10px;
    color: #1a1a1a;
  }
  .post-body p {
    margin: 0 0 18px;
  }
  .post-body a {
    color: #1a73e8;
    text-decoration: underline;
  }
  .post-body img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 16px 0;
  }
  .post-body pre {
    background-color: #282c34;
    color: #abb2bf;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 14px;
    line-height: 1.5;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }
  .post-body code {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 14px;
    background-color: #f0f0f0;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .post-body pre code {
    background-color: transparent;
    padding: 0;
  }
  .post-body blockquote {
    border-left: 3px solid #ddd;
    padding-left: 16px;
    margin: 18px 0;
    color: #555;
    font-style: italic;
  }
  .post-body ul, .post-body ol {
    padding-left: 24px;
    margin: 0 0 18px;
  }
  .post-body li {
    margin-bottom: 6px;
  }
  .post-body table {
    width: 100%;
    border-collapse: collapse;
    margin: 18px 0;
    font-size: 15px;
  }
  .post-body th, .post-body td {
    border: 1px solid #ddd;
    padding: 8px 12px;
    text-align: left;
  }
  .post-body th {
    background-color: #f8f8f8;
    font-weight: 600;
  }
  .footer {
    padding: 20px 40px 30px;
    border-top: 1px solid #e8e8e8;
    text-align: center;
    font-size: 14px;
    color: #888;
  }
  .footer a {
    color: #1a73e8;
    text-decoration: underline;
  }
  .read-on-web {
    display: inline-block;
    margin-top: 30px;
    padding: 10px 24px;
    background-color: #1a73e8;
    color: #ffffff;
    text-decoration: none;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 15px;
  }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <a href="${SITE_URL}">Sajal Sharma</a>
    </div>
    <div class="content">
      <h1 class="post-title">${escapeHtml(post.title)}</h1>
      <p class="post-date">${formattedDate}</p>
      <div class="post-body">
        ${rewrittenHtml}
      </div>
      <div style="text-align: center;">
        <a href="${postUrl}" class="read-on-web">Read on the web</a>
      </div>
    </div>
    <div class="footer">
      <p>You received this because you subscribed to <a href="${SITE_URL}">sajalsharma.com</a>.</p>
    </div>
  </div>
</div>
</body>
</html>`;

  // Inline CSS for email client compatibility
  return juice(template);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Newsletter Send Script ===");
  console.log(`Mode: ${DRY_RUN ? "dry-run" : DRAFT_ONLY ? "draft-only" : TARGET_TAG ? `send-to-tag:${TARGET_TAG}` : "send-to-all"}`);
  console.log(`Cutoff date: ${NEWSLETTER_START_DATE}`);
  console.log(`Site URL: ${SITE_URL}`);
  console.log();

  if (!DRY_RUN && !KIT_API_KEY) {
    console.error("ERROR: KIT_API_KEY is required (unless --dry-run)");
    process.exit(1);
  }

  // 1. Discover eligible posts
  console.log("Scanning blog posts...");
  const posts = discoverPosts();
  console.log(`\nFound ${posts.length} eligible post(s).\n`);

  if (posts.length === 0) {
    console.log("No new posts to send. Done.");
    return;
  }

  for (const post of posts) {
    console.log(`  - ${post.title} (${post.slug}, ${post.pubDate.toISOString().slice(0, 10)})`);
  }
  console.log();

  if (DRY_RUN) {
    console.log("[DRY RUN] Would process the above posts. No API calls made.");
    // Show a preview of what the email subject would be
    for (const post of posts) {
      console.log(`  Subject: "New post: ${post.title}"`);
    }
    return;
  }

  // 2. Check existing broadcasts for idempotency
  console.log("Checking existing broadcasts for duplicates...");
  const existingBroadcasts = await listRecentBroadcasts();
  const existingSubjects = new Set(existingBroadcasts.map(b => b.subject));

  // 3. Resolve tag if needed
  let tagId = null;
  if (TARGET_TAG) {
    console.log(`Looking up tag: ${TARGET_TAG}...`);
    const tag = await getTagByName(TARGET_TAG);
    if (!tag) {
      console.error(`ERROR: Tag "${TARGET_TAG}" not found in Kit.`);
      process.exit(1);
    }
    tagId = tag.id;
    console.log(`Found tag "${TARGET_TAG}" (id: ${tagId})`);
  }

  // 4. Process each post
  for (const post of posts) {
    const subject = `New post: ${post.title}`;

    if (existingSubjects.has(subject)) {
      console.log(`SKIP (already exists): "${subject}"`);
      continue;
    }

    console.log(`\nProcessing: "${post.title}"...`);

    // Convert to email HTML
    const emailHtml = convertToEmailHtml(post);
    console.log(`  Generated email HTML (${emailHtml.length} bytes)`);

    // Create broadcast
    console.log("  Creating broadcast in Kit...");
    const createResult = await createBroadcast({
      subject,
      content: emailHtml,
      description: `Auto-sent: ${post.slug}`,
    });

    const broadcastId = createResult.broadcast?.id;
    if (!broadcastId) {
      console.error("  ERROR: Failed to get broadcast ID from response:", JSON.stringify(createResult));
      continue;
    }
    console.log(`  Created broadcast (id: ${broadcastId})`);

    if (DRAFT_ONLY) {
      console.log("  [DRAFT ONLY] Broadcast left as draft. Check Kit dashboard.");
      continue;
    }

    // Send/schedule broadcast
    console.log(`  Scheduling broadcast for send${tagId ? ` (tag: ${TARGET_TAG})` : " (all subscribers)"}...`);
    await sendBroadcast(broadcastId, { tagId });
    console.log("  Broadcast scheduled.");
  }

  console.log("\nDone.");
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
