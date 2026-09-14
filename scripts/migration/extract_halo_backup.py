#!/usr/bin/env python3
"""Extract published posts/pages + used images from a Halo 2.x backup
(the format produced by Halo's own admin-console "backup" export) into
plain Markdown files with a shared attachments/ folder.

Usage:
    python3 extract_halo_backup.py --backup-root /path/to/halo-backup --out ./extracted

Requires: pyyaml, markdownify (pip install pyyaml markdownify)

This is a one-off migration tool, not part of the site build -- it was
used once to move this blog's content off Halo. Kept here for provenance
and in case it's useful to anyone doing the same migration.
"""
import argparse
import json
import base64
import re
import os
import shutil
import urllib.parse

import yaml
from markdownify import markdownify as md


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--backup-root", required=True, help="Path to the extracted Halo backup (contains extensions.data and workdir/)")
    parser.add_argument("--out", required=True, help="Output directory to write posts/, pages/, and attachments/ into")
    args = parser.parse_args()

    backup_root = os.path.abspath(args.backup_root)
    ext_data = os.path.join(backup_root, "extensions.data")
    attach_root = os.path.join(backup_root, "workdir", "attachments")
    out_root = os.path.abspath(args.out)

    with open(ext_data) as f:
        raw_entries = json.load(f)

    def decode(item):
        return json.loads(base64.b64decode(item["data"]))

    snapshots, posts, singlepages, categories, tags, attachments = {}, [], [], {}, {}, []
    for item in raw_entries:
        obj = decode(item)
        k = obj.get("kind")
        if k == "Snapshot":
            snapshots[obj["metadata"]["name"]] = obj
        elif k == "Post":
            posts.append(obj)
        elif k == "SinglePage":
            singlepages.append(obj)
        elif k == "Category":
            categories[obj["metadata"]["name"]] = obj["spec"]["displayName"]
        elif k == "Tag":
            tags[obj["metadata"]["name"]] = obj["spec"]["displayName"]
        elif k == "Attachment":
            attachments.append(obj)

    permalink_to_attachment = {a["status"]["permalink"]: a for a in attachments if a.get("status", {}).get("permalink")}

    # ---------- patch reconstruction (ported from java-diff-utils Patch.applyTo) ----------
    # Halo stores a full base document (Snapshot) plus a patch straight from
    # base to the published revision -- not a chain of incremental diffs.
    # Verified against Halo's own AbstractContentService/ContentWrapper and
    # java-diff-utils' Patch/DeleteDelta/InsertDelta/ChangeDelta sources, and
    # cross-checked by reconstructing each post's excerpt and comparing it to
    # Halo's own stored excerpt.

    def apply_patch(lines, patch_json):
        deltas = json.loads(patch_json)
        lines = list(lines)
        for d in sorted(deltas, key=lambda x: x["source"]["position"], reverse=True):
            pos = d["source"]["position"]
            n_del = len(d["source"]["lines"])
            ins = d["target"]["lines"]
            lines[pos:pos + n_del] = ins
        return lines

    def reconstruct(entity, field):
        base_name = entity["spec"].get("baseSnapshot")
        target_name = entity["spec"].get("releaseSnapshot") or entity["spec"].get("headSnapshot")
        if not base_name or not target_name or base_name not in snapshots or target_name not in snapshots:
            return None
        base = snapshots[base_name]
        base_val = base["spec"][field]
        if base_name == target_name:
            return base_val
        target = snapshots[target_name]
        patch = target["spec"][field]
        base_lines = base_val.split("\n")
        if patch.strip().startswith("["):
            final_lines = apply_patch(base_lines, patch)
        else:
            final_lines = patch.split("\n")
        return "\n".join(final_lines)

    # ---------- image resolution ----------
    # Some attachment files on disk have corrupted ("mojibake") filenames
    # left over from an earlier Halo 1.x -> 2.x import. Their trailing
    # "-<hash>.<ext>" suffix survives corruption intact and uniquely
    # identifies the file, so that's the fallback match key.

    SUFFIX_RE = re.compile(r'-([0-9a-f]{32})\.([A-Za-z0-9]+)$')

    def resolve_local_file(permalink):
        """Return absolute path on disk for a /upload/... permalink (decoded,
        real-character form), or None."""
        # Attachment.status.permalink is sometimes stored percent-encoded
        # (matching how it was originally embedded in a markdown link) --
        # try both forms so decoding upstream doesn't break the lookup.
        att = permalink_to_attachment.get(permalink) or \
            permalink_to_attachment.get(urllib.parse.quote(permalink, safe="/"))
        if att:
            rel = att["metadata"].get("annotations", {}).get("storage.halo.run/local-relative-path")
            if rel:
                full = os.path.join(attach_root, rel)
                if os.path.isfile(full):
                    return full
                d, fname = os.path.split(rel)
                m = SUFFIX_RE.search(fname)
                if m:
                    suffix = f"-{m.group(1)}.{m.group(2)}"
                    dirpath = os.path.join(attach_root, d)
                    if os.path.isdir(dirpath):
                        cands = [x for x in os.listdir(dirpath) if x.endswith(suffix)]
                        if len(cands) == 1:
                            return os.path.join(dirpath, cands[0])
        # no attachment record: derive path directly (all local attachments in
        # this backup live under migrate-from-1.x/<permalink-without-/upload/>)
        if permalink.startswith("/upload/"):
            direct = os.path.join(attach_root, "migrate-from-1.x", permalink[len("/upload/"):])
            if os.path.isfile(direct):
                return direct
        return None

    used_local = {}   # permalink -> absolute source path
    placeholder_count = [0]
    placeholder_log = []

    def copy_and_rewrite(url, context_title):
        """Given an image URL found in content, return the rewritten markdown path.

        Local permalinks are decoded to their real (unescaped) form before
        being used as filesystem paths -- some source markdown percent-encodes
        spaces (e.g. "%20") while the actual attachment file on disk uses a
        literal space, and a copy destination must match the real filename,
        not the URL-escaped one. The returned markdown link is then
        re-percent-encoded so it stays a valid, resolvable link."""
        clean = urllib.parse.unquote(url.split("?")[0])
        if clean.startswith("/upload/"):
            src = resolve_local_file(clean)
            if src:
                used_local[clean] = src
                rel = clean[len("/upload/"):]
                encoded_rel = "/".join(urllib.parse.quote(seg) for seg in rel.split("/"))
                return "../attachments/" + encoded_rel
            placeholder_count[0] += 1
            placeholder_log.append((context_title, url, "local file missing"))
            return "../attachments/placeholder.png"
        # external (old blog, S3 CDN, hotlinks, etc.) -> placeholder
        placeholder_count[0] += 1
        placeholder_log.append((context_title, url, "external/unreachable"))
        return "../attachments/placeholder.png"

    IMG_MD_RE = re.compile(r'!\[([^\]]*)\]\(((?:[^()\s]|\([^()]*\))+)(?:\s+"[^"]*")?\)')
    IMG_HTML_RE = re.compile(r'<img\b[^>]*?\bsrc=["\']([^"\']+)["\'][^>]*?/?>')

    def process_images_in_markdown(content_md, title):
        def repl_md(m):
            alt, url = m.group(1), m.group(2)
            new_url = copy_and_rewrite(url, title)
            note = ""
            if new_url.endswith("placeholder.png") and not url.startswith("/upload/"):
                note = f"\n<!-- original image (unavailable): {url} -->"
            return f"![{alt}]({new_url}){note}"

        def repl_html(m):
            url = m.group(1)
            new_url = copy_and_rewrite(url, title)
            note = ""
            if new_url.endswith("placeholder.png") and not url.startswith("/upload/"):
                note = f"\n<!-- original image (unavailable): {url} -->"
            return f'<img src="{new_url}">{note}'

        content_md = IMG_MD_RE.sub(repl_md, content_md)
        content_md = IMG_HTML_RE.sub(repl_html, content_md)
        return content_md

    HEADER_ANCHOR_RE = re.compile(r'<a[^>]*class="header-anchor"[^>]*>.*?</a>', re.DOTALL)

    def to_markdown(raw, raw_type, title):
        if raw_type == "HTML":
            cleaned = HEADER_ANCHOR_RE.sub("", raw)
            content = md(cleaned, heading_style="ATX")
        else:
            content = raw
        return process_images_in_markdown(content, title)

    def safe_slug(spec_slug, fallback_name):
        return spec_slug or fallback_name

    def write_doc(out_dir, slug, frontmatter, body):
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, f"{slug}.md")
        fm_yaml = yaml.safe_dump(frontmatter, allow_unicode=True, sort_keys=False, default_flow_style=False)
        with open(path, "w", encoding="utf-8") as f:
            f.write("---\n")
            f.write(fm_yaml)
            f.write("---\n\n")
            f.write(body)
            f.write("\n")
        return path

    def build_frontmatter(entity, cover_rel=None):
        fm = {
            "title": entity["spec"]["title"],
            "slug": entity["spec"]["slug"],
            "date": entity["spec"].get("publishTime"),
        }
        cats = entity["spec"].get("categories")
        if cats:
            fm["categories"] = [categories.get(c, c) for c in cats]
        tgs = entity["spec"].get("tags")
        if tgs:
            fm["tags"] = [tags.get(t, t) for t in tgs]
        if cover_rel:
            fm["cover"] = cover_rel
        permalink = entity.get("status", {}).get("permalink")
        if permalink:
            fm["original_permalink"] = permalink
        return fm

    report = {"posts": 0, "pages": 0, "errors": []}

    # Only published, non-deleted content -- drafts and deleted posts are
    # intentionally left behind.
    published_posts = [p for p in posts if not p["spec"].get("deleted") and p["spec"].get("publish")]
    live_pages = [sp for sp in singlepages if not sp["spec"].get("deleted") and sp["spec"].get("publish")]

    for p in published_posts:
        title = p["spec"]["title"]
        try:
            raw = reconstruct(p, "rawPatch")
            raw_type = snapshots[p["spec"].get("releaseSnapshot") or p["spec"].get("headSnapshot")]["spec"]["rawType"]
            if raw is None:
                report["errors"].append((title, "no reconstructable content"))
                continue
            cover_rel = None
            cover = p["spec"].get("cover")
            if cover:
                cover_rel = copy_and_rewrite(cover, title)
            body = to_markdown(raw, raw_type, title)
            fm = build_frontmatter(p, cover_rel)
            write_doc(os.path.join(out_root, "posts"), safe_slug(p["spec"]["slug"], p["metadata"]["name"]), fm, body)
            report["posts"] += 1
        except Exception as e:
            report["errors"].append((title, str(e)))

    for sp in live_pages:
        title = sp["spec"]["title"]
        try:
            raw = reconstruct(sp, "rawPatch")
            raw_type = snapshots[sp["spec"].get("releaseSnapshot") or sp["spec"].get("headSnapshot")]["spec"]["rawType"]
            if raw is None:
                report["errors"].append((title, "no reconstructable content"))
                continue
            cover_rel = None
            cover = sp["spec"].get("cover")
            if cover:
                cover_rel = copy_and_rewrite(cover, title)
            body = to_markdown(raw, raw_type, title)
            fm = build_frontmatter(sp, cover_rel)
            write_doc(os.path.join(out_root, "pages"), safe_slug(sp["spec"]["slug"], sp["metadata"]["name"]), fm, body)
            report["pages"] += 1
        except Exception as e:
            report["errors"].append((title, str(e)))

    # Copy only the local images actually referenced by something.
    attach_out = os.path.join(out_root, "attachments")
    for permalink, src in used_local.items():
        rel = permalink[len("/upload/"):]
        dst = os.path.join(attach_out, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)

    def make_placeholder(path):
        """A recognizable 'broken/unavailable image' icon (picture frame +
        mountain + sun), not a flat gray box -- a flat fill reads as a
        still-loading state to readers, this should read as unavailable."""
        import struct
        import zlib
        w, h = 480, 320
        bg = (243, 244, 246)
        border_color = (203, 206, 210)
        icon_color = (156, 163, 175)
        sun_color = (250, 204, 21)
        border_w = 5

        fx0, fy0, fx1, fy1 = 30, 30, w - 30, h - 30
        ix0, iy0, ix1, iy1 = fx0 + 20, fy0 + 20, fx1 - 20, fy1 - 20
        iw, ih = ix1 - ix0, iy1 - iy0
        sun_cx, sun_cy, sun_r = ix0 + iw * 0.22, iy0 + ih * 0.28, iw * 0.10
        m1 = (ix0 + iw * 0.05, iy1, ix0 + iw * 0.38, iy0 + ih * 0.35, ix0 + iw * 0.62, iy1)
        m2 = (ix0 + iw * 0.40, iy1, ix0 + iw * 0.72, iy0 + ih * 0.20, ix0 + iw * 1.0, iy1)

        def in_circle(x, y, cx, cy, r):
            return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

        def in_triangle(px, py, x1, y1, x2, y2, x3, y3):
            def sign(ax, ay, bx, by, cx, cy):
                return (ax - cx) * (by - cy) - (bx - cx) * (ay - cy)
            d1 = sign(px, py, x1, y1, x2, y2)
            d2 = sign(px, py, x2, y2, x3, y3)
            d3 = sign(px, py, x3, y3, x1, y1)
            has_neg = d1 < 0 or d2 < 0 or d3 < 0
            has_pos = d1 > 0 or d2 > 0 or d3 > 0
            return not (has_neg and has_pos)

        def chunk(tag, data):
            return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data))

        rows = []
        for y in range(h):
            row = bytearray()
            for x in range(w):
                color = bg
                on_frame = fx0 <= x <= fx1 and fy0 <= y <= fy1
                on_border = on_frame and (
                    x < fx0 + border_w or x > fx1 - border_w or y < fy0 + border_w or y > fy1 - border_w
                )
                if on_border:
                    color = border_color
                elif in_circle(x, y, sun_cx, sun_cy, sun_r):
                    color = sun_color
                elif ix0 <= x <= ix1 and iy0 <= y <= iy1 and (in_triangle(x, y, *m1) or in_triangle(x, y, *m2)):
                    color = icon_color
                row += bytes(color)
            rows.append(bytes(row))

        sig = b'\x89PNG\r\n\x1a\n'
        ihdr = chunk(b'IHDR', struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
        raw = b''.join(b'\x00' + r for r in rows)
        idat = chunk(b'IDAT', zlib.compress(raw, 9))
        iend = chunk(b'IEND', b'')
        with open(path, "wb") as f:
            f.write(sig + ihdr + idat + iend)

    os.makedirs(attach_out, exist_ok=True)
    make_placeholder(os.path.join(attach_out, "placeholder.png"))

    print("=== EXTRACTION REPORT ===")
    print("posts written:", report["posts"], "of", len(published_posts))
    print("pages written:", report["pages"], "of", len(live_pages))
    print("local images copied:", len(used_local))
    print("placeholder used (external/missing):", placeholder_count[0])
    print("errors:", len(report["errors"]))
    for t, e in report["errors"][:20]:
        print("  -", t, ":", e)

    with open(os.path.join(out_root, "placeholder-report.txt"), "w", encoding="utf-8") as f:
        for t, u, reason in placeholder_log:
            f.write(f"[{reason}] {t}: {u}\n")


if __name__ == "__main__":
    main()
