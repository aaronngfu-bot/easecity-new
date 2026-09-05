// One real send through Resend: internal notification + visitor confirmation,
// both landing in CONTACT_EMAIL_TO so the whole flow is inspectable in one inbox.
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
require('dotenv').config({ path: '.env.local' })

const ts = require('typescript')
const fs = require('node:fs')
const src = fs.readFileSync('src/lib/email/send.ts', 'utf8')
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const mod = { exports: {} }
new Function('require', 'module', 'exports', js)(require, mod, mod.exports)

const to = process.env.CONTACT_EMAIL_TO
await mod.exports.sendContactEmail({
  language: 'zh',
  name: '張小明（測試）',
  email: to, // confirmation copy also lands here so both emails are visible
  company: '明達科技',
  phone: '+852 9000 1234',
  subject: '系統開發',
  message: '我們需要一個即時串流控制系統，桌面端控制多部 Android 裝置，請報價。\n\n（此為 email 模板測試）',
})
console.log('sent: internal + confirmation →', to)
