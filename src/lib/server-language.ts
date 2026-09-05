import { cookies } from 'next/headers'
import type { Language } from '@/i18n/translations'

/**
 * The visitor's language on the server, from the cookie LanguageContext writes
 * on every switch. Falls back to EN — the same default the provider uses when
 * no preference exists.
 */
export async function getServerLanguage(): Promise<Language> {
  const store = await cookies()
  const v = store.get('easecity-lang')?.value
  return v === 'zh' || v === 'zh-CN' ? v : 'en'
}
