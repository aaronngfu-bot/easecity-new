// Local verification of the FAQ-tray fix: 4 long AI answers, then check the
// last chip stays fully visible above the input (no clipping).
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

let chromium
try { chromium = require('playwright').chromium }
catch { chromium = (await import('playwright')).chromium }

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.waitForTimeout(6000)
// hydration is slow on dev — wait for React to attach before any interaction
await page.waitForFunction(() => {
  const l = document.querySelector('button.fixed.bottom-6')
  return l && Object.keys(l).some(k => k.includes('react'))
}, { timeout: 60000 })

await page.click('button.fixed.bottom-6').catch(() => {})
await page.waitForTimeout(2500)

const questions = [
  '請詳細介紹你們所有的服務，包括每一項的內容、流程和交付時間',
  '那你們的定價模式和付款方式是怎樣的？可以講詳細一點嗎',
  'EC-Share 的技術架構是怎樣的？延遲有多低？支援幾多部裝置？',
  '專案的一般流程是怎樣的？每個階段要做什麼？需要我提供什麼？',
]
const input = page.locator('form input.glass-input').first()
for (const q of questions) {
  await input.fill(q)
  await input.press('Enter')
  await page.waitForTimeout(16000)
}

const g = await page.evaluate(() => {
  const panels = [...document.querySelectorAll('div')].filter(d =>
    typeof d.className === 'string' && d.className.includes('glass-panel') && d.offsetHeight > 200
  )
  const panel = panels[panels.length - 1]
  const form = panel.querySelector('form')
  const formTop = form.getBoundingClientRect().top
  const lastChip = [...panel.querySelectorAll('button.rounded-full')].pop()
  const chipWrap = lastChip?.parentElement
  return {
    panelH: Math.round(panel.getBoundingClientRect().height),
    inputTop: Math.round(formTop),
    lastChipBottom: lastChip ? Math.round(lastChip.getBoundingClientRect().bottom) : null,
    lastChipVisible: lastChip ? lastChip.getBoundingClientRect().bottom <= formTop + 1 : null,
    chipWrapScrolls: chipWrap ? chipWrap.scrollHeight > chipWrap.clientHeight : null,
    chipWrapH: chipWrap ? Math.round(chipWrap.getBoundingClientRect().height) : null,
  }
})
console.log(JSON.stringify(g, null, 2))
await page.screenshot({ path: '.tmp-local-chat-fixed.png' })
await browser.close()
