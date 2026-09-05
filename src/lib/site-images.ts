import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import type { Language } from '@/i18n/translations'

/**
 * The photographs and the app icon on the product and services pages, as a
 * fixed set of named slots an admin can replace.
 *
 * Each slot ships with the asset that is in `public/`, so the pages render the
 * same as they always have until someone uploads something. An override is one
 * row in `SiteSetting` keyed `image:<id>`, which is why this needs no schema
 * change: the table already exists and is already a string key-value store.
 *
 * Replacements are looked up per request through a tagged cache, and the tag is
 * revalidated when an admin saves, so a new photograph appears immediately
 * without making these pages dynamic.
 */

export const SITE_IMAGES_TAG = 'site-images'
const KEY_PREFIX = 'image:'
/** Language-scoped override keys: `image:<id>:en` / `image:<id>:zh`.
 *  zh-CN has no separate admin uploads — it falls back through zh. */
const LANG_SUFFIX: Record<'en' | 'zh', string> = { en: ':en', zh: ':zh' }

type Slot = {
  readonly id: string
  readonly label: string
  /**
   * Shipped asset, used until an admin replaces it. `null` for a placement that
   * has no photograph yet: the page composes the frame from type instead of
   * showing a borrowed image, and switches to the photograph on upload.
   */
  readonly fallback: string | null
  /** Every placement this slot feeds, so the admin screen can say so. */
  readonly usage: readonly string[]
  /** The frame the image is cropped to. Uploads should be composed for it. */
  readonly shape: string
}

export const SITE_IMAGE_SLOTS = [
  {
    id: 'ecShareAppIcon',
    label: 'EC-Share app icon',
    fallback: '/images/easecity-mark-512.png',
    usage: ['Product page, beside the headline'],
    shape: 'Square. Renders at 160px with rounded corners — upload at least 320×320px for retina.',
  },
  {
    id: 'ecShareHero',
    label: 'EC-Share hero',
    fallback: '/images/ec-share-product-hero.jpg',
    usage: ['Product page, wide plate under the headline'],
    // The plate's container is capped at 1360px wide (container-max's 1440px
    // minus its side padding) and never grows past that, however wide the
    // screen — so a source this size, or the 2x version, is never upscaled.
    shape:
      'Landscape. Renders at up to 1360×583px (21:9) on desktop, 4:3 on phones — upload at least 2720×1166px, subject centred, so it holds up at retina and both crops keep it in frame.',
  },
  {
    id: 'ecShareSceneDesk',
    label: 'Scene: one desk, eight live screens',
    // Used to reuse `ecShareHero`'s photograph here — the same shot backing
    // the headline plate and the services case study also stood in for this
    // scene, so replacing any one of the three silently changed the other
    // two. This is its own slot now: no photograph until an admin uploads
    // one for this scene specifically, same as the other not-yet-shot scenes
    // below.
    fallback: null,
    usage: ['Product page, scenes'],
    shape: 'Landscape, cropped to 16:9. One desk with every one of the eight mirrored screens visible at once.',
  },
  {
    id: 'ecShareSceneTogether',
    label: 'Scene: watching it together',
    fallback: null,
    usage: ['Product page, scenes'],
    shape: 'Portrait, cropped to 3:4. Two phones mirrored to one screen in a living room.',
  },
  {
    id: 'ecShareSceneQueue',
    label: 'Scene: the minute tickets go on sale',
    fallback: null,
    usage: ['Product page, scenes'],
    shape: 'Portrait, cropped to 3:4. Several phones queueing at once on one desk.',
  },
  {
    id: 'ecShareGalleryRemote',
    label: 'Scene: fixing a phone for family',
    fallback: '/images/ec-share-scene-remote-control.jpg',
    usage: ['Product page, scenes'],
    shape: 'Landscape, cropped to 16:9.',
  },
  {
    id: 'ecShareGalleryLab',
    label: 'Scene: a rack running regressions',
    fallback: '/images/ec-share-scene-qa-lab.jpg',
    usage: ['Product page, scenes'],
    shape: 'Landscape, cropped to 4:3.',
  },
  {
    id: 'ecShareSceneRoom',
    label: 'Scene: showing the room the real thing',
    fallback: null,
    usage: ['Product page, scenes'],
    shape: 'Landscape, cropped to 4:3. A live device screen shown to a meeting room.',
  },
  {
    id: 'servicesHero',
    label: 'Services hero',
    fallback: '/images/service-case-system-dev.jpg',
    usage: ['Services page, the band that closes the first screen'],
    shape: 'Landscape, very wide. It runs the full width of the viewport, so keep the subject centred.',
  },
  {
    id: 'servicesCaseEcShare',
    label: 'Services case: EC-Share',
    // Used to reuse `ecShareHero`'s photograph for this placement too, so
    // replacing either one silently changed the other. Same shot by default
    // (only the shipped fallback), independent slot from here on.
    fallback: '/images/ec-share-product-hero.jpg',
    usage: ['Services page, lead case study'],
    shape: 'Landscape, cropped to 4:3 — this case runs larger than the other two below.',
  },
  {
    id: 'servicesCaseWeb',
    label: 'Services case: web platform',
    fallback: '/images/service-case-web-platform.jpg',
    usage: ['Services page, second case study'],
    shape: 'Landscape, cropped to 16:9.',
  },
  {
    id: 'servicesCaseDesign',
    label: 'Services case: design system',
    fallback: '/images/service-case-ui-design.jpg',
    usage: ['Services page, third case study'],
    shape: 'Landscape, cropped to 16:9.',
  },
] as const satisfies readonly Slot[]

