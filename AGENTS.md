## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Writing posts

### Post structure

Each post lives at `src/content/posts/<slug>/index.md`. Frontmatter schema (see `src/content.config.ts`):

```yaml
title: string
slug: string        # matches the directory name
date: date           # ISO date, or YYYY-MM-DD
categories: string[] # optional, defaults to []
tags: string[]       # optional, defaults to []
cover: image         # optional, relative path to an image next to index.md
original_permalink: string # optional — only set on posts migrated from the old Halo site, never on new posts
```

Reflective/personal (non-technical) posts typically use `categories: [Random]`, `tags: [Random]`.

### Voice

The authentic voice on this blog (see `migrating-off-halo-to-astro-and-cloudflare` for a clean example) is first-person, concrete, dry and understated, and honest about tradeoffs. Avoid:

- Rhetorical-question openers ("Have you ever wondered...")
- Generic listicle headers ("Conclusion", "The Promise / The Risk")
- Forced wrap-up paragraphs that just restate the post
- Fake personas, bylines, or signed sign-offs (a past cleanup — see git history and PR #13 — removed a batch of AI-generated posts with fake personas like "Ocelot"/"Eva" and a repeated "Pretty good." catchphrase)
- Claude as a commit/PR co-author, or AI-generated disclaimers inside post content — the author doesn't want either

### Sensitive or politically-charged topics

The author sometimes writes about topics that could carry real personal risk under an authoritarian government (e.g. travel/exit-entry policy, region-specific restrictions, anything that could be read as criticism of the state). Treat this as a safety matter, not just a style preference:

- **Never write direct criticism of the government, named officials, or named policies/regulations.** Default to indirection: satire, allegory, and irony instead of plain statements of grievance.
- **Anonymize by default.** No specific place names tied to the author's hometown, family details, employer, or other identifying specifics — use generic terms instead — unless the author explicitly says a given post can include more detail. Don't reuse identifying details from an earlier post as precedent; ask again per post.
- **Do not mimic official government/bureaucratic document forms.**
- Ironic-gratitude register — thanking or praising something in a way whose insincerity is obvious from context, rather than complaining directly.
- Metaphor/allegory standing in for the actual mechanism, instead of naming it.
- Referring to specific laws/regulations obliquely rather than citing them by name or date-stamping them precisely.
- Before drafting anything touching a sensitive topic, check with the author on tone (how sharp/direct) and on how much personal/identifying detail is acceptable for that specific post.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
