export const SITE = {
  name: '996工人之家',
  /** Default meta description, used by the home page and anywhere a page has nothing more specific. */
  description: 'Notes on software development, cloud and self-hosting, plus the odd essay. 软件开发、云计算与折腾笔记。',
};

/**
 * Provenance wording, picked by the `ai_assisted` frontmatter flag: the short
 * label appears (in italics) in post lists, the note at the top of each post.
 * RSS descriptions of AI-assisted posts start with the AI label.
 */
export const PROVENANCE = {
  ai: {
    zh: 'AI 辅助',
    en: 'AI assisted',
    noteZh: '本文在 AI 辅助下写成。',
    noteEn: 'Written with AI assistance.',
  },
  human: {
    zh: '古法写作',
    en: 'Handcrafted',
    noteZh: '本文由作者古法手工写作，纯人工，无添加。',
    noteEn: 'Handcrafted the old-fashioned way by the author. No AI, no additives.',
  },
};
