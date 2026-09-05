// Check whether the PRODUCTION deployment contains the latest ChatWidget fix
// (min-h-0 + tagline) or is still serving an older bundle.
import { writeFileSync, unlinkSync } from 'node:fs'

async function grab(url, out) {
  const res = await fetch(url)
  const text = await res.text()
  if (out) writeFileSync(out, text)
  return { status: res.status, size: text.length }
}

async function main() {
  const home = await fetch('https://easecity.hk/', { headers: { Cookie: 'easecity-lang=zh-CN' } })
  const html = await home.text()
  const chunks = [...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map(m => m[0])
  console.log('chunk count:', chunks.length)

  const report = []
  for (const c of chunks) {
    try {
      const r = await fetch('https://easecity.hk' + c)
      const t = await r.text()
      const markers = {
        has280: t.includes('280px'),
        hasMinH0: t.includes('min-h-0 flex-1'),
        hasTagline: t.includes('Here to help with'),
        hasFaqHide: t.includes('收起常见问题') || t.includes('收起常見問題'),
      }
      if (Object.values(markers).some(Boolean)) report.push({ chunk: c.split('/').pop(), ...markers })
    } catch (e) { /* skip */ }
  }
  console.log(JSON.stringify(report, null, 2))
}
main()
