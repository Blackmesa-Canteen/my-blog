import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { parseFrontmatter } from 'astro/markdown';
import { createPost, findPosts } from './blog.mjs';

const exec = promisify(execFile);
const repo = fileURLToPath(new URL('../', import.meta.url));

async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'blog-writing-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'src/content/posts'), { recursive: true });
  return root;
}

test('new safely creates local frontmatter and refuses collisions and escaping paths', async (t) => {
  const root = await fixture(t);
  const title = '中文标题: "quotes", #tags & apostrophe\'s';
  const file = await createPost(root, title, 'writing-test', new Date(2026, 10, 9));
  const before = await readFile(file, 'utf8');
  const { frontmatter } = parseFrontmatter(before);
  assert.equal(frontmatter.title, title);
  assert.equal(frontmatter.slug, 'writing-test');
  assert.match(before, /date: 2026-11-09\n/);
  await assert.rejects(createPost(root, 'Duplicate', 'writing-test'), /already uses/);
  await assert.rejects(createPost(root, 'Escape', '../outside'), /Choose a slug/);
  await assert.rejects(createPost(root, '   ', 'empty-title'), /must not be empty/);
  assert.equal(await readFile(file, 'utf8'), before);
});

test('edit finds Chinese and multiline titles and preserves legacy Markdown byte for byte', async (t) => {
  const root = await fixture(t);
  const directory = join(root, 'src/content/posts/old-folder');
  await mkdir(directory);
  const file = join(directory, 'index.md');
  const source = "---\ntitle: '中文笔记: a long\n  title'\nslug: custom-url\ndate: '2021-08-06T10:11:12Z'\noriginal_permalink: /archives/old-url\n---\n\n<svg><path d=\"M0 0\" /></svg>\n<!-- unavailable image -->\n\n| A | B |\n| - | - |\n| 1 | 2 |\n";
  await writeFile(file, source);
  assert.equal((await findPosts(root, '中文笔记'))[0].file, file);
  assert.equal((await findPosts(root, 'long title'))[0].file, file);
  assert.equal((await findPosts(root, 'custom-url'))[0].file, file);
  await assert.rejects(createPost(root, 'Duplicate URL', 'custom-url'), /already uses/);
  await mkdir(join(root, 'scripts'));
  await cp(join(repo, 'scripts/blog.mjs'), join(root, 'scripts/blog.mjs'));
  await symlink(join(repo, 'node_modules'), join(root, 'node_modules'), 'dir');
  const result = await exec(process.execPath, ['scripts/blog.mjs', 'edit', 'custom-url', '--no-open'], { cwd: root });
  assert.equal(result.stdout.trim(), file);
  assert.equal(await readFile(file, 'utf8'), source);
});

test('a draft with malformed frontmatter does not block new or edit for other posts', async (t) => {
  const root = await fixture(t);
  const good = await createPost(root, 'Finished post', 'finished-post');
  const broken = join(root, 'src/content/posts/half-written');
  await mkdir(broken);
  await writeFile(join(broken, 'index.md'), "---\ntitle: 'unclosed quote\nslug: half-written\n---\n");
  const warnings = [];
  t.mock.method(console, 'warn', (message) => warnings.push(message));
  assert.equal((await findPosts(root, 'Finished'))[0].file, good);
  assert.equal((await findPosts(root, 'half-written'))[0].file, join(broken, 'index.md'));
  await assert.rejects(createPost(root, 'Same folder', 'half-written'), /already uses/);
  assert.ok(await createPost(root, 'Another post', 'another-post'));
  assert.ok(warnings.some((message) => message.includes('half-written')));
});

test('a generated post with a relative image builds with the real Astro schema and search index', async (t) => {
  const root = await fixture(t);
  for (const entry of ['src', 'public', 'astro.config.mjs', 'package.json']) {
    await cp(join(repo, entry), join(root, entry), { recursive: true });
  }
  await symlink(join(repo, 'node_modules'), join(root, 'node_modules'), 'dir');
  const slug = 'blog-helper-contract-fixture';
  const file = await createPost(root, '测试文章: "quoted title"', slug);
  const source = await readFile(file, 'utf8');
  await writeFile(file, source.replace('tags: []', 'tags: [testing]\ncover: ./cover.png') +
    'A sample post.\n\n![A test image](./cover.png)\n');
  // A tiny valid PNG exercises the same image path convention used by the archive.
  await writeFile(join(root, 'src/content/posts', slug, 'cover.png'),
    Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=', 'base64'));
  await exec('npm', ['run', 'build'], { cwd: root, maxBuffer: 16 * 1024 * 1024 });
  assert.match(await readFile(join(root, 'dist/posts', slug, 'index.html'), 'utf8'), /A sample post/);
  await readFile(join(root, 'dist/pagefind/pagefind.js'));
});
