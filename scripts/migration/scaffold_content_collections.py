#!/usr/bin/env python3
"""Restructure the flat output of extract_halo_backup.py (posts/, pages/,
a shared attachments/ folder) into Astro content-collection folders: one
directory per post/page with an index.md and its images colocated next to
it, which is what lets Astro's asset pipeline optimize them automatically.

Usage:
    python3 scaffold_content_collections.py --extracted ./extracted --repo .

Requires: pyyaml (pip install pyyaml)

This is a one-off migration tool, not part of the site build.
"""
import argparse
import os
import re
import shutil
import urllib.parse

import yaml

IMG_MD_RE = re.compile(r'(!\[[^\]]*\]\()((?:[^()\s]|\([^()]*\))+)(\))')
IMG_HTML_RE = re.compile(r'(<img\b[^>]*?\bsrc=["\'])([^"\']+)(["\'])')


def load_doc(path):
    text = open(path, encoding="utf-8").read()
    assert text.startswith("---\n"), path
    end = text.index("\n---\n", 4)
    fm = yaml.safe_load(text[4:end + 1]) or {}
    body = text[end + 5:]
    if body.startswith("\n"):
        body = body[1:]
    return fm, body


def migrate_dir(src_dir, dst_root, attach_root):
    written = 0
    copied_images = 0
    for fname in sorted(os.listdir(src_dir)):
        if not fname.endswith(".md"):
            continue
        slug = fname[:-3]
        fm, body = load_doc(os.path.join(src_dir, fname))
        out_dir = os.path.join(dst_root, slug)
        os.makedirs(out_dir, exist_ok=True)
        used_names = {}  # basename -> abs source path already copied under this name

        def copy_local_image(ref):
            """Copy the referenced image into out_dir; return its local
            (decoded, literal) filename, deduplicating by source path."""
            nonlocal copied_images
            if not ref.startswith("../attachments/"):
                return None  # shouldn't happen: all local refs point into attachments/
            rel = urllib.parse.unquote(ref[len("../attachments/"):])
            abspath = os.path.join(attach_root, rel)
            basename = os.path.basename(rel)
            name = basename
            n = 1
            while name in used_names and used_names[name] != abspath:
                stem, ext = os.path.splitext(basename)
                name = f"{stem}-{n}{ext}"
                n += 1
            if name not in used_names:
                shutil.copy2(abspath, os.path.join(out_dir, name))
                used_names[name] = abspath
                copied_images += 1
            return name

        cover = fm.get("cover")
        if cover:
            # frontmatter `image()` schema fields want a literal relative
            # path (not a URL) -- unlike Markdown body images, it does not
            # percent-decode the string itself.
            name = copy_local_image(cover)
            if name:
                fm["cover"] = "./" + name

        def repl_md(m):
            name = copy_local_image(m.group(2))
            url = "./" + urllib.parse.quote(name) if name else m.group(2)
            return m.group(1) + url + m.group(3)

        def repl_html(m):
            name = copy_local_image(m.group(2))
            url = "./" + urllib.parse.quote(name) if name else m.group(2)
            return m.group(1) + url + m.group(3)

        body = IMG_MD_RE.sub(repl_md, body)
        body = IMG_HTML_RE.sub(repl_html, body)

        fm_yaml = yaml.safe_dump(fm, allow_unicode=True, sort_keys=False, default_flow_style=False)
        with open(os.path.join(out_dir, "index.md"), "w", encoding="utf-8") as f:
            f.write("---\n")
            f.write(fm_yaml)
            f.write("---\n\n")
            f.write(body)
        written += 1
    return written, copied_images


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--extracted", required=True, help="Output directory from extract_halo_backup.py")
    parser.add_argument("--repo", required=True, help="Astro project root (content goes under src/content/)")
    args = parser.parse_args()

    extracted = os.path.abspath(args.extracted)
    repo = os.path.abspath(args.repo)
    attach_root = os.path.join(extracted, "attachments")

    p_written, p_images = migrate_dir(os.path.join(extracted, "posts"),
                                       os.path.join(repo, "src/content/posts"), attach_root)
    pg_written, pg_images = migrate_dir(os.path.join(extracted, "pages"),
                                         os.path.join(repo, "src/content/pages"), attach_root)
    print(f"posts: {p_written} written, {p_images} images copied")
    print(f"pages: {pg_written} written, {pg_images} images copied")


if __name__ == "__main__":
    main()
