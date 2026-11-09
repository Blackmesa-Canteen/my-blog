---
title: "写博客的小脚本 / A Small Helper for Writing This Blog"
slug: blog-writing-helper
date: 2026-11-09
categories:
- Development
tags:
- Development
- Astro
- Git
ai_assisted: true
---

## 中文

### 起因

这个博客的 `main` 分支是受保护的，连我自己也不能直接推送。安全上这是对的，代价是每发一篇文章都要走一遍：新建分支、写 frontmatter、提交、推送、开 PR、等检查、合并。写三百字，操作十几步。

一开始想过上 CMS，比如 Decap。看了一圈还是放弃了：仓库是公开的，Decap 的草稿流程会把每篇草稿存成一个分支，等于草稿公开；它的富文本编辑器保存时会重写 Markdown，而旧文章里有不少内联 SVG 和 HTML 注释；另外还得单独搭登录。为了少敲几条命令引入这些，不太划算。

最后在仓库里写了一个四百来行的 Node 脚本，没有新增依赖。

### 四个命令

```sh
npm run blog -- new "标题" my-slug   # 新建文章
npm run blog -- edit 关键词           # 按标题或 slug 找到文章并打开
npm run blog -- publish              # 发布
npm run blog -- sync                 # PR 合并后同步本地
```

`new` 要求一个明确的英文 slug，不会从中文标题自动生成，也不能和已有文章重复。日期默认是今天，按本地时区算，所以在 UTC 以东的地方早上写的文章不会被记成前一天。

`edit` 支持中文搜索。打开旧文章时不改动文件，`original_permalink`、日期、HTML 都原样保留。改标题不会改 URL，因为 URL 来自 frontmatter 里的 `slug`。

草稿就是工作目录里没提交的文件夹。可以同时写好几篇，用 `npm run dev` 一起预览，不用切分支。

### publish 做了什么

`publish` 不在当前目录里提交。它从最新的 `main` 建一个临时 worktree，只把选中的那篇文章的文件夹复制进去，生成一个提交，列出改了哪些文件，确认后推到 `post/<slug>` 分支，开 PR，再打开 auto-merge。PR 要等三个必需检查（密钥扫描、依赖审计、站点构建）都通过才会合并。

这样别的草稿和本地改动不会被顺带提交；写作过程中删掉的段落也不会进 Git 历史，GitHub 只看到我决定发布的版本。

有两种情况它会停下来：这篇文章在 GitHub 上被改过（比如我在网页上修了个错字），直接覆盖会把那次修改冲掉；或者 GitHub 上已经有别的文章用了同一个 slug。

如果新文章的日期早于今天（草稿写了两周很常见），它会问要不要改成今天。改的是本地文件，这样本地和线上保持一致。

### sync

PR 合并后，本地那篇文章还是一个未跟踪的文件夹，而 `main` 上已经有同名文件，`git pull` 会拒绝执行。`sync` 的做法是：先把挡路的文件备份到 `.git/blog-sync-backup/`，挪开，快进 `main`，再把文件放回去。本地内容和线上一样的，放回去之后就是干净的；发布后又改过的，改动保留，并列出来。中途失败就把文件放回原处，备份留着。

### 它不做的事

- `draft: true` 不会隐藏文章。工作目录里的文章都会出现在本地预览里，发布了才会上线。
- 发布出去的版本就是公开的。如果 PR 还没合并、我改完又发布一次，两个版本都会留在 PR 历史里。
- 图片要自己放进文章文件夹，用 `./文件名.png` 引用，脚本不处理图片。
- 本地 `main` 上如果有自己的提交，`sync` 会拒绝，什么都不改。

这篇文章是用它发布的第一篇。

## English

### Why

The `main` branch of this blog is protected; not even I can push to it directly. That's the right call for security, but it means every post goes through the same routine: create a branch, write the frontmatter, commit, push, open a PR, wait for checks, merge. Three hundred words, a dozen steps.

I looked at adding a CMS, Decap in particular, and decided against it. The repository is public, and Decap's editorial workflow stores each draft as a branch, so drafts would be public too. Its rich-text editor re-serializes Markdown on save, and the older posts are full of inline SVG and HTML comments. It also needs its own login setup. That's a lot to take on to avoid typing a few commands.

What I ended up with is a Node script of a bit over four hundred lines in the repository, with no new dependencies.

### The four commands

```sh
npm run blog -- new "Title" my-slug   # start a post
npm run blog -- edit keyword          # find a post by title or slug and open it
npm run blog -- publish               # publish
npm run blog -- sync                  # update the local checkout after the PR merges
```

`new` asks for an explicit English slug. It never derives one from a Chinese title, and it won't reuse one that's taken. The date defaults to today in the local timezone, so a post written in the morning somewhere east of UTC doesn't get yesterday's date.

`edit` searches Chinese titles too. Opening an old post doesn't touch the file: `original_permalink`, the date, and any raw HTML stay exactly as they were. Changing a title doesn't change the URL, because the URL comes from the `slug` field.

Drafts are just uncommitted folders in the working checkout. I can have several going at once and preview them all with `npm run dev`, with no branch switching.

### What publish does

`publish` doesn't commit in the working checkout. It creates a temporary worktree from the latest `main`, copies in only the selected post's folder, builds one commit, shows which files changed, and after I confirm, pushes it to a `post/<slug>` branch, opens a PR, and turns on auto-merge. The PR merges only after the three required checks pass: secret scan, dependency audit, and site build.

That keeps other drafts and unrelated local changes out of the commit. Paragraphs I deleted while writing never reach Git history either; GitHub only sees the versions I chose to publish.

It stops in two cases: the post was changed on GitHub (say, a typo fixed in the web editor) and copying my folder over would undo that, or another post on GitHub already uses the same slug.

If a new post is dated before today, which happens when a draft sits for two weeks, it offers to change the date to today. It changes the local file, so the local copy matches what goes live.

### sync

After the PR merges, my local copy of the post is still an untracked folder while `main` now has the same files, so `git pull` refuses to run. `sync` backs up the files in the way to `.git/blog-sync-backup/`, moves them aside, fast-forwards `main`, and copies them back. Files identical to the published version end up clean; edits made after publishing are kept and listed. If anything fails partway, the files go back where they were and the backup stays.

### What it doesn't do

- `draft: true` doesn't hide anything. Every post in the checkout shows up in the local preview; a post goes live only when published.
- A published version is public. If I fix something and publish again before the PR merges, both versions stay in the PR history.
- Images are my job: put them in the post folder and link them as `./name.png`. The script doesn't handle images.
- If local `main` has commits of its own, `sync` refuses and changes nothing.

This post is the first one published with it.
