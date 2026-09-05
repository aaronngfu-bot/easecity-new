import type { Language } from '@/i18n/translations'

/**
 * Simplified-Chinese derivation for Traditional Chinese content.
 *
 * Blog posts live in the database as (en, zh-Hant) pairs — there is no zh-CN
 * column. Rather than make the editor maintain a third copy of every post,
 * the zh-CN reading is DERIVED here on the server with OpenCC (twp→cn,
 * Taiwanese-phrase-aware), with a small hand-curated domain glossary applied
 * on top so product vocabulary converts the way the site already spells it
 * (串流→串流, 滑鼠→鼠标, 螢幕→屏幕 …).
 *
 * The converter is loaded lazily (it pulls a sizeable dictionary) and its
 * results are memoised per input string, so a post body is converted once per
 * server process, not once per request.
 */

/** Hand-curated fixes applied after OpenCC, in order. Keep this short — it is
 *  for product/domain words the generic dictionary gets wrong for this site. */
const GLOSSARY: readonly (readonly [string, string])[] = [
  ['网上', '网上'], // anchor: no-op, documents intent (HK 網上 → CN 网上 is fine)
  ['串流', '串流'], // anchor: EC-Share keeps 串流 in both Chinese variants
  ['滑鼠', '鼠标'],
  ['螢幕', '屏幕'],
  ['影片', '视频'],
  ['部落格', '博客'],
  ['網誌', '博客'],
  ['軟體', '软件'],
  ['程式', '程序'],
  ['支援', '支持'],
  ['帳號', '账号'],
  ['帳戶', '账户'],
  ['帳單', '账单'],
  // OpenCC renders simplified 帳 as 帐; mainland standard financial usage is 账.
  ['帐', '账'],
  ['設定', '设置'],
  ['資料', '数据'],
  ['伺服器', '服务器'],
]

let cachedConverter: ((input: string) => string) | null | undefined

function getConverter(): ((input: string) => string) | null {
  if (cachedConverter !== undefined) return cachedConverter
  try {
    const opencc = require('opencc-js') as {
      Converter: (cfg: { from: string; to: string }) => (input: string) => string
    }
    cachedConverter = opencc.Converter({ from: 'twp', to: 'cn' })
  } catch {
    // Dictionary failed to load — degrade to identity so pages still render
    // (a zh-CN reader then sees the Traditional text rather than an error).
    cachedConverter = null
  }
  return cachedConverter
}

const memo = new Map<string, string>()
const MEMO_MAX = 500

function toSimplified(text: string): string {
  if (!text || !/[\u4e00-\u9fff]/.test(text)) return text
  const hit = memo.get(text)
  if (hit !== undefined) return hit

  const convert = getConverter()
  let out = text
  if (convert) out = convert(text)
  for (const [from, to] of GLOSSARY) {
    if (out.includes(from)) out = out.split(from).join(to)
  }

  if (memo.size >= MEMO_MAX) {
    // Cheap reset instead of a full LRU — post bodies are long strings and
    // the hot set (list excerpts + recent posts) is small.
    memo.clear()
  }
  memo.set(text, out)
  return out
}

function pick(lang: Language, en: string, zhHant: string | null, fallback: string): string {
  if (lang === 'en') return en
  const zh = zhHant || fallback
  return lang === 'zh-CN' ? toSimplified(zh) : zh
}

export const zhCn = {
  /** Derived zh-CN title for a bilingual post row. */
  title(lang: Language, title: string, titleZh: string | null): string {
    return pick(lang, title, titleZh, title)
  },
  /** Derived zh-CN excerpt. */
  excerpt(lang: Language, excerpt: string | null, excerptZh: string | null): string | null {
    if (lang === 'en') return excerpt
    return lang === 'zh-CN' ? toSimplified(excerptZh || excerpt || '') : excerptZh || excerpt
  },
  /** Derived zh-CN markdown body. */
  content(lang: Language, content: string, contentZh: string | null): string {
    if (lang === 'en') return content
    return lang === 'zh-CN' ? toSimplified(contentZh || content) : contentZh || content
  },
  /** Convert an arbitrary Traditional Chinese string (e.g. seeded hero lines). */
  convert: toSimplified,
}
