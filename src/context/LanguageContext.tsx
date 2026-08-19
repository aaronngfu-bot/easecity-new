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

function initialLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh') return stored
  } catch {
    /* localStorage unavailable */
  }
  const nav = navigator.language?.toLowerCase() ?? ''
  return /^(zh|yue|zh-hk|zh-tw|zh-mo|zh-cn)/.test(nav) ? 'zh' : 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-HK' : 'en'
    localStorage.setItem(STORAGE_KEY, language)
    try {
      document.cookie = `${COOKIE_KEY}=${language}; path=/; max-age=31536000; samesite=lax`
    } catch {
      /* cookie unavailable */
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
