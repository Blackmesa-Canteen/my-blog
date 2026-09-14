import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    cover: image().optional(),
    original_permalink: z.string().optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/pages' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date().optional(),
    cover: image().optional(),
    original_permalink: z.string().optional(),
  }),
});

export const collections = { posts, pages };
