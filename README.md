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

The helper creates no branches, commits, or uploads. You can keep several
uncommitted drafts in your usual checkout. All posts in that checkout appear
in local previews and builds; a `draft: true` field does not hide them.
Preview with `npm run dev` and visit `/posts/<slug>/`. Adding unfinished
posts to a public branch exposes them, so review the files you commit.

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
owner. To ship a change (a new post, a config tweak, anything):

```sh
git checkout -b my-change
# edit, commit
git push -u origin my-change
gh pr create
```

The PR can only be merged once both required checks pass (see Security
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
