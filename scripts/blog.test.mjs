import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { parseFrontmatter } from 'astro/markdown';
import {
  checkPublishable, createPost, findPosts, prepareSnapshot, pushSnapshot, removeWorktree, syncCheckout, withDate,
} from './blog.mjs';

const exec = promisify(execFile);
const repo = fileURLToPath(new URL('../', import.meta.url));
const POSTS = 'src/content/posts';
const git = async (cwd, ...args) => (await exec('git', args, { cwd })).stdout.trim();

async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'blog-writing-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'src/content/posts'), { recursive: true });
  return root;
}

/** A bare "GitHub" remote with one published post, a second clone standing in for changes made elsewhere, and a writing checkout. */
async function repos(t) {
  const base = await realpath(await mkdtemp(join(tmpdir(), 'blog-git-test-')));
  t.after(() => rm(base, { recursive: true, force: true }));
  const remote = join(base, 'remote.git');
  await git(base, 'init', '--quiet', '--bare', '--initial-branch=main', remote);
  const clone = async (name) => {
    const dir = join(base, name);
    await git(base, 'clone', '--quiet', remote, dir);
    await git(dir, 'config', 'user.name', 'Test');
    await git(dir, 'config', 'user.email', 'test@example.com');
    return dir;
  };
  const elsewhere = await clone('elsewhere');
  await mkdir(join(elsewhere, POSTS, 'existing'), { recursive: true });
  await writeFile(join(elsewhere, POSTS, 'existing/index.md'), '---\ntitle: Existing\nslug: existing\ndate: 2020-01-01\n---\n\nOld text.\n');
  await writeFile(join(elsewhere, 'README.md'), 'readme\n');
  await git(elsewhere, 'add', '.');
  await git(elsewhere, 'commit', '--quiet', '-m', 'seed');
  await git(elsewhere, 'push', '--quiet', 'origin', 'HEAD:main');
  return { remote, elsewhere, work: await clone('work') };
}

async function publishLocally(work, folder) {
  await git(work, 'fetch', '--quiet', 'origin', 'main');
  const snapshot = await prepareSnapshot(work, folder, { branch: `post/${folder}`, update: false, message: `Add post: ${folder}` });
  await git(snapshot.work, 'push', '--quiet', 'origin', 'HEAD:main'); // Stands in for the PR merging.
  await removeWorktree(work, snapshot.work);
}

test('publish commits only the selected post on fresh main and leaves the checkout alone', async (t) => {
  const { remote, work } = await repos(t);
  await createPost(work, 'Ready', 'ready-post');
  await createPost(work, 'Unfinished', 'unfinished-post');
  await writeFile(join(work, 'README.md'), 'unrelated local change\n');
  const before = await git(work, 'status', '--porcelain', '--untracked-files=all');
  await checkPublishable(work, 'ready-post', 'ready-post');
  const snapshot = await prepareSnapshot(work, 'ready-post', { branch: 'post/ready-post', update: false, message: 'Add post: Ready' });
  await pushSnapshot(snapshot.work, 'post/ready-post');
  await removeWorktree(work, snapshot.work);
  assert.equal(await git(remote, 'show', '--name-only', '--format=', 'post/ready-post'), `${POSTS}/ready-post/index.md`);
  assert.equal(await git(remote, 'rev-parse', 'post/ready-post^'), await git(remote, 'rev-parse', 'main'));
  assert.equal(await git(work, 'status', '--porcelain', '--untracked-files=all'), before);
  assert.equal((await git(work, 'worktree', 'list')).split('\n').length, 1);
  assert.equal(await prepareSnapshot(work, 'existing', { branch: 'post/existing', update: false, message: 'noop' }), null);
});

test('publish refuses to undo a change made on GitHub or reuse a slug taken there', async (t) => {
  const { elsewhere, work } = await repos(t);
  await writeFile(join(work, POSTS, 'existing/index.md'), '---\ntitle: Existing\nslug: existing\ndate: 2020-01-01\n---\n\nLocal edit.\n');
  await writeFile(join(elsewhere, POSTS, 'existing/index.md'), '---\ntitle: Existing\nslug: existing\ndate: 2020-01-01\n---\n\nFixed on GitHub.\n');
  await mkdir(join(elsewhere, POSTS, 'other-folder'));
  await writeFile(join(elsewhere, POSTS, 'other-folder/index.md'), "---\ntitle: Other\nslug: 'taken'\ndate: 2020-01-01\n---\n");
  await git(elsewhere, 'commit', '--quiet', '-am', 'edit on GitHub');
  await git(elsewhere, 'add', '.');
  await git(elsewhere, 'commit', '--quiet', '-m', 'another post');
  await git(elsewhere, 'push', '--quiet', 'origin', 'HEAD:main');
  await assert.rejects(checkPublishable(work, 'existing', 'existing'), /changed on GitHub/);
  await createPost(work, 'Mine', 'taken');
  await assert.rejects(checkPublishable(work, 'taken', 'taken'), /already used on GitHub by .*other-folder/);
});

test('sync brings in published posts, keeps newer local edits and unfinished drafts', async (t) => {
  const { work } = await repos(t);
  const same = await createPost(work, 'Same', 'same-post');
  const edited = await createPost(work, 'Edited', 'edited-post');
  const draft = await createPost(work, 'Draft', 'draft-post');
  await publishLocally(work, 'same-post');
  await publishLocally(work, 'edited-post');
  await writeFile(edited, `${await readFile(edited, 'utf8')}Written after publishing.\n`);
  const result = await syncCheckout(work);
  assert.deepEqual(result.differing, [`${POSTS}/edited-post/index.md`]);
  assert.equal(await git(work, 'rev-parse', 'HEAD'), await git(work, 'rev-parse', 'origin/main'));
  assert.match(await readFile(edited, 'utf8'), /Written after publishing/);
  assert.equal(await git(work, 'status', '--porcelain', '--', `${POSTS}/same-post`), '');
  assert.ok(existsSync(same) && existsSync(draft));
  assert.deepEqual(await readdir(join(work, '.git/blog-sync-backup')), []);
});

test('sync leaves files untouched when main has diverged, and puts them back when the update fails', async (t) => {
  const { work } = await repos(t);
  const post = await createPost(work, 'Post', 'post');
  const source = `${await readFile(post, 'utf8')}Local text.\n`;
  await publishLocally(work, 'post');
  await writeFile(post, source);
  await assert.rejects(syncCheckout(work, { fastForward: () => Promise.reject(new Error('simulated')) }), /put back.*simulated/s);
  assert.equal(await readFile(post, 'utf8'), source);
  assert.equal(await git(work, 'rev-parse', 'HEAD^{tree}') !== await git(work, 'rev-parse', 'origin/main^{tree}'), true);
  await writeFile(join(work, 'README.md'), 'local commit\n');
  await git(work, 'commit', '--quiet', '-am', 'local commit on main');
  await assert.rejects(syncCheckout(work), /cannot fast-forward/);
  assert.equal(await readFile(post, 'utf8'), source);
});

test('withDate changes only the frontmatter date', () => {
  const source = '---\ntitle: "x"\ndate: 2026-01-02\n---\n\ndate: in the body\n';
  assert.equal(withDate(source, '2026-11-09'), '---\ntitle: "x"\ndate: 2026-11-09\n---\n\ndate: in the body\n');
});

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
