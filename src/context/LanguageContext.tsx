'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { type Language, translations, type T } from '@/i18n/translations'

interface LanguageContextValue {
  language: Language
  t: T
  toggleLanguage: () => void
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = 'easecity-lang'
const COOKIE_KEY = 'easecity-lang'

interface LanguageProviderProps {
  children: React.ReactNode
  /** Resolved server-side from the easecity-lang cookie so SSR and the first
   *  client render agree (prevents hydration mismatch on first paint). Falling
   *  back to the browser's preferred language only when no cookie exists. */
  initialLang?: Language
}

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const nav = navigator.language?.toLowerCase() ?? ''
  return /^(zh|yue|zh-hk|zh-tw|zh-mo|zh-cn)/.test(nav) ? 'zh' : 'en'
}

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  // The initial value is fully decided before first render on BOTH server and
  // client: server passes initialLang (from cookie); if the client has a stored
  // preference it's already in the same cookie, so we stay consistent.
  const [language, setLang] = useState<Language>(() => {
    if (initialLang === 'zh' || initialLang === 'en') return initialLang
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'en' || stored === 'zh') return stored
      } catch {
        /* ignore */
      }
    }
    return detectBrowserLanguage()
  })

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-HK' : 'en'
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {
      /* ignore */
    }
    try {
      document.cookie = `${COOKIE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`
    } catch {
      /* ignore */
    }
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'zh' : 'en'))
  }, [])

  return (
    <LanguageContext.Provider
      value={{ language, t: translations[language], toggleLanguage, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}