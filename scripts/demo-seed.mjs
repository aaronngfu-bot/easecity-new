/**
 * Demo seed for the commerce suite (dev only): creates quotes in various
 * states (draft / sent / confirmed / signed / paid) plus a receipt, so the
 * admin pages, customer pages and PDFs have something realistic to show.
 * Prints every magic-link URL. Run: node scripts/demo-seed.mjs
 */
import fs from 'node:fs'
import { randomBytes } from 'node:crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE = 'http://localhost:3000'
const token = () => randomBytes(24).toString('base64url')
const days = (n) => new Date(Date.now() + n * 864e5)

try {
  const admin = await prisma.user.findFirst({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
    orderBy: { createdAt: 'asc' },
  })

  // 1. DRAFT — 內部準備中，未發送
  const draft = await prisma.quote.create({
    data: {
      number: 'EC-QUO-2026-9001',
      clientName: '恆達科技有限公司',
      clientEmail: 'demo-draft@easecity.hk',
      clientPhone: '+852 9123 4567',
      language: 'zh',
      status: 'draft',
      currency: 'hkd',
      notes: '含三個月免費維護。付款條款：50% 訂金，交付後尾數 30 日。',
      validUntil: days(21),
      quoteToken: token(),
      items: JSON.stringify([
        { description: '網上預約系統開發（含會員、通知）', qty: 1, unitPrice: 12800000 },
        { description: 'UI/UX 設計（移動端優先）', qty: 1, unitPrice: 3600000 },
        { description: '雲端部署 + 監察（一年）', qty: 12, unitPrice: 48000 },
      ]),
    },
  })

  // 2. SENT — 已電郵客戶（附 blank-signature PDF），等待回覆
  const sent = await prisma.quote.create({
    data: {
      number: 'EC-QUO-2026-9002',
      clientName: 'Kelvin Wong',
      clientEmail: 'demo-sent@easecity.hk',
      language: 'en',
      status: 'sent',
      currency: 'usd',
      notes: 'Scope covers discovery, weekly demos, and handover documentation.',
      validUntil: days(14),
      quoteToken: token(),
      items: JSON.stringify([
        { description: 'Realtime analytics dashboard (web)', qty: 1, unitPrice: 1450000 },
        { description: 'API integration (Stripe + Slack)', qty: 2, unitPrice: 320000 },
        { description: 'Support retainer (per month)', qty: 3, unitPrice: 95000 },
      ]),
    },
  })

  // 3. SENT + SIGNED — 客戶已線上手繪簽署（demo 簽名 PNG：scripts/demo-signature.png）
  const signaturePng = 'data:image/png;base64,' + fs.readFileSync(new URL('./demo-signature.png', import.meta.url)).toString('base64')

  const signed = await prisma.quote.create({
    data: {
      number: 'EC-QUO-2026-9003',
      clientName: '陳美琪（Bloomy HK）',
      clientEmail: 'demo-signed@easecity.hk',
      language: 'zh',
      status: 'confirmed',
      currency: 'hkd',
      notes: '確認後一週內開始，里程碑付款。',
      validUntil: days(30),
      quoteToken: token(),
      signedAt: new Date(),
      signerName: '陳美琪',
      signaturePng: signaturePng,
      confirmedAt: new Date(),
      items: JSON.stringify([
        { description: '品牌官網重建（雙語 + CMS）', qty: 1, unitPrice: 8800000 },
        { description: '攝影指導 + 圖片後製', qty: 1, unitPrice: 1500000 },
      ]),
    },
  })
  const order3 = await prisma.order.create({
    data: {
      userId: admin.id,
      status: 'pending_payment',
      amount: 10300000,
      currency: 'hkd',
      items: '[]',
      metadata: JSON.stringify({ quoteId: signed.id, quoteNumber: signed.number, source: 'quote' }),
      quoteId: signed.id,
    },
  })

  // 4. PAID — Stripe 已付（模擬 webhook 結果）+ 自動收據
  const paid = await prisma.quote.create({
    data: {
      number: 'EC-QUO-2026-9004',
      clientName: 'Northwind Studio Ltd',
      clientEmail: 'demo-paid@easecity.hk',
      language: 'en',
      status: 'paid',
      currency: 'usd',
      validUntil: days(7),
      quoteToken: token(),
      signedAt: new Date(Date.now() - 864e5),
      signerName: 'J. Lau',
      signaturePng: signaturePng,
      confirmedAt: new Date(Date.now() - 864e5),
      stripeSessionId: 'cs_demo_9004',
      items: JSON.stringify([
        { description: 'EC-Share Business — 10 seats (annual)', qty: 1, unitPrice: 490000 },
        { description: 'Onboarding & training (remote)', qty: 2, unitPrice: 75000 },
      ]),
    },
  })
  const order4 = await prisma.order.create({
    data: {
      userId: admin.id,
      status: 'paid',
      amount: 640000,
      currency: 'usd',
      items: '[]',
      stripeSessionId: 'cs_demo_9004',
      stripePaymentIntentId: 'pi_demo_9004',
      metadata: JSON.stringify({ quoteId: paid.id, quoteNumber: paid.number, source: 'quote' }),
      quoteId: paid.id,
    },
  })
  const receipt = await prisma.receipt.create({
    data: {
      number: 'EC-REC-2026-9001',
      orderId: order4.id,
      quoteId: paid.id,
      clientName: paid.clientName,
      clientEmail: paid.clientEmail,
      amount: 640000,
      currency: 'usd',
      source: 'stripe',
      accessToken: token(),
      meta: JSON.stringify({ stripeSessionId: 'cs_demo_9004', paymentIntentId: 'pi_demo_9004' }),
    },
  })

  console.log(`
=== DEMO SEEDED ===

1) DRAFT      內部準備中（未發送）
   Admin:     ${BASE}/admin/quotes/${draft.id}

2) SENT       已發送客戶（Kelvin Wong, USD）
   Admin:     ${BASE}/admin/quotes/${sent.id}
   客戶頁:    ${BASE}/quote/${sent.id}?token=${sent.quoteToken}
   PDF:       ${BASE}/api/quote/${sent.id}/pdf?token=${sent.quoteToken}

3) SIGNED     已線上簽署（陳美琪）→ Order pending_payment
   Admin:     ${BASE}/admin/quotes/${signed.id}
   客戶頁:    ${BASE}/quote/${signed.id}?token=${signed.quoteToken}
   已簽 PDF:  ${BASE}/api/quote/${signed.id}/pdf?token=${signed.quoteToken}

4) PAID       Stripe 已付 → 自動收據 ${receipt.number}
   Admin:     ${BASE}/admin/receipts
   收據頁:    ${BASE}/receipt/${receipt.id}?token=${receipt.accessToken}
   收據 PDF:  ${BASE}/api/receipt/${receipt.id}/pdf?token=${receipt.accessToken}
   報價頁:    ${BASE}/quote/${paid.id}?token=${paid.quoteToken}

後台列表:     ${BASE}/admin/quotes · ${BASE}/admin/receipts
（admin 登入後才可開；客戶頁/收據頁唔使登入）`)
} finally {
  await prisma.$disconnect()
}
