import { execFile, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs, promisify } from 'node:util';
import { parseFrontmatter } from 'astro/markdown';

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const POSTS = 'src/content/posts';
const help = `Usage:
  npm run blog -- new ["Title" slug] [--no-open]
  npm run blog -- edit [title-or-slug] [--no-open]
  npm run blog -- publish [title-or-slug] [--yes] [--no-auto-merge]
  npm run blog -- sync

new and edit only touch files. publish submits one post as a pull request
from a temporary copy of the latest main; sync brings merged posts back into
this checkout without losing unfinished drafts or later edits.
Missing arguments are prompted for in a terminal.
Set BLOG_EDITOR to an editor executable (default: code), without arguments.
Use --no-open to print the file path without launching an editor.`;

/** @returns {Promise<string>} */
async function ask(question) {
  if (!process.stdin.isTTY) {
    throw new Error('This needs an answer in a terminal. Pass the missing arguments (or --yes for publish) instead.\n' + help);
  }
  const input = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await input.question(question)).trim();
  } finally {
    input.close();
  }
}

async function run(command, args, cwd) {
  try {
    const { stdout } = await execFileAsync(command, args, { cwd, maxBuffer: 64 * 1024 * 1024 });
    return stdout.replace(/\n$/, '');
  } catch (error) {
    throw new Error(`${command} ${args[0]} failed: ${(error.stderr || error.message).trim()}`);
  }
}

const git = (cwd, ...args) => run('git', args, cwd);
const gitPaths = async (cwd, ...args) => (await git(cwd, ...args)).split('\0').filter(Boolean);
async function gitSucceeds(cwd, ...args) {
  try {
    await git(cwd, ...args);
    return true;
  } catch {
    return false;
  }
}

function localDate(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('-');
}

