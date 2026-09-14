# 996blog

Astro-based static blog, migrated from a self-hosted Halo instance. Deployed
on Cloudflare Workers (static assets), built from Markdown in this repo.

## Writing a post

Create a folder under `src/content/posts/<slug>/` containing an `index.md`:

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
