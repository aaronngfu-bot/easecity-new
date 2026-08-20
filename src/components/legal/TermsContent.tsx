'use client'

import { useLanguage } from '@/context/LanguageContext'
import { termsContent } from '@/lib/legal/terms-content'

export function TermsContent() {
  const { language } = useLanguage()
  const c = termsContent[language]

  return (
    <>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-bg-surface text-xs text-text-muted font-mono mb-6">
        {language === 'zh' ? '法律文件' : 'Legal'}
      </div>
      <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
        {language === 'zh' ? '服務條款' : 'Terms of Service'}
      </h1>
      <p className="text-text-muted text-sm">Last updated: {c.lastUpdated}</p>
      <div className="mt-6 rounded-xl border border-border bg-bg-surface p-4 text-sm text-text-secondary leading-relaxed">
        {c.intro.map((p, i) => <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>)}
      </div>

      <div className="mt-10 space-y-10 text-sm leading-relaxed">
        {c.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 font-display text-xl font-semibold text-text-primary">
              {section.title}
            </h2>
            {section.body?.map((p, i) => <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>)}
            {section.subsections && (
              <div className="mt-4 space-y-4">
                {section.subsections.map((sub) => (
                  <div key={sub.title}>
                    <h3 className="mb-2 font-semibold text-text-primary">{sub.title}</h3>
                    <ul className="list-disc space-y-1 pl-5">
                      {sub.body.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  )
}