import { getCollection, type CollectionEntry } from 'astro:content';

export const POSTS_PER_PAGE = 10;

type Post = CollectionEntry<'posts'>;

export async function getSortedPosts() {
  return (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}

export type TermKind = 'tags' | 'categories';

export interface Term {
  name: string;
  slug: string;
  count: number;
  posts: Post[];
}

/** URL slug for a tag or category. Case-insensitive, so `test` and `Test` share a page. */
export function termSlug(name: string) {
  return name.trim().toLowerCase().replace(/[\s/]+/g, '-');
}

export function termHref(kind: TermKind, name: string) {
  return `/${kind}/${termSlug(name)}/`;
}

/**
 * All tags or categories with their posts, most-used first. Names that differ
 * only by case are merged under the most common spelling.
 */
export function getTerms(posts: Post[], kind: TermKind): Term[] {
  const bySlug = new Map<string, { spellings: Map<string, number>; posts: Post[] }>();
  for (const post of posts) {
    for (const name of new Set(post.data[kind])) {
      const slug = termSlug(name);
      if (!slug) continue;
      const entry = bySlug.get(slug) ?? { spellings: new Map(), posts: [] };
      entry.spellings.set(name, (entry.spellings.get(name) ?? 0) + 1);
      entry.posts.push(post);
      bySlug.set(slug, entry);
    }
  }
  return [...bySlug.entries()]
    .map(([slug, { spellings, posts }]) => ({
      name: [...spellings.entries()].sort((a, b) => b[1] - a[1])[0][0],
      slug,
      count: posts.length,
      posts,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Posts grouped by year, newest year first. Expects posts already sorted newest first. */
export function groupByYear(posts: Post[]) {
  const years = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.date.getUTCFullYear();
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years.entries()].map(([year, posts]) => ({ year, posts }));
}

/**
 * A plain-text teaser from the start of a post's Markdown: skips headings,
 * code, tables, HTML/SVG and a leading cross-language note, keeps prose.
 */
export function getExcerpt(post: { body?: string }, maxLength = 160) {
  const text = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s*>.*(?:\n\s*>.*)*/, ' ')
    .split('\n')
    .filter((line) => !/^\s*(#|\||---|<!--)/.test(line))
    .map((line) => line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, ''))
    .join(' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
