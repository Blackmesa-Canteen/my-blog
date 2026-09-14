---
title: Migrating Off Halo, to Astro on Cloudflare
slug: migrating-off-halo-to-astro-and-cloudflare
date: 2026-09-14
categories:
- Development
tags:
- Development
- Astro
- Cloudflare
---

For a few years this blog ran on [Halo](https://github.com/halo-dev/halo), a
self-hosted Java CMS, sitting on a small server with a database next to it.
It worked, but "works" and "something I want to keep patching and paying for"
are different things. This post is the writeup of moving everything to a
static site with zero servers to babysit.

## The constraint that shaped everything

I wanted lazy maintenance above all else: no server to patch, no database to
back up, no monthly bill. That points pretty directly at a static site
generator plus a CDN with a generous free tier — no ops, no server, and
deploys that happen because I pushed code, not because I remembered to.

## Getting the content out of Halo first

Before touching any new tooling, step one was just getting everything *out*
of Halo in a form nothing else depends on. Halo stores content as a base
document (`Snapshot`) plus a diff against it for the published version — not
a chain of edits, a single patch straight from base to release. I didn't
want to guess at that format from the outside, so I went and read Halo's
actual source (and the `java-diff-utils` library it wraps) to port the exact
patch-apply algorithm, then cross-checked my reconstruction against Halo's
own auto-generated post excerpts as a ground truth. Slower than
reverse-engineering by trial and error, but I'd rather be sure the words on
this page are the words I actually wrote.

The actual scripts live in this repo, if you're curious or doing the same
migration yourself:
[`extract_halo_backup.py`](https://github.com/Blackmesa-Canteen/my-blog/blob/main/scripts/migration/extract_halo_backup.py)
reconstructs the Markdown + attachments from a Halo backup, and
[`scaffold_content_collections.py`](https://github.com/Blackmesa-Canteen/my-blog/blob/main/scripts/migration/scaffold_content_collections.py)
restructures that output into Astro's per-post content-collection layout.
Both take plain command-line arguments rather than hardcoded paths — see the
[scripts' README](https://github.com/Blackmesa-Canteen/my-blog/blob/main/scripts/migration/README.md)
for usage.

Some of the fiddlier bits along the way:

- **292 attachments, 25 with corrupted filenames** — leftovers from an
  earlier Halo 1.x → 2.x migration. Fixed by matching on the trailing
  hash+extension, which survived the corruption intact even when the
  human-readable part didn't.
- **A URL-encoding trap** — some image links stored spaces as `%20`, others
  didn't, and the two need to resolve to the *same* file on disk. Got this
  wrong once, silently, in a way that only broke months later when Astro's
  build tried to actually treat the path as a URL instead of just text.
- **Dead images, on purpose** — every externally-hosted image (including an
  S3 bucket I'd already deleted) got swapped for a placeholder rather than
  chasing broken links. No point re-downloading things I'd already decided
  to throw away.

End state: 231 posts and 2 pages as plain Markdown files with real YAML
frontmatter, and only the images actually referenced by something — no
orphaned attachments along for the ride.

## Rebuilding it in Astro

[Astro](https://astro.build) was the natural fit: Markdown-native content
collections, zero shipped JavaScript by default, and it optimizes local
images automatically — drop a file next to a post and reference it with a
relative path, no manual resizing or format conversion. Each post lives in
its own folder with its images colocated:

```
src/content/posts/my-post/
  index.md
  cover.jpg
  diagram.png
```

which means editing an image later is a one-file operation instead of
hunting through a shared folder.

## Shipping it without giving up control

The deploy story is Cloudflare's Git integration: connect the GitHub repo,
give it a build command, and every merge to `main` deploys automatically —
no CI secrets stored anywhere. Cloudflare has since folded this into a
unified "Workers" flow, so a purely static site now technically deploys as a
Worker serving static assets via a small `wrangler.jsonc`, but the effect is
the same: push code, get a deploy.

Since this is a public repo, "no manual deploy step" needed a matching "no
manual gate" on the way in:

- **`main` is protected** — no direct pushes, not even for me. Everything
  goes through a pull request.
- **Two required checks** on every PR: a secret scanner (gitleaks) and a
  dependency audit (`npm audit`). Merge is blocked until both are green.
- **Dependabot** watches both the npm dependencies and the GitHub Actions
  versions themselves, and opens PRs on a schedule — which then have to pass
  the same two checks before they can merge, so an automated bump can't sneak
  something bad in unreviewed.

That review pass over the migrated content mattered in practice, not just in
theory — it's the reason a stray real email address and my full name in an
old code snippet got redacted before any of this went public, instead of
after.

## Where it landed

- A Halo backup → a set of plain, portable Markdown files with no lock-in.
- A blog with no server, no database, and no recurring bill.
- A workflow where the only way to change what's live is: branch, commit,
  open a PR, wait for two green checks, merge — and Cloudflare takes it from
  there.

If you're sitting on an old self-hosted blog wondering whether it's worth
the afternoon: it took longer to get the content extraction *correct* than
it did to stand up the new site. The new site is not the hard part.
