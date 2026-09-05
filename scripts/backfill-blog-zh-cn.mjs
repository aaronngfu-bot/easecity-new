// One-shot backfill: derive zh-CN fields from the Traditional Chinese fields
// for every VlogPost that has zh content but no stored zh-CN yet.
// Run:  node scripts/backfill-blog-zh-cn.mjs
import { PrismaClient } from '@prisma/client'
import OpenCC from 'opencc-js'

const prisma = new PrismaClient()
const converter = OpenCC.Converter({ from: 'twp', to: 'cn' })

// Same financial-usage fix as src/lib/zh-cn.ts — keep both in sync.
const GLOSSARY = [
  ['帐', '账'],
  ['滑鼠', '鼠标'],
  ['螢幕', '屏幕'],
  ['影片', '视频'],
  ['部落格', '博客'],
  ['網誌', '博客'],
  ['軟體', '软件'],
  ['程式', '程序'],
  ['支援', '支持'],
  ['設定', '设置'],
  ['資料', '数据'],
  ['伺服器', '服务器'],
]

function toSimplified(text) {
  if (!text || !/[\u4e00-\u9fff]/.test(text)) return text
  let out = converter(text)
  for (const [from, to] of GLOSSARY) out = out.split(from).join(to)
  return out
}

const posts = await prisma.vlogPost.findMany()
let updated = 0
for (const p of posts) {
  const titleZhCn = p.title_zh ? toSimplified(p.title_zh) : null
  const excerptZhCn = p.excerpt_zh ? toSimplified(p.excerpt_zh) : null
  const contentZhCn = p.content_zh ? toSimplified(p.content_zh) : null
  if (!titleZhCn && !excerptZhCn && !contentZhCn) continue
  await prisma.vlogPost.update({
    where: { id: p.id },
    data: { title_zh_cn: titleZhCn, excerpt_zh_cn: excerptZhCn, content_zh_cn: contentZhCn },
  })
  updated++
  console.log(`✓ ${p.slug}`)
}
console.log(`\n${updated}/${posts.length} posts backfilled`)
await prisma.$disconnect()
