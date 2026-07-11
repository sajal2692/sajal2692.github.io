import { SITE } from "@config";
import { glob } from "astro/loaders";
import { defineCollection, reference, z } from "astro:content";
import { slug as slugger } from "github-slugger";

const blog = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.md",
    base: "./src/content/blog",
    // Entry ids double as post URLs; honor the frontmatter slug so existing
    // links keep working for posts whose slug differs from the filename.
    generateId: ({ entry, data }) =>
      (data.slug as string | undefined) ?? slugger(entry.replace(/\.md$/, "")),
  }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      slug: z.string().optional(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      series: z.string().optional(),
      seriesOrder: z.number().int().positive().optional(),
      relatedPosts: z.array(reference("blog")).max(3).optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          error: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
    }),
});

export const collections = { blog };
