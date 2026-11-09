import { spawn } from 'node:child_process';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { parseFrontmatter } from 'astro/markdown';

const root = fileURLToPath(new URL('../', import.meta.url));
const help = `Usage:
  npm run blog -- new ["Title" slug] [--no-open]
  npm run blog -- edit [title-or-slug] [--no-open]

Missing arguments are prompted for in a terminal. New posts stay local.
Set BLOG_EDITOR to an editor executable (default: code), without arguments.
Use --no-open to print the file path without launching an editor.`;

/** @returns {Promise<string>} */
async function ask(question) {
  if (!process.stdin.isTTY) {
    throw new Error('Supply the missing arguments when running without a terminal.\n' + help);
  }
  const input = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await input.question(question)).trim();
  } finally {
    input.close();
  }
}

/** @returns {Promise<Array<{ file: string, slug: string, title: string }>>} */
async function listPosts(repoRoot) {
  const posts = join(repoRoot, 'src/content/posts');
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
    const { frontmatter } = parseFrontmatter(source);
    result.push({
      file,
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
  const directory = join(repoRoot, 'src/content/posts', slug);
  await mkdir(directory); // Exclusive: never reuse or overwrite an existing folder.
  const file = join(directory, 'index.md');
  const today = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('-');
  // JSON strings are valid YAML strings, including Chinese text and punctuation.
  await writeFile(file, `---\ntitle: ${JSON.stringify(title.trim())}\nslug: ${slug}\ndate: ${today}\ncategories: []\ntags: []\n---\n\n`, { flag: 'wx' });
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

async function main(args) {
  const { values, positionals } = parseArgs({
    args, allowPositionals: true,
    options: { 'no-open': { type: 'boolean' }, help: { type: 'boolean' } },
  });
  if (values.help || positionals.length === 0) {
    console.log(help);
    return;
  }
  const [command, ...arguments_] = positionals;
  if (command === 'new') {
    if (arguments_.length > 2) throw new Error(help);
    const title = arguments_[0] ?? await ask('Title: ');
    const slug = arguments_[1] ?? await ask('URL slug (e.g. learning-astro): ');
    const file = await createPost(root, title, slug);
    console.log('Created locally. Add images beside index.md and reference them with ./filename.');
    await openPost(file, values['no-open']);
    return;
  }
  if (command !== 'edit' || arguments_.length > 1) throw new Error(help);
  const query = arguments_[0] ?? await ask('Search title or slug (blank lists all posts): ');
  const matches = await findPosts(root, query);
  if (!matches.length) throw new Error(`No post matches "${query}".`);
  let selected = matches[0];
  if (matches.length > 1) {
    matches.forEach((post, index) => console.log(`${index + 1}. ${post.title} [${post.slug}]`));
    const choice = await ask('Post number: ');
    if (!/^\d+$/.test(choice) || !matches[Number(choice) - 1]) {
      throw new Error('Choose a post number from the list.');
    }
    selected = matches[Number(choice) - 1];
  }
  await openPost(selected.file, values['no-open']);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
