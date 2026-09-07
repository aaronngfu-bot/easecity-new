// Verify the latest deployment on easecity.hk carries the newest chat changes:
// scripted replies (no OpenRouter), 15-min SLA copy, two-line notice.
const html = await (await fetch('https://easecity.hk/', { headers: { Cookie: 'easecity-lang=zh-CN' } })).text()
const chunks = [...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map(m => m[0])
console.log('chunks:', chunks.length)

const markers = {
  scriptedReply: 'EC-Share 是我们的 Windows 桌面应用',
  slaCopy: '15 分钟内有客服人员',
  twoLineNotice: '有 问题', // notice text with \n → may appear as separate string
  tagline: '在线 · 随时为你解答',
  noOpenRouter: true,
}

for (const c of chunks) {
  try {
    const t = await (await fetch('https://easecity.hk' + c)).text()
    const found = {
      sla: t.includes('15 分钟内有客服人员') || t.includes('15 分鐘內有客服人員'),
      tagline: t.includes('随时为你解答') || t.includes('隨時為你解答'),
      faqHide: t.includes('收起常见问题') || t.includes('收起常見問題'),
    }
    if (Object.values(found).some(Boolean)) console.log(c.split('/').pop(), JSON.stringify(found))
  } catch { /* skip */ }
}
console.log('done')
