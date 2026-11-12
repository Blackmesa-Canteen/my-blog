import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getExcerpt, getSortedPosts } from '../lib/posts';
import { PROVENANCE, SITE } from '../lib/site';

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
      // Feed readers never see the page's date line, so the AI label leads the description.
      description: post.data.ai_assisted
        ? `${PROVENANCE.ai.zh} · ${PROVENANCE.ai.en} — ${getExcerpt(post, 300)}`
        : getExcerpt(post, 300),
      link: `/posts/${post.id}/`,
      categories: [...post.data.categories, ...post.data.tags],
    })),
  });
}
