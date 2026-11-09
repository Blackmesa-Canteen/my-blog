# 996blog

Astro-based static blog, migrated from a self-hosted Halo instance. Deployed
on Cloudflare Workers (static assets), built from Markdown in this repo.

## Writing a post

Use the local writing helper to create a post or find one to edit:

```sh
npm run blog -- new
npm run blog -- new "我的新文章" my-new-post
npm run blog -- edit "中文"
npm run blog -- edit my-new-post
```

`new` prompts for a title and an explicit URL slug, creates the post folder,
and opens `index.md`. Slugs use lowercase English letters, numbers, and
hyphens; they are never generated from Chinese titles. Existing folders and
slugs cannot be reused. The date defaults to today in your local timezone;
edit it in the file if you want a different publication date.

`edit` searches titles and slugs, including Chinese text, and asks you to
choose when several posts match. With no search argument it prompts for
one; a blank search lists all posts. It opens the original file without
rewriting metadata or Markdown. Changing a title does not change its slug.

The helper tries the VS Code `code` executable. Set `BLOG_EDITOR` to another
editor executable or its full path, without flags, or pass `--no-open` to
print the file path. If the editor is unavailable, the path is still printed
so you can open it yourself.

`new` and `edit` create no branches, commits, or uploads. You can keep several
uncommitted drafts in your usual checkout on `main`. All posts in that
checkout appear in local previews; a `draft: true` field does not hide them.
Preview with `npm run dev` and visit `/posts/<slug>/`.

When a post is ready:

```sh
npm run blog -- publish            # picks from the new or changed posts
npm run blog -- publish my-new-post
npm run blog -- sync               # after the pull request merges
```

`publish` fetches the latest `main` and copies only the selected post folder
into a temporary Git worktree, so unfinished drafts and other local changes
are never included. It stops if the post changed on GitHub since your
checkout, or if another post there already uses the slug. For a new post
dated before today, it offers to change the date (in your local file too).
It then shows the one commit it built and asks before pushing it to
`post/<slug>`, opens a pull request (or adds a commit to the post's open
one), and turns on auto-merge, which waits for the required checks. Pass
`--no-auto-merge` to merge it yourself, or `--yes` to skip the question.
Your earlier local drafting history never leaves your machine, but every
version you publish, including later fixes to an open pull request, stays
public in the PR history.

`sync` fast-forwards your local `main`. Local files that would block the
update, such as the copy of a post you just published, are backed up under
`.git/blog-sync-backup/`, moved aside, and copied back after the update.
Unfinished drafts stay as they are, and edits you made after publishing are
kept and listed as differences. If the update fails, your files are put back
and the backup is kept. If local `main` has its own commits, sync stops
without changing anything.

Keep images next to `index.md` and use `./filename.png` links. If you paste
images through your editor, check that it saves them in the post folder and
uses this relative path. Run `npm run test:blog` to check the helper and build
a generated sample post with the site's current schema in a temporary copy.

Each post lives under `src/content/posts/<slug>/` with an `index.md`:

```
src/content/posts/my-new-post/
  index.md
  cover.jpg      (optional)
  diagram.png    (any images the post uses)
```

`index.md` frontmatter:

```yaml
---
title: My New Post
slug: my-new-post
date: 2026-09-14
categories: [Tech]
tags: [astro]
cover: ./cover.jpg   # optional, relative to this file
---
```

Reference images from the body with a plain relative path:

```md
![a diagram](./diagram.png)
```

Astro automatically optimizes images referenced this way (resizing, webp
conversion) at build time — no manual step needed.

Pages (About, Tea House, etc.) work the same way under `src/content/pages/`,
and are served at `/<slug>` instead of `/posts/<slug>`.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # production build -> dist/
npm run preview   # preview the production build locally
```

## Workflow

`main` is protected — direct pushes are rejected, including for the repo
owner. For posts, `npm run blog -- publish` (above) does this for you. To
ship any other change (a config tweak, a new feature):

```sh
git checkout -b my-change
# edit, commit
git push -u origin my-change
gh pr create
```

The PR can only be merged once the required checks pass (see Security
below). No reviewer approval is required, so once checks are green you can
merge it yourself.

## Security

Every push and pull request runs `.github/workflows/security.yml`:

- **Secret scan (gitleaks)** — fails the check if a credential/token/key
  looks like it was committed.
- **Dependency audit (npm audit)** — fails on high/critical vulnerabilities
  in dependencies.

Both are required status checks on `main`, so a PR can't merge if either
fails. **Dependabot** is also enabled on the repo: it opens PRs for
vulnerable or outdated dependencies (`npm` and the GitHub Actions used in
this repo) on a weekly schedule, and immediately for security advisories.
Those PRs go through the same checks as everything else.

## Build check

Every pull request and push to `main` also runs
`.github/workflows/build.yml`. The **Site build** check uses Node 22,
installs the locked dependencies with `npm ci`, and runs `npm run build`
(Astro plus Pagefind). It also runs `npm run test:blog`, including a generated
post build in a temporary copy. It validates the site without deploying it and
requires no deployment credentials.

To make a successful build a merge requirement, add **Site build** from
GitHub Actions to the required status checks in `main`'s branch protection
settings, keeping both existing security checks. Adding the workflow alone
does not make the check required.

## Deployment

This repo is connected to Cloudflare's Git integration (Workers Builds),
which deploys static sites through Wrangler rather than through the older
Pages product. Its build command is `npm run build` (which also runs
Pagefind over the output via the `postbuild` script), and its deploy
command is `wrangler deploy`, which publishes `dist/` as the static-assets
binding described in `wrangler.jsonc`. Merging a PR into `main` (the only
way anything reaches `main`) triggers an automatic production build and
deploy; every open pull request also gets its own preview URL. No manual
deploy step, no secrets stored in this repo.

## Content provenance

All posts under `src/content/posts/` were migrated from the original Halo
backup. A handful of images that were only ever hosted externally (a since
deleted S3 bucket, dead hotlinks) could not be recovered and show a gray
placeholder image with an HTML comment noting the original URL, e.g.:

```html
<!-- original image (unavailable): https://example.com/old-image.jpg -->
```
