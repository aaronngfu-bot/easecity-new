/**
 * Per-service quote questionnaires. Each service gets its own detailed,
 * service-specific question set (single-select, multi-select, and free-text)
 * so we capture real project requirements — not a generic contact form.
 * Budget + timeline are appended as shared questions.
 */

export interface QOption {
  en: string
  zh: string
}

export interface Question {
  id: string
  label: { en: string; zh: string }
  type: 'single' | 'multi' | 'text' | 'textarea'
  options?: QOption[]
  placeholder?: { en: string; zh: string }
  required: boolean
}

export interface Questionnaire {
  intro: { en: string; zh: string }
  questions: Question[]
}

const budgetQuestion: Question = {
  id: 'budget',
  label: { en: 'What is your approximate budget?', zh: '您的預算大約是多少？' },
  type: 'single',
  options: [
    { en: 'Under US$1,000', zh: '低於 HK$8,000' },
    { en: 'US$1,000 – 5,000', zh: 'HK$8,000 – 40,000' },
    { en: 'US$5,000 – 10,000', zh: 'HK$40,000 – 80,000' },
    { en: 'US$10,000 – 50,000', zh: 'HK$80,000 – 400,000' },
    { en: 'US$50,000+', zh: 'HK$400,000 以上' },
    { en: 'Not sure yet', zh: '尚未確定' },
  ],
  required: true,
}

const timelineQuestion: Question = {
  id: 'timeline',
  label: { en: 'When do you need it?', zh: '您希望何時完成？' },
  type: 'single',
  options: [
    { en: 'As soon as possible', zh: '盡快' },
    { en: 'Within 1 month', zh: '1 個月內' },
    { en: '1 – 3 months', zh: '1 – 3 個月' },
    { en: '3 – 6 months', zh: '3 – 6 個月' },
    { en: 'Flexible', zh: '彈性' },
  ],
  required: true,
}

