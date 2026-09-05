// The FAQ tray is a fixed block; when the messages area can't shrink enough
// the tray is PARTIALLY clipped by the panel's overflow-hidden (last chip row
// half-visible). Fix: give the tray a max-height + internal scroll so it can
// NEVER be clipped — instead it scrolls within its own bounded area.
// This script measures the tray height needed vs available.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

let chromium
try { chromium = require('playwright').chromium }
catch { chromium = (await import('playwright')).chromium }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('https://easecity.hk/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)

await page.click('button.fixed[aria-label*="對話"], button.fixed[aria-label*="chat"], button.fixed[aria-label*="Open"], button.fixed.bottom-6').catch(() => {})
await page.waitForTimeout(1500)

const questions = [
  '請詳細介紹你們所有的服務，包括每一項的內容、流程和交付時間',
  '那你們的定價模式和付款方式是怎樣的？可以講詳細一點嗎',
  'EC-Share 的技術架構是怎樣的？延遲有多低？支援幾多部裝置？',
  '專案的一般流程是怎樣的？每個階段要做什麼？需要我提供什麼？',
]
const input = page.locator('.glass-input').first()
for (const q of questions) {
  await input.fill(q)
  await input.press('Enter')
  await page.waitForTimeout(14000)
}

function findTray(panel) {
  const header = [...panel.querySelectorAll('p')].find(p => /COMMON QUESTIONS|常见问题|常見問題/.test(p.textContent))
  if (!header) return null
  // header p → header row div → tray motion.div
  let el = header
  for (let i = 0; i < 2 && el; i++) el = el.parentElement
  return el
}

const g = await page.evaluate(() => {
  const panels = [...document.querySelectorAll('div')].filter(d =>
    typeof d.className === 'string' && d.className.includes('glass-panel') && d.offsetHeight > 200
  )
  const panel = panels[panels.length - 1]
  const form = panel.querySelector('form')
  const formTop = form.getBoundingClientRect().top
  const header = [...panel.querySelectorAll('p')].find(p => /COMMON QUESTIONS|常见问题|常見問題/.test(p.textContent))
  let tray = header
  for (let i = 0; i < 2 && tray; i++) tray = tray.parentElement
  const trayRect = tray?.getBoundingClientRect()
  const lastChip = [...panel.querySelectorAll('button.rounded-full')].pop()
  return {
    panelBottom: Math.round(panel.getBoundingClientRect().bottom),
    formTop: Math.round(formTop),
    trayTop: trayRect ? Math.round(trayRect.top) : null,
    trayBottom: trayRect ? Math.round(trayRect.bottom) : null,
    trayHeight: trayRect ? Math.round(trayRect.height) : null,
    trayFullHeight: tray ? tray.scrollHeight : null,
    trayClippedByForm: trayRect ? trayRect.bottom > formTop + 1 : null,
    lastChipBottom: lastChip ? Math.round(lastChip.getBoundingClientRect().bottom) : null,
    lastChipVisible: lastChip ? lastChip.getBoundingClientRect().bottom <= formTop + 1 : null,
  }
})
console.log(JSON.stringify(g, null, 2))
await browser.close()
