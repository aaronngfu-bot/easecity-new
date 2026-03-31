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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLang] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored === 'en' || stored === 'zh') {
      setLang(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-HK' : 'en'
    localStorage.setItem(STORAGE_KEY, language)
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