const questionnaires: Record<string, Questionnaire> = {
  'system-development': {
    intro: {
      en: 'A few questions about the system you want to build.',
      zh: '幾個關於您想打造的系統的問題。',
    },
    questions: [
      {
        id: 'system-type',
        label: { en: 'What kind of system?', zh: '系統類型？' },
        type: 'single',
        options: [
          { en: 'Desktop application', zh: '桌面應用程式' },
          { en: 'Backend / API service', zh: '後端 / API 服務' },
          { en: 'CLI / internal tool', zh: 'CLI / 內部工具' },
          { en: 'Real-time streaming system', zh: '即時串流系統' },
          { en: 'Device / control system', zh: '裝置 / 控制系統' },
          { en: 'Other', zh: '其他' },
        ],
        required: true,
      },
      {
        id: 'platform',
        label: { en: 'Target platform(s)?', zh: '目標平台？' },
        type: 'multi',
        options: [
          { en: 'Windows', zh: 'Windows' },
          { en: 'macOS', zh: 'macOS' },
          { en: 'Linux', zh: 'Linux' },
          { en: 'Android', zh: 'Android' },
          { en: 'Web', zh: '網頁' },
        ],
        required: true,
      },
      {
        id: 'tech-preference',
        label: { en: 'Technology preference?', zh: '技術偏好？' },
        type: 'single',
        options: [
          { en: 'C++', zh: 'C++' },
          { en: 'Flutter', zh: 'Flutter' },
          { en: 'Node.js', zh: 'Node.js' },
          { en: 'Go / Rust', zh: 'Go / Rust' },
          { en: 'No preference', zh: '無偏好' },
        ],
        required: false,
      },
      {
        id: 'scale',
        label: { en: 'Expected scale (users / devices)?', zh: '預期規模（用戶 / 裝置數）？' },
        type: 'single',
        options: [
          { en: 'Under 100', zh: '少於 100' },
          { en: '100 – 1,000', zh: '100 – 1,000' },
          { en: '1,000 – 10,000', zh: '1,000 – 10,000' },
          { en: '10,000+', zh: '10,000 以上' },
        ],
        required: false,
      },
      budgetQuestion,
      timelineQuestion,
    ],
  },

  'web-platforms': {
    intro: {
      en: 'Tell us about the web platform you have in mind.',
      zh: '說說您心中的網頁平台。',
    },
    questions: [
      {
        id: 'platform-type',
        label: { en: 'What kind of platform?', zh: '平台類型？' },
        type: 'single',
        options: [
          { en: 'Marketing site', zh: '行銷網站' },
          { en: 'Dashboard / admin panel', zh: '儀表板 / 後台' },
          { en: 'E-commerce', zh: '電商' },
          { en: 'SaaS application', zh: 'SaaS 應用' },
          { en: 'API backend', zh: 'API 後端' },
          { en: 'Other', zh: '其他' },
        ],
        required: true,
      },
      {
        id: 'features',
        label: { en: 'Which features do you need?', zh: '需要哪些功能？' },
        type: 'multi',
        options: [
          { en: 'Authentication', zh: '驗證登入' },
          { en: 'Billing / payments', zh: '帳單 / 支付' },
          { en: 'Admin dashboard', zh: '管理後台' },
          { en: 'Multi-language', zh: '多語系' },
          { en: 'Real-time updates', zh: '即時更新' },
          { en: 'File upload', zh: '檔案上傳' },
        ],
        required: true,
      },
      {
        id: 'user-scale',
        label: { en: 'Expected number of users?', zh: '預期用戶數？' },
        type: 'single',
        options: [
          { en: 'Under 1,000', zh: '少於 1,000' },
          { en: '1,000 – 10,000', zh: '1,000 – 10,000' },
          { en: '10,000 – 100,000', zh: '10,000 – 100,000' },
          { en: '100,000+', zh: '100,000 以上' },
        ],
        required: false,
      },
      budgetQuestion,
      timelineQuestion,
    ],
  },

  'ui-ux-design': {
    intro: {
      en: 'Help us understand your design needs.',
      zh: '讓我們了解您的設計需求。',
    },
    questions: [
      {
        id: 'scope',
        label: { en: 'Scope of work?', zh: '工作範圍？' },
        type: 'single',
        options: [
          { en: 'New product design', zh: '新產品設計' },
          { en: 'Redesign existing product', zh: '現有產品重新設計' },
          { en: 'Component library', zh: '元件庫' },
          { en: 'Design system', zh: '設計系統' },
        ],
        required: true,
      },
      {
        id: 'platform',
        label: { en: 'Target platform(s)?', zh: '目標平台？' },
        type: 'multi',
        options: [
          { en: 'Desktop', zh: '桌面' },
          { en: 'Web', zh: '網頁' },
          { en: 'Mobile', zh: '行動' },
          { en: 'Cross-platform', zh: '跨平台' },
        ],
        required: true,
      },
      {
        id: 'deliverable',
        label: { en: 'Preferred deliverable?', zh: '期望交付物？' },
        type: 'single',
        options: [
          { en: 'Figma designs', zh: 'Figma 設計檔' },
          { en: 'Design + code', zh: '設計 + 程式碼' },
          { en: 'Tokens & guidelines', zh: 'Token 與規範文件' },
        ],
        required: false,
      },
      budgetQuestion,
      timelineQuestion,
    ],
  },

  consulting: {
    intro: {
      en: 'A few questions about the advice you need.',
      zh: '幾個關於您所需建議的問題。',
    },
    questions: [
      {
        id: 'focus',
        label: { en: 'What area do you need help with?', zh: '需要哪方面的協助？' },
        type: 'multi',
        options: [
          { en: 'Architecture review', zh: '架構審查' },
          { en: 'Performance audit', zh: '效能稽核' },
          { en: 'Team process', zh: '團隊流程' },
          { en: 'Fractional CTO', zh: '技術長級指導' },
        ],
        required: true,
      },
      {
        id: 'team-size',
        label: { en: 'Team size?', zh: '團隊規模？' },
        type: 'single',
        options: [
          { en: 'Solo', zh: '個人' },
          { en: '2 – 10', zh: '2 – 10 人' },
          { en: '11 – 50', zh: '11 – 50 人' },
          { en: '50+', zh: '50 人以上' },
        ],
        required: false,
      },
      {
        id: 'current-stack',
        label: { en: 'Current technology stack?', zh: '目前的技術棧？' },
        type: 'text',
        placeholder: { en: 'e.g. Next.js + PostgreSQL + AWS', zh: '例如 Next.js + PostgreSQL + AWS' },
        required: false,
      },
      budgetQuestion,
      timelineQuestion,
    ],
  },

  advertising: {
    intro: {
      en: 'Tell us about your marketing goals.',
      zh: '說說您的行銷目標。',
    },
    questions: [
      {
        id: 'channels',
        label: { en: 'Which channels?', zh: '哪些渠道？' },
        type: 'multi',
        options: [
          { en: 'Google Ads', zh: 'Google Ads' },
          { en: 'Meta (Facebook/IG)', zh: 'Meta（Facebook / IG）' },
          { en: 'SEO', zh: 'SEO' },
          { en: 'Programmatic', zh: '程序化廣告' },
        ],
        required: true,
      },
      {
        id: 'goal',
        label: { en: 'Primary goal?', zh: '主要目標？' },
        type: 'single',
        options: [
          { en: 'Customer acquisition', zh: '獲取客戶' },
          { en: 'Brand awareness', zh: '品牌曝光' },
          { en: 'Conversions / sales', zh: '轉換 / 銷售' },
          { en: 'Retention', zh: '留存' },
        ],
        required: true,
      },
      {
        id: 'region',
        label: { en: 'Target region(s)?', zh: '目標地區？' },
        type: 'text',
        placeholder: { en: 'e.g. Hong Kong, Asia Pacific', zh: '例如香港、亞太區' },
        required: false,
      },
      budgetQuestion,
      timelineQuestion,
    ],
  },

  'brand-design': {
    intro: {
      en: 'Help us understand your brand project.',
      zh: '讓我們了解您的品牌專案。',
    },
    questions: [
      {
        id: 'scope',
        label: { en: 'Scope of work?', zh: '工作範圍？' },
        type: 'single',
        options: [
          { en: 'Logo / wordmark', zh: 'Logo / 字標' },
          { en: 'Visual identity', zh: '視覺識別' },
          { en: 'Brand guidelines', zh: '品牌規範' },
          { en: 'Full rebrand', zh: '全面重塑' },
        ],
        required: true,
      },
      {
        id: 'current',
        label: { en: 'Do you have an existing brand?', zh: '是否已有現有品牌？' },
        type: 'single',
        options: [
          { en: 'Yes, need a refresh', zh: '有，需要更新' },
          { en: 'No, starting fresh', zh: '沒有，全新開始' },
          { en: 'Have a logo only', zh: '只有 Logo' },
        ],
        required: true,
      },
      {
        id: 'applications',
        label: { en: 'Where will the brand be used?', zh: '品牌會用在哪些地方？' },
        type: 'multi',
        options: [
          { en: 'Print', zh: '印刷' },
          { en: 'Web', zh: '網頁' },
          { en: 'Product / app', zh: '產品 / App' },
          { en: 'Social media', zh: '社交媒體' },
        ],
        required: false,
      },
      budgetQuestion,
      timelineQuestion,
    ],
  },
}

export function getQuestionnaire(slug: string): Questionnaire | undefined {
  return questionnaires[slug]
}

export const defaultQuestionnaire: Questionnaire = {
  intro: {
    en: 'A few questions about your project.',
    zh: '幾個關於您專案的問題。',
  },
  questions: [
    {
      id: 'need',
      label: { en: 'What do you need?', zh: '您需要什麼？' },
      type: 'single',
      options: [
        { en: 'System development', zh: '系統開發' },
        { en: 'Web platform', zh: '網頁平台' },
        { en: 'UI/UX design', zh: 'UI/UX 設計' },
        { en: 'Consulting', zh: '諮詢服務' },
        { en: 'Advertising', zh: '廣告投放' },
        { en: 'Brand design', zh: '品牌設計' },
      ],
      required: true,
    },
    budgetQuestion,
    timelineQuestion,
  ],
}