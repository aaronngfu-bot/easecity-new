import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const outDir = path.join(root, 'public/hero')
await mkdir(outDir, { recursive: true })

const jobs = [
  { src: 'hk-skyline-dark.png', widths: [1280, 1920] },
  { src: 'hk-skyline-light.png', widths: [1280, 1920] },
]

for (const job of jobs) {
  const input = path.join(outDir, job.src)
  const stem = job.src.replace(/\.png$/, '')
  for (const width of job.widths) {
    const dest = path.join(outDir, `${stem}-${width}.webp`)
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(dest)
    const info = await sharp(dest).metadata()
    console.log(`${path.basename(dest)} ${info.size}B ${info.width}x${info.height}`)
  }
}
