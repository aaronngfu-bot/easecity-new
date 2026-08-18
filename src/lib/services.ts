/**
 * Service catalog — one entry per service with a stable slug, icon, and
 * per-service detail bullets (bilingual). The `/services/[slug]` route and
 * the services grid both read from here, so slugs and copy stay in one place.
 */

export interface ServiceDetail {
  slug: string
  icon: string
  titleKey: string // key into t.servicesPage
  bodyKey: string
  tags: string[]
  bullets: { en: string[]; zh: string[] }
  subject: { en: string; zh: string } // prefilled contact subject
}

export const services: ServiceDetail[] = [
  {
    slug: 'system-development',
    icon: 'code',
    titleKey: 's1Title',
    bodyKey: 's1Body',
    tags: ['C++', 'Flutter', 'Next.js', 'Node.js'],
    bullets: {
      en: [
        'Real-time, low-latency systems and control infrastructure',
        'Desktop, CLI, and backend services engineered for reliability',
        'Licensing, device management, and streaming pipelines',
        'Observability and fault-tolerance built in from day one',
      ],
      zh: [
        '即時、低延遲的系統與控制基礎設施',
        '為可靠性而設計的桌面、CLI 與後端服務',
        '授權、裝置管理與串流管線',
        '從第一天起內建可觀測性與容錯',
      ],
    },
    subject: { en: 'System development', zh: '系統開發' },
  },
  {
    slug: 'web-platforms',
    icon: 'web',
    titleKey: 's2Title',
    bodyKey: 's2Body',
    tags: ['Next.js', 'Prisma', 'Stripe', 'Vercel'],
    bullets: {
      en: [
        'Full-stack platforms: dashboards, admin, and portals',
        'Auth, billing, email, and rate-limiting wired in',
        'Documentation and support hubs that stay current',
        'Performance and SEO from the first build',
      ],
      zh: [
        '全端平台：儀表板、後台與入口',
        '接好驗證、帳單、郵件與限流',
        '持續更新的文件與支援中心',
        '從首次建置就兼顧效能與 SEO',
      ],
    },
    subject: { en: 'Web platform', zh: '網頁平台' },
  },
  {
    slug: 'ui-ux-design',
    icon: 'design',
    titleKey: 's3Title',
    bodyKey: 's3Body',
    tags: ['Figma', 'Tailwind', 'Design Systems'],
    bullets: {
      en: [
        'Dark/light theme systems with a single source of truth',
        'Component libraries that scale across products',
        'Interaction design for desktop, web, and mobile',
        'Accessibility and motion discipline',
      ],
      zh: [
        '單一來源的深淺色主題系統',
        '可跨產品擴展的元件庫',
        '桌面、網頁與行動的互動設計',
        '無障礙與動效紀律',
      ],
    },
    subject: { en: 'UI/UX design', zh: 'UI/UX 設計' },
  },
  {
    slug: 'consulting',
    icon: 'consult',
    titleKey: 's4Title',
    bodyKey: 's4Body',
    tags: ['Architecture', 'Performance', 'Process'],
    bullets: {
      en: [
        'Architecture review and technical due diligence',
        'Performance audits with actionable findings',
        'Team workflow and delivery-process optimization',
        'Fractional CTO-level guidance when needed',
      ],
      zh: [
        '架構審查與技術盡職調查',
        '具可執行建議的效能稽核',
        '團隊工作流程與交付流程優化',
        '需要時提供技術長層級的指導',
      ],
    },
    subject: { en: 'Consulting', zh: '諮詢服務' },
  },
  {
    slug: 'advertising',
    icon: 'ad',
    titleKey: 's5Title',
    bodyKey: 's5Body',
    tags: ['Google Ads', 'Meta', 'SEO'],
    bullets: {
      en: [
        'Performance marketing across search and social',
        'Landing-page and conversion optimization',
        'Attribution and reporting that tie to revenue',
        'SEO foundations for durable organic reach',
      ],
      zh: [
        '搜尋與社群的成效行銷',
        '落地頁與轉換率優化',
        '與營收掛勾的歸因與報表',
        '可持續自然流量的 SEO 基礎',
      ],
    },
    subject: { en: 'Advertising', zh: '廣告投放' },
  },
  {
    slug: 'brand-design',
    icon: 'brand',
    titleKey: 's6Title',
    bodyKey: 's6Body',
    tags: ['Logo', 'Brand Identity', 'Visual System'],
    bullets: {
      en: [
        'Logo and wordmark systems that hold up at any size',
        'Visual identity across print, web, and product',
        'Guidelines and token files your team can own',
        'Rebrand execution without breaking the product',
      ],
      zh: [
        '任何尺寸都清晰的 Logo 與字標系統',
        '印刷、網頁與產品皆一致的視覺識別',
        '團隊可維護的規範與 token 檔案',
        '不破壞產品的品牌重塑執行',
      ],
    },
    subject: { en: 'Brand design', zh: '品牌設計' },
  },
]

export function getService(slug: string): ServiceDetail | undefined {
  return services.find((s) => s.slug === slug)
}