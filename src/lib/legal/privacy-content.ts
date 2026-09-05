export interface LegalSubSection {
  title: string
  body: string[]
}

export interface LegalSection {
  title: string
  subsections?: LegalSubSection[]
  body?: string[]
}

export interface LegalContent {
  lastUpdated: string
  intro: string[]
  sections: LegalSection[]
}

export const privacyContent: Record<'en' | 'zh', LegalContent> = {
  en: {
    lastUpdated: 'April 10, 2026',
    intro: [
      'This Privacy Policy explains how easecity (“we”, “us”, “our”) collects, uses, stores, and protects your personal data when you use our website and products and services. By accessing or using our services, you agree to the practices described in this policy.',
    ],
    sections: [
      {
        title: '1. Who We Are',
        body: [
          'easecity is a technology company incorporated in the Hong Kong Special Administrative Region. We operate the products and services platform available at easecity.hk and its associated subdomains.',
          'For any privacy-related enquiries, you can reach our team at: admin@easecity.hk',
        ],
      },
      {
        title: '2. Data We Collect',
        body: ['We collect the following categories of personal data:'],
        subsections: [
          {
            title: 'Account & Identity Data',
            body: [
              'Full name',
              'Email address',
              'Password (stored as a one-way bcrypt hash — we cannot read it)',
              'Account role and subscription status',
            ],
          },
          {
            title: 'Contact & Business Data',
            body: [
              'Company or organisation name (if provided in the contact form)',
              'Subject and message content submitted via our contact form',
            ],
          },
          {
            title: 'Billing & Payment Data',
            body: [
              'Subscription plan and billing status',
              'Stripe Customer ID (a reference token, not raw card data)',
              'Payment card details are handled entirely by Stripe — we never receive, store, or process raw card numbers on our servers',
            ],
          },
          {
            title: 'Usage & Technical Data',
            body: [
              'Session tokens (stored as secure JWT, invalidated on sign-out)',
              'Audit logs of significant account actions (e.g. role changes)',
              'AI chatbot conversation history (only if you use the chat feature)',
              'Standard web server logs (IP address, browser user-agent, request timestamps) — managed by our hosting provider Vercel',
            ],
          },
        ],
      },
      {
        title: '3. How We Use Your Data',
        body: [
          'Providing the service: Account creation, authentication, dashboard access, subscription management',
          'Billing & payments: Processing subscriptions via Stripe, sending payment confirmations, handling refunds',
          'Communications: Responding to contact form submissions; sending transactional emails (e.g. password reset, payment receipt) via Resend',
          'Security & compliance: Fraud prevention, maintaining audit logs, enforcing our Terms of Service',
          'Product improvement: Analysing anonymised usage patterns to improve platform features',
          'Legal obligations: Complying with applicable laws in the Hong Kong SAR and any other jurisdictions as required',
          'We do not sell, rent, or trade your personal data to third parties for marketing purposes.',
        ],
      },
      {
        title: '4. Third-Party Services',
        body: [
          'We engage the following sub-processors who may handle your personal data on our behalf. Each operates under its own privacy policy and data processing agreements:',
          'Stripe — Payment processing & subscription billing (https://stripe.com/privacy)',
          'Neon (via AWS Singapore) — Database hosting: stores account, subscription and order records (https://neon.tech/privacy)',
          'Vercel — Web hosting, edge functions, and server-side request logs (https://vercel.com/legal/privacy-policy)',
          'Resend — Transactional email delivery (https://resend.com/privacy)',
          'OpenRouter — AI inference for the in-app chat assistant (https://openrouter.ai/privacy)',
        ],
      },
      {
        title: '5. Data Storage & Transfers',
        body: [
          'Our primary database is hosted on Neon (powered by AWS in the ap-southeast-1 (Singapore) region). Web traffic and serverless functions are served via Vercel’s global edge network.',
          'If you access our services from the European Economic Area (EEA) or the United Kingdom, your data may be transferred to countries outside those regions. Where such transfers occur, we rely on Standard Contractual Clauses (SCCs) or other lawful transfer mechanisms as required by applicable data protection law.',
        ],
      },
      {
        title: '6. Data Retention',
        body: [
          'Account data: Retained for the lifetime of your account. Deleted within 30 days of account deletion request.',
          'Subscription & billing records: Retained for 7 years to comply with Hong Kong accounting and tax requirements.',
          'Contact form submissions: Retained for 2 years from date of submission.',
          'AI chat conversations: Retained for 90 days, then automatically deleted.',
          'Audit logs: Retained for 2 years.',
        ],
      },
      {
        title: "7. Your Rights",
        body: [
          'Depending on your jurisdiction, you may have some or all of the following rights regarding your personal data:',
          'Access: Request a copy of the personal data we hold about you.',
          'Rectification: Ask us to correct inaccurate or incomplete data.',
          'Erasure: Request deletion of your data, subject to legal retention obligations.',
          'Portability: Receive your data in a structured, machine-readable format.',
          'Objection / Restriction: Object to or restrict certain processing activities.',
          'Withdraw consent: Where processing is based on consent, withdraw it at any time without affecting prior processing.',
          'To exercise any of these rights, contact us at admin@easecity.hk. We will respond within 30 days. Hong Kong residents may also refer to the Office of the Privacy Commissioner for Personal Data (PCPD).',
        ],
      },
      {
        title: '8. Cookies & Local Storage',
        body: [
          'We use a minimal set of technically necessary cookies and browser storage:',
          'Session cookie — a secure, HTTP-only JWT issued by NextAuth to keep you signed in. Expires on sign-out or after 30 days of inactivity.',
          'Language preference — stored in localStorage to remember your zh/en preference.',
          'We do not use third-party advertising cookies or cross-site tracking pixels.',
        ],
      },
      {
        title: '9. Security',
        body: [
          'We implement industry-standard security measures including:',
          'TLS encryption in transit for all connections',
          'bcrypt password hashing with a work factor of 12',
          'HTTP security headers (CSP, HSTS, X-Frame-Options)',
          'Database connections over encrypted channels with SSL',
          'Role-based access control (RBAC) for administrative functions',
          'No method of electronic transmission is 100% secure. If you discover a security vulnerability, please report it responsibly to admin@easecity.hk.',
        ],
      },
      {
        title: "10. Children's Privacy",
        body: [
          'Our services are intended for business users aged 18 or older. We do not knowingly collect personal data from children under the age of 18. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.',
        ],
      },
      {
        title: '11. Changes to This Policy',
        body: [
          'We may update this Privacy Policy from time to time. When we make material changes, we will update the “Last updated” date at the top of this page and, where appropriate, notify you by email. Continued use of our services after such changes constitutes your acceptance of the revised policy.',
        ],
      },
      {
        title: '12. Contact Us',
        body: [
          'For any questions, requests, or complaints regarding this Privacy Policy or our data practices:',
          'easecity',
          'Hong Kong Special Administrative Region',
          'admin@easecity.hk',
        ],
      },
    ],
  },
  zh: {
    lastUpdated: '2026 年 4 月 10 日',
    intro: [
      '本隱私政策旨在說明 easecity（「我們」）在您使用我們的網站、產品與服務時，如何收集、使用、儲存及保護您的個人資料。當您存取或使用我們的服務，即表示您同意本政策所描述的作法。',
    ],
    sections: [
      {
        title: '1. 我們是誰',
        body: [
          'easecity 是一家於香港特別行政區註冊成立的科技公司。我們營運位於 easecity.hk 及其相關子網域的產品與服務平台。',
          '如對隱私事宜有任何查詢，歡迎透過 admin@easecity.hk 聯繫我們的團隊。',
        ],
      },
      {
        title: '2. 我們收集的資料',
        body: ['我們收集以下類別的個人資料：'],
        subsections: [
          {
            title: '帳戶與身份資料',
            body: [
              '全名',
              '電子郵件地址',
              '密碼（以一組單向 bcrypt 雜湊儲存——我們無法讀取）',
              '帳戶角色與訂閱狀態',
            ],
          },
          {
            title: '聯絡與業務資料',
            body: [
              '公司或機構名稱（如在聯絡表中提供）',
              '透過聯絡表提交的主旨與訊息內容',
            ],
          },
          {
            title: '帳單與付款資料',
            body: [
              '訂閱方案與帳單狀態',
              'Stripe 客戶 ID（一個參考代碼，而非原始卡片資料）',
              '付款卡號資料完全由 Stripe 處理——我們絕不會在我們的伺服器上接收、儲存或處理原始卡號',
            ],
          },
          {
            title: '使用與技術資料',
            body: [
              '會話權杖（以安全 JWT 儲存，登出時即失效）',
              '重要帳戶操作（例如角色變更）的稽核日誌',
              'AI 聊天機器人對話紀錄（僅在您使用聊天功能時）',
              '標準網頁伺服器日誌（IP 位址、瀏覽器使用者代理、請求時間戳）——由我們的主機提供商 Vercel 管理',
            ],
          },
        ],
      },
      {
        title: '3. 我們如何使用您的資料',
        body: [
          '提供服務：帳戶建立、身份驗證、儀表板存取、訂閱管理',
          '帳單與付款：透過 Stripe 處理訂閱、發送付款確認、處理退款',
          '通訊：回覆聯絡表提交；透過 Resend 發送交易性電子郵件（例如密碼重設、付款收據）',
          '安全與合規：防詐欺、維護稽核日誌、執行我們的服務條款',
          '產品改善：分析去識別化的使用型態以改善平台功能',
          '法律義務：遵守香港特別行政區及其他適用司法管轄區的相關法律',
          '我們不會為行銷目的而向第三方出售、出租或交易您的個人資料。',
        ],
      },
      {
        title: '4. 第三方服務',
        body: [
          '我們委託以下次處理者，其可能代表我們處理您的個人資料。每一家均依自身隱私政策及資料處理協議營運：',
          'Stripe——支付處理與訂閱帳單（https://stripe.com/privacy）',
          'Neon（透過 AWS 新加坡）——資料庫託管：儲存帳戶、訂閱及訂單紀錄（https://neon.tech/privacy）',
          'Vercel——網頁託管、邊緣函式與伺服器端請求日誌（https://vercel.com/legal/privacy-policy）',
          'Resend——交易性電子郵件發送（https://resend.com/privacy）',
          'OpenRouter——應用程式內聊天助理的 AI 推論（https://openrouter.ai/privacy）',
        ],
      },
      {
        title: '5. 資料儲存與傳輸',
        body: [
          '我們的主要資料庫託管於 Neon（由位於 ap-southeast-1（新加坡）區域的 AWS 支援）。網頁流量與無伺服器函式則透過 Vercel 的全球邊緣網路提供服務。',
          '若您從歐洲經濟區（EEA）或英國存取我們的服務，您的資料可能被傳輸至這些區域以外的國家。發生此類傳輸時，我們依適用資料保護法的規定，依賴標準契約條款（SCCs）或其他合法的傳輸機制。',
        ],
      },
      {
        title: '6. 資料保留',
        body: [
          '帳戶資料：於您帳戶存續期間內保留。提出帳戶刪除請求後 30 天內刪除。',
          '訂閱與帳單紀錄：保留 7 年，以符合香港的會計與稅務要求。',
          '聯絡表提交內容：自提交之日起保留 2 年。',
          'AI 聊天對話：保留 90 天，其後自動刪除。',
          '稽核日誌：保留 2 年。',
        ],
      },
      {
        title: '7. 您的權利',
        body: [
          '視您的司法管轄區而定，您可能享有以下部分或全部有關您個人資料的權利：',
          '存取：請求取得我們所持有關於您的個人資料副本。',
          '更正：要求我們更正不準確或不完整的資料。',
          '刪除：依法定的資料保留義務為前提，請求刪除您的資料。',
          '可攜性：以結構化、機器可讀的格式接收您的資料。',
          '異議／限制處理：對特定處理活動提出異議或要求限制。',
          '撤回同意：若處理乃基於同意而進行，您可隨時撤回同意，且不影響撤回前已進行的處理。',
          '如需行使上述任何權利，請透過 admin@easecity.hk 聯繫我們。我們將於 30 天內回覆。香港居民亦可向個人資料私隱專員公署（PCPD）提出查詢。',
        ],
      },
      {
        title: '8. Cookie 與本機儲存',
        body: [
          '我們僅使用一組技術上必要的 Cookie 與瀏覽器儲存：',
          '會話 Cookie——由 NextAuth 簽發的安全、僅限 HTTP 的 JWT，用於維持您的登入狀態。於登出後或連續 30 天未活動後到期。',
          '語言偏好——儲存於 localStorage，用於記住您的 zh/en 偏好。',
          '我們不使用第三方廣告 Cookie 或跨站追蹤像素。',
        ],
      },
      {
        title: '9. 安全',
        body: [
          '我們實施業界標準的安全措施，包括：',
          '所有連線的傳輸皆以 TLS 加密',
          '以工作因子 12 進行 bcrypt 密碼雜湊',
          'HTTP 安全標頭（CSP、HSTS、X-Frame-Options）',
          '資料庫連線經 SSL 加密通道',
          '對管理功能實施基於角色的存取控制（RBAC）',
          '任何電子傳輸方法皆非百分之百安全。若您發現安全漏洞，請以負責任的方式通報至 admin@easecity.hk。',
        ],
      },
      {
        title: '10. 兒童隱私',
        body: [
          '我們的服務專供 18 歲或以上的商業使用者使用。我們不會在知情的情況下收集未滿 18 歲兒童的個人資料。若您認為有兒童向我們提供了個人資料，請與我們聯繫，我們會立即予以刪除。',
        ],
      },
      {
        title: '11. 本政策的變更',
        body: [
          '我們可能不時更新本隱私政策。當我們作出重大變更時，會更新本頁頂部的「最後更新」日期，並在適當情況下以電子郵件通知您。在此類變更之後持續使用我們的服務，即構成您對修訂後政策的接受。',
        ],
      },
      {
        title: '12. 與我們聯繫',
        body: [
          '如有任何有關本隱私政策或我們資料處理作法的問題、請求或申訴：',
          'easecity',
          '香港特別行政區',
          'admin@easecity.hk',
        ],
      },
    ],
  },
}