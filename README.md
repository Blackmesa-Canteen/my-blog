# 996blog

Astro-based static blog, migrated from a self-hosted Halo instance. Deployed
on Cloudflare Pages, built from Markdown in this repo.

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

## Deployment

This repo is connected to Cloudflare Pages via its GitHub integration:
build command `npm run build`, output directory `dist`. Every push to `main`
deploys automatically; every pull request gets its own preview URL. No
manual deploy step, no secrets stored in this repo.

## Content provenance

All posts under `src/content/posts/` were migrated from the original Halo
backup. A handful of images that were only ever hosted externally (a since
deleted S3 bucket, dead hotlinks) could not be recovered and show a gray
placeholder image with an HTML comment noting the original URL, e.g.:

```html
<!-- original image (unavailable): https://example.com/old-image.jpg -->
```
