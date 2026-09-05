'use client'

import { useLanguage } from '@/context/LanguageContext'
import { isZh } from '@/i18n/translations'

/**
 * Blog list page header. Reads the current language from useLanguage so the
 * title/subtitle switch immediately on language toggle (the surrounding page is
 * a server component, which would otherwise stay frozen on the server-rendered
 * language).
 */
export function BlogPageHeader() {
  const { language } = useLanguage()
  const zh = isZh(language)
  return (
    <>
      <p className="label-mono mb-3 text-[var(--signal)]">{zh ? (language === 'zh-CN' ? '博客' : '部落格') : 'BLOG'}</p>
      <h1 className="type-section font-display text-4xl font-bold text-[var(--text-primary)] md:text-5xl">
        {zh ? (language === 'zh-CN' ? '我们一直在构建的事' : '我們一直在建構的事') : "What we've been building"}
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
        {zh ? (language === 'zh-CN' ? '近期工作、发布与产品记录的可搜索日志。' : '近期工作、發佈與產品紀錄的可搜尋日誌。') : 'A searchable log of recent work, releases, and product notes.'}
      </p>
    </>
  )
}