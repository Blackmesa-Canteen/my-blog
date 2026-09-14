const CJK_PATTERN = /[一-鿿]/g;

/** Guesses whether a piece of content is primarily Chinese or English, for the html lang attribute (also read by Pagefind for indexing language and by the search UI for its interface language). */
export function detectLang(text: string): 'zh' | 'en' {
  const cjkCount = (text.match(CJK_PATTERN) ?? []).length;
  const meaningfulCount = text.replace(/\s/g, '').length;
  if (meaningfulCount === 0) return 'en';
  return cjkCount / meaningfulCount > 0.2 ? 'zh' : 'en';
}