export type SiteImageId = (typeof SITE_IMAGE_SLOTS)[number]['id']

/**
 * Only the slots that ship without a photograph are nullable. A blanket
 * `string | null` would make every consumer prove a case that cannot happen for
 * the seven placements that do have an asset, and the noise would get silenced
 * with a non-null assertion, which is how the real null slips through later.
 */
type SlotFor<Id extends SiteImageId> = Extract<(typeof SITE_IMAGE_SLOTS)[number], { id: Id }>
export type SiteImages = {
  [K in SiteImageId]: SlotFor<K>['fallback'] extends string ? string : string | null
}

const SLOT_IDS = SITE_IMAGE_SLOTS.map((s) => s.id) as readonly SiteImageId[]

export function isSiteImageId(value: string): value is SiteImageId {
  return (SLOT_IDS as readonly string[]).includes(value)
}

/**
 * The SiteSetting key for one slot's base (EN) column. Takes `string` — both
 * call sites validate against `isSiteImageId` before reaching here.
 */
export function siteImageKey(id: string): string {
  return `${KEY_PREFIX}${id}`
}

/**
 * Only a local path or a Vercel Blob URL is renderable: `next/image` refuses any
 * host outside `next.config.mjs`'s `remotePatterns`, and a rejected host throws
 * during render rather than degrading. So this is checked on the way in and
 * again on the way out, because a bad row would otherwise take a page down.
 */
export function isRenderableImageSrc(value: string): boolean {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.blob.vercel-storage.com')
  } catch {
    return false
  }
}

export function defaultSiteImages(): SiteImages {
  return Object.fromEntries(SITE_IMAGE_SLOTS.map((s) => [s.id, s.fallback])) as SiteImages
}

/** True when the slot is showing something an admin uploaded. */
export function isReplaced(images: SiteImages, id: SiteImageId): boolean {
  const slot = SITE_IMAGE_SLOTS.find((s) => s.id === id)
  return !!slot && images[id] !== slot.fallback
}

/**
 * Language-scoped overrides, one map per language. The legacy un-suffixed key
 * (`image:<id>`) is read as the EN column so rows saved before per-language
 * images existed keep working — the shipped fallbacks were English-first.
 */
type Overrides = { en: Partial<SiteImages>; zh: Partial<SiteImages> }

async function readOverrides(): Promise<Overrides> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: KEY_PREFIX } },
  })

  const out: Overrides = { en: {}, zh: {} }
  for (const row of rows) {
    if (!row.value || !isRenderableImageSrc(row.value)) continue
    const rest = row.key.slice(KEY_PREFIX.length)
    // Language-scoped: `image:<id>:en` / `image:<id>:zh`.
    const suffixed = (['en', 'zh'] as const).find((lang) => rest.endsWith(LANG_SUFFIX[lang]))
    if (suffixed) {
      const id = rest.slice(0, -LANG_SUFFIX[suffixed].length)
      if (isSiteImageId(id)) out[suffixed][id] = row.value
      continue
    }
    // Legacy un-suffixed key → EN column.
    if (isSiteImageId(rest)) out.en[rest] = row.value
  }
  return out
}

/**
 * The failure path is deliberately outside the cache. Caching it would store the
 * fallbacks under the same key, and since the entry only expires on the tag, a
 * single unreachable database at build time would hide every upload until an
 * admin happened to save again. Letting the read throw leaves nothing cached, so
 * the next request tries the database again. The time bound is the same
 * reasoning applied to a stale entry that was written before a schema changed.
 */
const readOverridesCached = unstable_cache(readOverrides, ['site-images'], {
  tags: [SITE_IMAGES_TAG],
  revalidate: 3600,
})

export async function getSiteImages(lang: Language = 'en'): Promise<SiteImages> {
  try {
    const overrides = await readOverridesCached()
    // zh-CN shares the zh upload slots (admin only offers EN / 繁中).
    const base: 'en' | 'zh' = lang === 'en' ? 'en' : 'zh'
    const own = overrides[base]
    const other = overrides[base === 'en' ? 'zh' : 'en']
    // Per-language override first; when this language has none for a slot, the
    // OTHER language's override stands in (an image with baked-in copy beats
    // the shipped default showing the wrong language's copy); shipped asset
    // last.
    return { ...defaultSiteImages(), ...other, ...own }
  } catch {
    // No database at build time, or the query failed. The shipped assets are
    // always a correct answer, so the pages render either way.
    return defaultSiteImages()
  }
}
