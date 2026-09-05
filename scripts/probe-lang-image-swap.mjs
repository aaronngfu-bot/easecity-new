// Precise check: the ecShareHero image src must flip when toggling EN → 繁中.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

let chromium
try { chromium = require('playwright').chromium }
catch { chromium = (await import('playwright')).chromium }

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.context().addCookies([{ name: 'easecity-lang', value: 'en', url: BASE }])
await page.goto(BASE + '/ec-share', { waitUntil: 'networkidle' })
await page.waitForFunction(() => {
  const l = document.querySelector('button.fixed.bottom-6')
  return l && Object.keys(l).some(k => k.includes('react'))
}, { timeout: 60000 })
await page.waitForTimeout(2500)

const heroSrc = () => page.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')]
  const hero = imgs.find(i => decodeURIComponent(i.src).includes('1788614057276') || decodeURIComponent(i.src).includes('ec-share'))
  return imgs.map(i => decodeURIComponent(i.src).split('/').pop().slice(0, 50))
})

const en = await heroSrc()
console.log('EN images:', JSON.stringify(en, null, 1))

await page.evaluate(() => {
  const b = [...document.querySelectorAll('.pill-language-toggle button')].find(x => x.textContent.trim() === '繁中')
  b && b.click()
})
await page.waitForTimeout(3000)

const zh = await heroSrc()
console.log('ZH images:', JSON.stringify(zh, null, 1))
console.log('HERO SRC CHANGED:', JSON.stringify(en) !== JSON.stringify(zh))

await page.screenshot({ path: '.tmp-lang-swap.png' })
await browser.close()