/** @returns {Promise<Array<{ file: string, folder: string, slug: string, title: string }>>} */
async function listPosts(repoRoot) {
  const posts = join(repoRoot, POSTS);
  const entries = await readdir(posts, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = join(posts, entry.name, 'index.md');
    let source;
    try {
      source = await readFile(file, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    // A half-written draft must not block finding or creating other posts.
    let frontmatter = {};
    try {
      ({ frontmatter } = parseFrontmatter(source));
    } catch (error) {
      console.warn(`Skipping metadata in ${entry.name}/index.md (${error.message.split('\n')[0]}); using the folder name.`);
    }
    result.push({
      file,
      folder: entry.name,
      slug: typeof frontmatter.slug === 'string' ? frontmatter.slug : entry.name,
      title: typeof frontmatter.title === 'string' ? frontmatter.title : entry.name,
    });
  }
  return result.sort((a, b) => a.title.localeCompare(b.title));
}

/** Creates a post without modifying any existing file or Git state. */
export async function createPost(repoRoot, title, slug, date = new Date()) {
  if (!title.trim()) throw new Error('The title must not be empty.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Choose a slug with lowercase English letters, numbers, and single hyphens.');
  }
  if ((await listPosts(repoRoot)).some((post) => post.slug === slug)) {
    throw new Error(`A post already uses the slug "${slug}".`);
  }
  const directory = join(repoRoot, POSTS, slug);
  await mkdir(directory); // Exclusive: never reuse or overwrite an existing folder.
  const file = join(directory, 'index.md');
  // JSON strings are valid YAML strings, including Chinese text and punctuation.
  await writeFile(file, `---\ntitle: ${JSON.stringify(title.trim())}\nslug: ${slug}\ndate: ${localDate(date)}\ncategories: []\ntags: []\n---\n\n`, { flag: 'wx' });
  return file;
}

/** Searches metadata only; opening a match never serializes its Markdown. */
export async function findPosts(repoRoot, query) {
  const posts = await listPosts(repoRoot);
  const exact = posts.filter((post) => post.slug === query);
  if (exact.length) return exact;
  const search = query.toLocaleLowerCase();
  return posts.filter((post) => `${post.title}\n${post.slug}`.toLocaleLowerCase().includes(search));
}

async function choose(matches) {
  if (matches.length === 1) return matches[0];
  matches.forEach((post, index) => console.log(`${index + 1}. ${post.title} [${post.slug}]`));
  const choice = await ask('Post number: ');
  if (!/^\d+$/.test(choice) || !matches[Number(choice) - 1]) {
    throw new Error('Choose a post number from the list.');
  }
  return matches[Number(choice) - 1];
}

async function openPost(file, noOpen) {
  console.log(file);
  if (noOpen) return;
  const editor = process.env.BLOG_EDITOR || 'code';
  try {
    await new Promise((resolve, reject) => {
      const child = spawn(editor, [file], { stdio: 'inherit', shell: false });
      child.once('error', reject);
      child.once('exit', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Editor exited with ${code}. Open the file printed above.`));
      });
    });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log(`Editor "${editor}" was not found. Open the file above, or set BLOG_EDITOR to an editor executable.`);
  }
}

/** Local changes relative to HEAD: tracked edits (staged or not) and untracked files, as repo-relative paths. */
async function localChanges(repoRoot, ...pathspec) {
  const modified = await gitPaths(repoRoot, 'diff', '--name-only', '--no-renames', '-z', 'HEAD', '--', ...pathspec);
  const untracked = await gitPaths(repoRoot, 'ls-files', '--others', '--exclude-standard', '-z', '--', ...pathspec);
  return [...modified, ...untracked];
}

export async function changedPostFolders(repoRoot) {
  const paths = await localChanges(repoRoot, POSTS);
  return [...new Set(paths.map((path) => path.split('/')).filter((parts) => parts.length > 4).map((parts) => parts[3]))];
}

async function treeId(cwd, ref, path) {
  try {
    return await git(cwd, 'rev-parse', '--verify', '--quiet', `${ref}:${path}`);
  } catch {
    return null;
  }
}

function frontmatterDate(source) {
  const block = /^---\r?\n[\s\S]*?\r?\n---/.exec(source)?.[0] ?? '';
  return /^date:\s*(.*)$/m.exec(block)?.[1]?.trim().replace(/^(['"])(.*)\1$/, '$2');
}

export function withDate(source, date) {
  const block = /^---\r?\n[\s\S]*?\r?\n---/.exec(source)?.[0];
  if (!block) return source;
  return block.replace(/^date:.*$/m, `date: ${date}`) + source.slice(block.length);
}

/**
 * Refuses to publish when copying the local folder onto the latest main would
 * undo a change made on GitHub, or when another post there uses the same slug.
 */
export async function checkPublishable(repoRoot, folder, slug) {
  const dir = `${POSTS}/${folder}`;
  if (!existsSync(join(repoRoot, dir, 'index.md'))) throw new Error(`${dir}/index.md does not exist.`);
  await git(repoRoot, 'fetch', '--quiet', 'origin', 'main');
  const local = await treeId(repoRoot, 'HEAD', dir);
  const remote = await treeId(repoRoot, 'origin/main', dir);
  if (local !== remote) {
    throw new Error(local
      ? `${dir} changed on GitHub after your checkout. Run "npm run blog -- sync", check the post, then publish again.`
      : `${dir} already exists on GitHub. If it is your published post, run "npm run blog -- sync" first; otherwise choose another slug.`);
  }
  let slugs = '';
  try {
    slugs = await git(repoRoot, 'grep', '-z', '-e', '^slug:', 'origin/main', '--', `${POSTS}/*/index.md`);
  } catch {
    // git grep exits 1 when nothing matches.
  }
  for (const line of slugs.split('\n')) {
    const [location, text] = line.split('\0');
    if (!text) continue;
    const other = location.slice(location.indexOf(':') + 1).split('/')[3];
    const value = text.replace(/^slug:\s*/, '').trim().replace(/^(['"])(.*)\1$/, '$2');
    if (value === slug && other !== folder) {
      throw new Error(`The slug "${slug}" is already used on GitHub by ${POSTS}/${other}.`);
    }
  }
}

export async function removeWorktree(repoRoot, work) {
  await gitSucceeds(repoRoot, 'worktree', 'remove', '--force', work);
  await rm(work, { recursive: true, force: true });
  await gitSucceeds(repoRoot, 'worktree', 'prune');
}

/**
 * Builds one commit containing only the selected post folder, in a temporary
 * worktree based on the latest main (or on the post's existing PR branch,
 * brought up to date with main). Nothing is pushed. Returns null when the
 * folder already matches.
 */
export async function prepareSnapshot(repoRoot, folder, { branch, update, message }) {
  const dir = `${POSTS}/${folder}`;
  let base = 'origin/main';
  if (update) {
    await git(repoRoot, 'fetch', '--quiet', 'origin', `+refs/heads/${branch}:refs/remotes/origin/${branch}`);
    base = `origin/${branch}`;
  }
  const work = await mkdtemp(join(tmpdir(), 'blog-publish-'));
  await git(repoRoot, 'worktree', 'add', '--quiet', '--detach', work, base);
  try {
    if (update && !(await gitSucceeds(work, 'merge', '--quiet', '--no-edit', 'origin/main'))) {
      await gitSucceeds(work, 'merge', '--abort');
      throw new Error(`Could not bring ${branch} up to date with main. Resolve it on GitHub, then publish again.`);
    }
    await rm(join(work, dir), { recursive: true, force: true });
    await cp(join(repoRoot, dir), join(work, dir), { recursive: true });
    await git(work, 'add', '--all', '--', dir);
    if (await gitSucceeds(work, 'diff', '--cached', '--quiet')) {
      await removeWorktree(repoRoot, work);
      return null;
    }
    await git(work, 'commit', '--quiet', '-m', message);
    return { work, files: await git(work, 'show', '--stat', '--format=', 'HEAD') };
  } catch (error) {
    await removeWorktree(repoRoot, work);
    throw error;
  }
}

/** Pushes without force, so a branch that moved on GitHub is never overwritten. */
export async function pushSnapshot(work, branch) {
  await git(work, 'push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`);
}

/**
 * Fast-forwards local main to GitHub's main. Local files that block the
 * fast-forward are copied to .git/blog-sync-backup first and copied back
 * afterwards, so unfinished drafts and later edits survive; the published
 * versions stay in Git history. Returns the restored files that differ from main.
 */
export async function syncCheckout(repoRoot, { fastForward = (cwd) => git(cwd, 'merge', '--quiet', '--ff-only', 'origin/main') } = {}) {
  if (await git(repoRoot, 'rev-parse', '--abbrev-ref', 'HEAD') !== 'main') {
    throw new Error('Switch to main before syncing; sync updates the writing checkout on main.');
  }
  await git(repoRoot, 'fetch', '--quiet', 'origin', 'main');
  if (!(await gitSucceeds(repoRoot, 'merge-base', '--is-ancestor', 'HEAD', 'origin/main'))) {
    throw new Error('Local main has commits that are not on GitHub, so sync cannot fast-forward. Nothing was changed.');
  }
  const incoming = new Set(await gitPaths(repoRoot, 'diff', '--name-only', '--no-renames', '-z', 'HEAD', 'origin/main'));
  if (!incoming.size) return { updated: false, differing: [] };
  const blocking = (await localChanges(repoRoot)).filter((path) => incoming.has(path));
  const missing = blocking.filter((path) => !existsSync(join(repoRoot, path)));
  if (missing.length) {
    throw new Error(`These files were deleted locally but changed on GitHub; resolve them first:\n  ${missing.join('\n  ')}`);
  }
  const backup = join(await git(repoRoot, 'rev-parse', '--absolute-git-dir'), 'blog-sync-backup', String(Date.now()));
  const copy = async (from, to) => {
    for (const path of blocking) {
      await mkdir(dirname(join(to, path)), { recursive: true });
      await cp(join(from, path), join(to, path));
    }
  };
  await copy(repoRoot, backup);
  try {
    for (const path of blocking) {
      if (await gitSucceeds(repoRoot, 'cat-file', '-e', `HEAD:${path}`)) {
        await git(repoRoot, 'restore', '--source=HEAD', '--staged', '--worktree', '--', path);
      } else {
        await gitSucceeds(repoRoot, 'rm', '--cached', '--quiet', '--', path);
        await rm(join(repoRoot, path));
      }
    }
    await fastForward(repoRoot);
  } catch (error) {
    await copy(backup, repoRoot);
    throw new Error(`Sync stopped and your files were put back (copies remain in ${backup}): ${error.message}`);
  }
  await copy(backup, repoRoot);
  const differing = blocking.length ? await gitPaths(repoRoot, 'diff', '--name-only', '-z', '--', ...blocking) : [];
  await rm(backup, { recursive: true, force: true });
  return { updated: true, differing };
}

async function publish(query, values) {
  if (!(await run('gh', ['auth', 'status'], root).then(() => true, () => false))) {
    throw new Error('Sign in to GitHub first with "gh auth login".');
  }
  let candidates;
  if (query) {
    candidates = await findPosts(root, query);
    if (!candidates.length) throw new Error(`No post matches "${query}".`);
  } else {
    const changed = new Set(await changedPostFolders(root));
    candidates = (await listPosts(root)).filter((post) => changed.has(post.folder));
    if (!candidates.length) throw new Error('No new or changed posts found. Name one: npm run blog -- publish <title-or-slug>');
  }
  const post = await choose(candidates);
  await checkPublishable(root, post.folder, post.slug);
  const isNew = !(await treeId(root, 'HEAD', `${POSTS}/${post.folder}`));

  const source = await readFile(post.file, 'utf8');
  const date = frontmatterDate(source);
  const today = localDate();
  if (isNew && date && date !== today) {
    if (process.stdin.isTTY && /^y/i.test(await ask(`The post is dated ${date}. Change it to today (${today})? [y/N] `))) {
      await writeFile(post.file, withDate(source, today));
    } else {
      console.log(`Keeping the date ${date}.`);
    }
  }

  let branch = `post/${post.slug}`;
  if (!(await gitSucceeds(root, 'check-ref-format', `refs/heads/${branch}`))) branch = `post/${Date.now().toString(36)}`;
  let prs = JSON.parse(await run('gh', ['pr', 'list', '--head', branch, '--state', 'all', '--json', 'url,state'], root));
  if (prs.length && !prs.some((pr) => pr.state === 'OPEN')) {
    // The branch belongs to an earlier, finished pull request; start a fresh one.
    branch = `${branch}-${Date.now().toString(36)}`;
    prs = [];
  }
  const openPr = prs.find((pr) => pr.state === 'OPEN');
  // An open PR, or a branch left by an interrupted publish, is updated with a new commit.
  const update = Boolean(openPr) || Boolean(await git(root, 'ls-remote', '--heads', 'origin', `refs/heads/${branch}`));

  const message = `${isNew ? 'Add post' : 'Update post'}: ${post.title}`;
  const snapshot = await prepareSnapshot(root, post.folder, { branch, update, message });
  if (!snapshot) {
    console.log(`Nothing to publish: ${post.folder} already matches ${update ? branch : 'main'} on GitHub.`);
    return;
  }
  try {
    console.log(`\n${message}\nBranch: ${branch}${openPr ? ` (updates ${openPr.url})` : ''}\n${snapshot.files}\n`);
    console.log('Everything in this commit becomes public on GitHub once pushed.');
    if (!values.yes && !/^y/i.test(await ask('Publish? [y/N] '))) {
      console.log('Nothing was pushed.');
      return;
    }
    await pushSnapshot(snapshot.work, branch);
  } finally {
    await removeWorktree(root, snapshot.work);
  }

  const url = openPr?.url ?? (await run('gh', ['pr', 'create', '--base', 'main', '--head', branch,
    '--title', message, '--body', 'Published with `npm run blog -- publish`.'], root)).split('\n').pop();
  if (values['no-auto-merge']) {
    console.log(`Pull request: ${url}`);
  } else {
    await run('gh', ['pr', 'merge', url, '--auto', '--squash'], root);
    console.log(`Pull request: ${url}\nAuto-merge is on; it merges once the required checks pass.`);
  }
  console.log(`Watch the checks: gh pr checks ${url} --watch\nAfter it merges, run: npm run blog -- sync`);
}

async function sync() {
  const { updated, differing } = await syncCheckout(root);
  if (!updated) {
    console.log('Already up to date with GitHub.');
    return;
  }
  console.log('Updated main from GitHub. Unfinished drafts were left in place.');
  if (differing.length) {
    console.log(`These files differ from the version on GitHub (newer local edits, or changes made on GitHub):\n  ${differing.join('\n  ')}`);
  }
}

async function main(args) {
  const { values, positionals } = parseArgs({
    args, allowPositionals: true,
    options: {
      'no-open': { type: 'boolean' },
      'no-auto-merge': { type: 'boolean' },
      yes: { type: 'boolean' },
      help: { type: 'boolean' },
    },
  });
  if (values.help || positionals.length === 0) {
    console.log(help);
    return;
  }
  const [command, ...arguments_] = positionals;
  if (command === 'new' && arguments_.length <= 2) {
    const title = arguments_[0] ?? await ask('Title: ');
    const slug = arguments_[1] ?? await ask('URL slug (e.g. learning-astro): ');
    const file = await createPost(root, title, slug);
    console.log('Created locally. Add images beside index.md and reference them with ./filename.');
    await openPost(file, values['no-open']);
  } else if (command === 'edit' && arguments_.length <= 1) {
    const query = arguments_[0] ?? await ask('Search title or slug (blank lists all posts): ');
    const matches = await findPosts(root, query);
    if (!matches.length) throw new Error(`No post matches "${query}".`);
    await openPost((await choose(matches)).file, values['no-open']);
  } else if (command === 'publish' && arguments_.length <= 1) {
    await publish(arguments_[0], values);
  } else if (command === 'sync' && arguments_.length === 0) {
    await sync();
  } else {
    throw new Error(help);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
