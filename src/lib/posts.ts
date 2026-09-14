import { getCollection } from 'astro:content';

export const POSTS_PER_PAGE = 10;

export async function getSortedPosts() {
  return (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}
