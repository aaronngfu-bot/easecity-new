/**
 * Dev smoke probe for the support flow (run: node scripts/support-flow-smoke.mjs)
 * Needs the dev server on :3000. Creates two sessions, exercises the agent
 * console API end-to-end (queue tokens, typing pings, reply, close), then
 * deletes the test sessions. Prints PASS/FAIL lines; exit 1 on any failure.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import { PrismaClient } from '@prisma/client'

const BASE = process.env.SMOKE_BASE || 'http://localhost:3000'

const env = fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const envGet = (k) => {
  const m = env.match(new RegExp(`^${k}=(.*)$`, 'm'))
  return m ? m[1].replace(/^"|"$/g, '') : ''
}
const SECRET = envGet('SUPPORT_MAGIC_SECRET') || envGet('NEXTAUTH_SECRET') || 'easecity-support-dev-secret'

const signAgentToken = (sessionId) => {
  const exp = (Date.now() + 1000 * 60 * 60 * 24 * 7).toString(16)
  const sig = crypto.createHmac('sha256', SECRET).update(`${sessionId}.${exp}`).digest('hex')
  return `${exp}.${sig}`
}

const prisma = new PrismaClient()
let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) failures++
}

try {
  const mk = (name) =>
    prisma.supportSession.create({
      data: {
        visitorToken: crypto.randomBytes(18).toString('base64url'),
        name, language: 'zh', status: 'waiting',
        messages: { create: { role: 'visitor', content: '測試：想了解 EC-Share 商業版。' } },
      },
    })
  const A = await mk('SmokeVisitor-A')
  const B = await mk('SmokeVisitor-B')

  // 1. Agent list: entries must carry their OWN signed token.
  const listRes = await fetch(`${BASE}/api/support/agent?session=${A.id}&token=${signAgentToken(A.id)}&list=1`)
  const list = await listRes.json()
  check('list 200', listRes.ok && list.success)
  const entries = list.data?.sessions || []
  const aEntry = entries.find((s) => s.id === A.id)
  const bEntry = entries.find((s) => s.id === B.id)
  check('queue entries have tokens', !!aEntry?.token && !!bEntry?.token)

  // 2. THE FIX: token minted for B opens B (old code reused A's token → 401).
  const openB = await fetch(`${BASE}/api/support/agent?session=${B.id}&token=${encodeURIComponent(bEntry.token)}`)
  const openBJson = await openB.json()
  check('queue token opens its own session', openB.ok && openBJson.success, `status ${openB.status}`)

  // 3. Old-style cross-token use must still 401 (A's token cannot open B).
  const cross = await fetch(`${BASE}/api/support/agent?session=${B.id}&token=${encodeURIComponent(signAgentToken(A.id))}`)
  check('cross-session token rejected', cross.status === 401, `status ${cross.status}`)

  // 4. Visitor typing ping via agent PATCH → visible on agent GET.
  await fetch(`${BASE}/api/support/agent`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: A.id, token: signAgentToken(A.id), side: 'visitor', typing: true }),
  })
  const aGet = await (await fetch(`${BASE}/api/support/agent?session=${A.id}&token=${signAgentToken(A.id)}`)).json()
  check('visitorTyping visible to agent', aGet.data?.visitorTyping === true)

  // 5. Visitor POST clears their typing flag and appends a message.
  await fetch(`${BASE}/api/support/messages`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: A.visitorToken, content: '再補充一點：需要桌對桌分享。' }),
  })
  const aGet2 = await (await fetch(`${BASE}/api/support/agent?session=${A.id}&token=${signAgentToken(A.id)}`)).json()
  check('visitor POST clears visitorTyping', aGet2.data?.visitorTyping === false)
  check('visitor message reached agent', aGet2.data?.messages.some((m) => m.content.includes('桌對桌')))

  // 6. Agent typing ping via agent PATCH (side:'agent') → visible to visitor.
  await fetch(`${BASE}/api/support/agent`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: A.id, token: signAgentToken(A.id), side: 'agent', typing: true }),
  })
  const vGet = await (await fetch(`${BASE}/api/support/messages?token=${A.visitorToken}`)).json()
  check('agentTyping visible to visitor', vGet.data?.agentTyping === true)

  // 7. Agent reply clears agent typing flag and reaches the visitor.
  await fetch(`${BASE}/api/support/agent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: A.id, token: signAgentToken(A.id), content: '你好！商業版可以為你示範。' }),
  })
  const vGet2 = await (await fetch(`${BASE}/api/support/messages?token=${A.visitorToken}`)).json()
  check('agent reply reaches visitor', vGet2.data?.messages.some((m) => m.role === 'agent' && m.content.includes('示範')))
  check('agent POST clears agentTyping', vGet2.data?.agentTyping === false)

  // 8. Cleanup: close both sessions.
  for (const s of [A, B]) {
    const del = await fetch(`${BASE}/api/support/agent?session=${s.id}&token=${signAgentToken(s.id)}`, { method: 'DELETE' })
    check(`cleanup close ${s.id.slice(-6)}`, del.ok)
  }
} finally {
  await prisma.$disconnect()
}
console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
