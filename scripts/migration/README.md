# Migration scripts

One-off scripts used to move this blog's content off a self-hosted [Halo](https://github.com/halo-dev/halo)
instance and into this repo. Not part of the site build — kept here for
provenance, and in case they're useful to anyone doing the same migration.

## What they do

1. **`extract_halo_backup.py`** — reads a Halo backup (`extensions.data` +
   `workdir/`), reconstructs each published post/page's content from Halo's
   base-document-plus-patch storage format, and writes plain Markdown files
   with YAML frontmatter plus a shared `attachments/` folder. Only published,
   non-deleted content is extracted; only images actually referenced by
   something are copied; any image that was only ever hosted externally
   (dead links, deleted buckets, etc.) is swapped for a generated
   "unavailable" placeholder rather than an empty broken image.

   ```sh
   pip install -r requirements.txt
   python3 extract_halo_backup.py --backup-root /path/to/halo-backup --out ./extracted
   ```

2. **`scaffold_content_collections.py`** — takes that flat output and
   restructures it into Astro's per-post-folder content-collection layout
   (`src/content/posts/<slug>/index.md` with its images colocated), which is
   what lets Astro's build pipeline optimize images automatically.

   ```sh
   python3 scaffold_content_collections.py --extracted ./extracted --repo .
   ```

## Notes for anyone adapting this

- The patch-reconstruction logic is a direct port of Halo's own
  `AbstractContentService`/`ContentWrapper` plus the `java-diff-utils`
  library it wraps (`Patch`/`DeleteDelta`/`InsertDelta`/`ChangeDelta`) — read
  from Halo's actual source rather than guessed, and cross-checked by
  reconstructing each post's excerpt and comparing it against Halo's own
  stored excerpt.
- If your backup has corrupted attachment filenames from an earlier Halo
  1.x → 2.x import, `extract_halo_backup.py` falls back to matching files by
  their trailing `-<hash>.<ext>` suffix, which tends to survive corruption
  even when the human-readable part doesn't.
- Local image paths are decoded/re-encoded carefully around every filesystem
  vs. URL boundary — some source content percent-encodes spaces (`%20`) in
  image links while the actual file on disk has a literal space, and getting
  this wrong breaks silently until something (like Astro's asset pipeline)
  actually treats the path as a URL instead of just text.
