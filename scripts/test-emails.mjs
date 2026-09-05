// Preview + live-send test for the redesigned contact emails.
//   node scripts/test-emails.mjs          → writes .tmp-email-preview/*.html, no send
//   node scripts/test-emails.mjs --send   → actually sends via Resend
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config({ path: '.env.local' })

const DO_SEND = process.argv.includes('--send')
const TO = process.env.CONTACT_EMAIL_TO
const FROM = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'

// Inline transpile-free re-implementation check: import the TS module is not
// possible directly, so replicate the two templates by importing via tsx-less
// require of the compiled shape — instead we rebuild through a tiny esbuild-
// free trick: read the source and eval the template functions in isolation is
// fragile, so this script calls the real API route logic through the built
// Next server is overkill. Simplest robust path: compile the one file on the
// fly with the TypeScript compiler API.

const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')
const src = fs.readFileSync('src/lib/email/send.ts', 'utf8')

const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

const mod = { exports: {} }
new Function('require', 'module', 'exports', js)(require, mod, mod.exports)
const { sendContactEmail } = mod.exports

const samples = [
  {
    language: 'en',
    name: 'Alex Cheung',
    email: 'alex@acme-demo.com',
    company: 'Acme Logistics',
    phone: '+852 9000 1234',
    subject: 'Web platform',
    message:
      'We need a customer portal with SSO, billing and a support hub for our HK/APAC team. Timeline is roughly Q4.\n\nSecond paragraph to check pre-wrap rendering.',
  },
  {
    language: 'zh',
    name: '張小明',
    email: ' alex@acme-demo.com'.trim(),
    company: '明達科技',
    phone: '',
    subject: '系統開發',
    message: '我們需要一個即時串流控制系統，桌面端控制多部 Android 裝置，請報價。',
  },
  {
    language: 'zh-CN',
    name: '李小红',
    email: ' alex@acme-demo.com'.trim(),
    company: '',
    phone: '+86 138 0000 0000',
    subject: 'UI/UX 設計',
    message: '需要一个完整的深浅色设计系统与组件库，移动端优先。',
  },
]

mkdirSync('.tmp-email-preview', { recursive: true })

if (!DO_SEND) {
  // Preview-only: render HTML by intercepting Resend. Rebuild the email HTML by
  // calling the module with a fake RESEND key would hit network — instead run
  // the templates directly by requiring the transpiled module and stubbing
  // Resend. The module reads RESEND_API_KEY at call time via getResend(), so we
  // set a dummy and stub the network layer through a Resend monkey-patch.
  process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dummy'
  let captured = []
  const Resend = require('resend').Resend
  const origSend = Resend.prototype.emails
  // Patch at the prototype: emails.send
  const RealResend = Resend
  // Simpler: intercept via global fetch
  const realFetch = globalThis.fetch
  globalThis.fetch = async (url, opts) => {
    if (String(url).includes('resend.com')) {
      const body = JSON.parse(opts.body)
      captured.push(body)
      return new Response(JSON.stringify({ data: { id: 'preview' }, error: null }), { status: 200 })
    }
    return realFetch(url, opts)
  }

  for (const [i, p] of samples.entries()) {
    captured = []
    await sendContactEmail(p)
    const [internal, confirm] = captured
    writeFileSync(`.tmp-email-preview/internal-${p.language}.html`, internal.html)
    writeFileSync(`.tmp-email-preview/confirm-${p.language}.html`, confirm.html)
    console.log(`✓ ${p.language}: internal subject="${internal.subject}" | confirm subject="${confirm.subject}" to=${confirm.to[0]}`)
  }
  globalThis.fetch = realFetch
  console.log('\nPreview files in .tmp-email-preview/ (open in a browser)')
} else {
  for (const p of samples) {
    await sendContactEmail(p)
    console.log(`✓ sent (${p.language}) → internal ${TO}, confirmation ${p.email}`)
  }
  console.log('\nCheck inboxes: internal at', TO, '— confirmation copy goes to the sample address (fake domain, will bounce silently).')
}
