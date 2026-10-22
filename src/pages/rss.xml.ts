import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getExcerpt, getSortedPosts } from '../lib/posts';
import { SITE } from '../lib/site';

const FEED_SIZE = 50;

export async function GET(context: APIContext) {
  const posts = (await getSortedPosts()).slice(0, FEED_SIZE);
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: getExcerpt(post, 300),
      link: `/posts/${post.id}/`,
      categories: [...post.data.categories, ...post.data.tags],
    })),
  });
}
