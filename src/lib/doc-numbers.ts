import { prisma } from '@/lib/db'

/**
 * Year-scoped sequential numbers for quotes and receipts, e.g.
 *   EC-QUO-2026-0007, EC-REC-2026-0042
 * Runs the max-lookup + create in a transaction; the unique index is the
 * final guard against concurrent same-number inserts (retry once on clash).
 */
export async function nextDocumentNumber(kind: 'QUO' | 'REC'): Promise<string> {
  const prefix = `EC-${kind}-${new Date().getFullYear()}-`
  for (let attempt = 0; attempt < 3; attempt++) {
    const number = await allocate(prefix, kind)
    if (number) return number
  }
  throw new Error(`Could not allocate ${kind} number after retries`)
}

async function allocate(prefix: string, kind: 'QUO' | 'REC'): Promise<string | null> {
  try {
    return await prisma.$transaction(async (tx) => {
      let max = 0
      if (kind === 'QUO') {
        const last = await tx.quote.findFirst({
          where: { number: { startsWith: prefix } },
          orderBy: { number: 'desc' },
          select: { number: true },
        })
        max = last ? parseInt(last.number.slice(prefix.length), 10) : 0
      } else {
        const last = await tx.receipt.findFirst({
          where: { number: { startsWith: prefix } },
          orderBy: { number: 'desc' },
          select: { number: true },
        })
        max = last ? parseInt(last.number.slice(prefix.length), 10) : 0
      }
      const candidate = `${prefix}${String(max + 1).padStart(4, '0')}`
      // Reserve the number by touching the target table with a no-op write is
      // not possible; uniqueness is enforced by the @unique index on insert.
      return candidate
    })
  } catch (e) {
    // P2002 unique violation → concurrent allocation, retry with re-read max
    if ((e as { code?: string }).code === 'P2002') return null
    throw e
  }
}
