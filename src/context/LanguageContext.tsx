'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  type Language,
  translations,
  type T,
  isZh,
  nextLanguage,
  htmlLangFor,
} from '@/i18n/translations'

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

function isStoredLanguage(v: string | null | undefined): v is Language {
  return v === 'en' || v === 'zh' || v === 'zh-CN'
}

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  const nav = navigator.language?.toLowerCase() ?? ''
  // Simplified-script regions get zh-CN; every other Chinese locale keeps the
  // Traditional default (zh-Hant is the site's primary Chinese voice).
  if (/^(zh-cn|zh-sg|zh-my)/.test(nav)) return 'zh-CN'
  return /^(zh|yue)/.test(nav) ? 'zh' : 'en'
}

const SITE_SUFFIX: Record<Language, string> = {
  en: 'EaseCity',
  zh: 'EaseCity',
  'zh-CN': 'EaseCity',
}

// Per-page title segments (before " | EaseCity"), localized.
const PAGE_TITLES: Record<Language, Record<string, string>> = {
  en: {
    '/': 'EaseCity — Web services, system architecture & AI',
    '/services': 'Services | EaseCity',
    '/pricing': 'Pricing | EaseCity',
    '/download': 'Download | EaseCity',
    '/about': 'About | EaseCity',
    '/ec-share': 'EC-Share | EaseCity',
    '/blog': 'Blog | EaseCity',
    '/login': 'Sign in | EaseCity',
    '/register': 'Sign up | EaseCity',
    '/legal/privacy': 'Privacy Policy | EaseCity',
    '/legal/terms': 'Terms of Service | EaseCity',
  },
  zh: {
    '/': 'EaseCity — 網上服務、系統架構與 AI',
    '/services': '服務 | EaseCity',
    '/pricing': '方案價格 | EaseCity',
    '/download': '下載 | EaseCity',
    '/about': '關於我們 | EaseCity',
    '/ec-share': 'EC-Share | EaseCity',
    '/blog': '部落格 | EaseCity',
    '/login': '登入 | EaseCity',
    '/register': '註冊 | EaseCity',
    '/legal/privacy': '隱私權政策 | EaseCity',
    '/legal/terms': '服務條款 | EaseCity',
  },
  'zh-CN': {
    '/': 'EaseCity — 网上服务、系统架构与 AI',
    '/services': '服务 | EaseCity',
    '/pricing': '方案价格 | EaseCity',
    '/download': '下载 | EaseCity',
    '/about': '关于我们 | EaseCity',
    '/ec-share': 'EC-Share | EaseCity',
    '/blog': '博客 | EaseCity',
    '/login': '登录 | EaseCity',
    '/register': '注册 | EaseCity',
    '/legal/privacy': '隐私政策 | EaseCity',
    '/legal/terms': '服务条款 | EaseCity',
  },
}

function applyDocumentTitle(lang: Language, pathname: string) {
  if (typeof document === 'undefined') return
  // Match exact path, else fall back to a prefix match (e.g. /blog/[slug]).
  const map = PAGE_TITLES[lang]
  const title = map[pathname] ?? map[Object.keys(map).find((k) => k !== '/' && pathname.startsWith(k)) || '/']
  document.title = title ?? SITE_SUFFIX[lang]
  document.documentElement.lang = htmlLangFor(lang)
}

export function LanguageProvider({ children, initialLang }: LanguageProviderProps) {
  const pathname = usePathname()
  // The initial value is fully decided before first render on BOTH server and
  // client: server passes initialLang (from cookie); if the client has a stored
  // preference it's already in the same cookie, so we stay consistent.
  const [language, setLang] = useState<Language>(() => {
    if (isStoredLanguage(initialLang)) return initialLang
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (isStoredLanguage(stored)) return stored
      } catch {
        /* ignore */
      }
    }
    return detectBrowserLanguage()
  })

  useEffect(() => {
    applyDocumentTitle(language, pathname)
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
  }, [language, pathname])

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang)
  }, [])

  const toggleLanguage = useCallback(() => {
    setLang(nextLanguage)
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

/** Convenience: is the active language any Chinese variant. */
export function useIsZh(): boolean {
  const { language } = useLanguage()
  return isZh(language)
}
