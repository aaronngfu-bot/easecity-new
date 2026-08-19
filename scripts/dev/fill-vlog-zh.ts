/**
 * One-off seed: fill Chinese content for existing vlog posts and add several
 * new bilingual posts. Run with:
 *   set -a && . ./.env.local && set +a && npx tsx scripts/fill-vlog-zh.ts
 * Idempotent — upserts by slug. Only adds/mutates zh fields; never deletes.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// slug -> { title, title_zh, excerpt_zh, content_zh }
const posts: Record<
  string,
  { title_zh: string; excerpt_zh?: string; content_zh: string }
> = {
  'brand-refresh-and-transparent-mark': {
    title_zh: '品牌重塑與透明標記',
    excerpt_zh: '推出全新交疊的品牌標記、透明 favicon 組，以及全站統一的深淺色主題。',
    content_zh: `## 我們做了甚麼

- 以「E+C」交疊的方式推出全新品牌標記
- 建立透明 favicon 系列，支援深淺色主題
- 統一全站的深淺色 theme token 系統

品牌不只是好看——它們是內部一致性的基石。這次重塑讓我們能把設計語言乾淨地帶到產品、服務和文檔中。`,
  },
  'web-services-and-platforms': {
    title_zh: '網上服務與平台',
    excerpt_zh: '我們如何打造生產級的網頁平台——從儀表板、登入到帳單和文檔。',
    content_zh: `## 我們建立甚麼

我們建造生產級網上平台能力，支援整個產品生命週期：

- 儀表板與管理介面
- 使用者身份驗證與權限
- 計費與訂閱管理
- 產品文檔

每一個平台都由單一團隊交付，從架構到最終發佈。`,
  },
  'system-architecture-and-ai': {
    title_zh: '系統架構與 AI',
    excerpt_zh: '低延遲基礎設施、即時控制，以及建於其上的 AI 層。',
    content_zh: `## 我們的立足點

當延遲重要時，架構就是產品。我們專注於：

- 低延遲、即時控制的基礎設施
- 為既有的系統加入 AI 層
- 協助深度整合，而非貼附在表面的解決方案`,
  },
}

async function main() {
  const existing = await prisma.vlogPost.findMany()
  let updated = 0
  let created = 0

  for (const p of existing) {
    const data = posts[p.slug]
    if (!data) continue
    await prisma.vlogPost.update({
      where: { id: p.id },
      data: {
        title_zh: data.title_zh,
        excerpt_zh: data.excerpt_zh ?? null,
        content_zh: data.content_zh,
      },
    })
    updated++
  }

  // New bilingual posts (2026-06 -> latest at 2026-08 handled by the 3 above).
  const newer = [
    {
      slug: 'ec-share-android-control-room',
      title: 'EC-Share: a team Android control room',
      title_zh: 'EC-Share——團隊級 Android 控制中心',
      excerpt_zh: '讓一台 Windows 電腦成為團隊級的 Android 控制室：多裝置鏡像、鍵盤滑鼠操作、即時畫面分享。',
      content: `## What shipped\n\nEC-Share turns a Windows machine into a team-ready Android control room.\n\n- Mirror multiple Android devices at once\n- Operate any one with keyboard and mouse\n- Share live screens with your team over LAN or VPN\n\nTry the free 14-day trial, or reach out for the enterprise tier.`,
      content_zh: `## 我們推出了甚麼

EC-Share 把一台 Windows 電腦變成團隊級的 Android 控制中心。

- 一次鏡像多台 Android 裝置
- 用鍵盤滑鼠精準操作任一台
- 透過 LAN 或 VPN 與團隊即時分享畫面

可免費試用 14 天；企業版請聯絡我們。`,
    },
    {
      slug: 'bilingual-site-launch',
      title: 'Bilingual site launch',
      title_zh: '中英雙語網站上線',
      excerpt_zh: '整站支援繁體中文與英文，首次載入即依你的語言偏好顯示。',
      content: `## What shipped

The site now ships in both English and Traditional Chinese.\n\n- First-load language follows your browser preference\n- Live updates (VLOG) are written in both languages\n- A running log of what we've been building`,
      content_zh: `## 我們做了甚麼

網站現在支援繁體中文與英文兩種語言。

- 首次載入即依你瀏覽器的語言偏好顯示
- 動態（VLOG）貼文英中各一篇
- 記錄我們一直在做的事情`,
    },
  ]

  for (const p of newer) {
    const slugExists = await prisma.vlogPost.findUnique({ where: { slug: p.slug } })
    if (slugExists) continue
    await prisma.vlogPost.create({
      data: {
        slug: p.slug,
        title: p.title,
        title_zh: p.title_zh,
        excerpt_zh: p.excerpt_zh ?? null,
        content: p.content,
        content_zh: p.content_zh,
        published: true,
        publishedAt: new Date('2026-07-10T00:00:00Z'),
      },
    })
    created++
  }

  console.log(`✅ Updated ${updated} existing posts, created ${created} new bilingual posts.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })