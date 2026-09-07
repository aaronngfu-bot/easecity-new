// End-to-end on PRODUCTION: scripted chat answers in the right language +
// escalation flow. Read-only except the chat API calls (no support session
// creation — that would email the team; keep this to the AI path).
const BASE = 'https://easecity.hk'

// 1. scripted reply API — site language zh-CN, English question → 简体 answer
const r1 = await fetch(BASE + '/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'zh-CN', messages: [{ role: 'user', content: 'how much does it cost?' }] }),
})
const j1 = await r1.json()
console.log('1. zh-CN reply to EN question:', r1.status, '→', j1.content.slice(0, 40))

// 2. EN site language
const r2 = await fetch(BASE + '/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'en', messages: [{ role: 'user', content: '價格是多少？' }] }),
})
const j2 = await r2.json()
console.log('2. en reply to zh question:', r2.status, '→', j2.content.slice(0, 40))

// 3. unsupported question → localized fallback
const r3 = await fetch(BASE + '/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ language: 'zh', messages: [{ role: 'user', content: '今天天氣如何？' }] }),
})
const j3 = await r3.json()
console.log('3. fallback zh:', r3.status, '→', j3.content.slice(0, 30))

// 4. confirm no OpenRouter calls are possible anymore (no key needed)
const r4 = await fetch(BASE + '/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
})
console.log('4. no-language request:', r4.status, '→', (await r4.json()).content.slice(0, 30))
