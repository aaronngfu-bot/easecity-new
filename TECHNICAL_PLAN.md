# easecity 技術實作文件

> **專案名稱：** easecity — Stream Control Infrastructure  
> **文件版本：** v2.0（實作完成版）  
> **初版日期：** 2026-04-01  
> **更新日期：** 2026-04-01  
> **適用對象：** 開發團隊 / 技術主管 / 專案經理

---

## 目錄

1. [專案現況](#1-專案現況)
2. [技術棧總覽](#2-技術棧總覽)
3. [專案架構](#3-專案架構)
4. [各功能模組實作紀錄](#4-各功能模組實作紀錄)
   - 4.1 表單寄信
   - 4.2 金流串接（Stripe）
   - 4.3 會員系統（NextAuth）
   - 4.4 後台管理系統
   - 4.5 API 串接架構
   - 4.6 動畫效果設計
   - 4.7 滾動視差效果
   - 4.8 數據圖表呈現
   - 4.9 Chatbot 系統整合
5. [資料庫設計](#5-資料庫設計)
6. [安全性設計](#6-安全性設計)
7. [SEO 與效能優化](#7-seo-與效能優化)
8. [測試策略](#8-測試策略)
9. [開發階段實作紀錄](#9-開發階段實作紀錄)
10. [環境變數與部署指南](#10-環境變數與部署指南)

---

## 1. 專案現況

### 1.1 Build 結果

31 個路由，零錯誤通過 production build。

| 類型 | 數量 | 說明 |
|------|------|------|
| 靜態頁面（○） | 19 | SSG 預渲染 |
| 動態頁面（ƒ） | 5 | SSR 依請求渲染 |
| API Routes（ƒ） | 12 | Server-side 端點 |
| Middleware | 1 | 47.7 kB |

### 1.2 路由總覽

```
前台頁面（Public）
  /                          ○  首頁（含視差效果 + Chatbot 浮窗）
  /about                     ○  關於頁
  /services                  ○  服務頁
  /contact                   ○  聯繫頁（真實表單寄信）
  /payment/success            ○  付款成功
  /payment/cancel             ○  付款取消

會員頁面（需登入）
  /dashboard                 ƒ  會員中心（訂單統計）
  /dashboard/orders          ƒ  訂單列表
  /dashboard/settings         ○  帳號設定 + 登出

認證頁面
  /login                     ○  登入
  /register                  ○  註冊

後台管理（需 ADMIN 角色）
  /admin                     ○  Dashboard（統計卡片 + Recharts 圖表）
  /admin/users               ○  用戶管理列表
  /admin/users/[id]          ƒ  用戶詳情 + 角色管理
  /admin/orders              ○  訂單管理列表
  /admin/orders/[id]         ƒ  訂單詳情
  /admin/contacts            ○  聯繫表單管理
  /admin/logs                ○  操作日誌

SEO
  /sitemap.xml               ○  動態 Sitemap
  /robots.txt                ○  Robots 規則

API Routes
  /api/v1/health             ƒ  系統健康檢查
  /api/contact               ƒ  表單寄信（Zod + Rate Limit + Resend）
  /api/auth/[...nextauth]    ƒ  NextAuth 認證
  /api/auth/register         ƒ  用戶註冊
  /api/chat                  ƒ  AI Chatbot（Streaming）
  /api/payment/create-session ƒ  Stripe Checkout（一次性 + 訂閱）
  /api/payment/create-portal ƒ  Stripe Billing Portal
  /api/payment/webhook       ƒ  Stripe Webhook（6 事件）
  /api/admin/stats           ƒ  Dashboard 統計
  /api/admin/users/[id]      ƒ  用戶管理 PATCH
```

---

## 2. 技術棧總覽

### 2.1 核心框架

| 項目 | 技術 | 版本 |
|------|------|------|
| Framework | Next.js (App Router) | 14.2.5 |
| Language | TypeScript (strict mode) | ^5 |
| React | React + React DOM | ^18 |
| CSS | Tailwind CSS + PostCSS + Autoprefixer | 3.4.1 |
| Animation | Framer Motion | ^11.3.0 |
| Icons | Lucide React | ^0.414.0 |
| Utility | clsx + tailwind-merge | 2.1.1 / 2.4.0 |

### 2.2 後端與資料庫

| 項目 | 技術 | 版本 |
|------|------|------|
| ORM | Prisma | ^6.19.3 |
| Database | SQLite（開發）→ PostgreSQL（生產） | — |
| Authentication | NextAuth.js (JWT + Credentials) | ^4.24.13 |
| Auth Adapter | @next-auth/prisma-adapter | ^1.0.7 |
| Validation | Zod | ^4.3.6 |
| Password | bcryptjs (12 rounds) | ^3.0.3 |

### 2.3 第三方服務

| 項目 | 技術 | 版本 |
|------|------|------|
| Payment | Stripe (Server + Client) | ^21.0.1 / ^9.0.1 |
| Email | Resend | ^6.10.0 |
| AI | OpenAI via Vercel AI SDK | ai ^6.0.142 / @ai-sdk/openai ^3.0.49 |
| AI React | @ai-sdk/react | ^3.0.144 |
| Charts | Recharts | ^3.8.1 |

### 2.4 開發工具

| 項目 | 技術 | 版本 |
|------|------|------|
| E2E Testing | Playwright | ^1.59.0 |
| Linting | ESLint + eslint-config-next | ^8 / 14.2.5 |
| Env | dotenv | ^17.3.1 |
| Seed Runner | tsx | ^4.21.0 |

### 2.5 NPM Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "postinstall": "prisma generate"
}
```

---

## 3. 專案架構

### 3.1 目錄結構

```
easecity-clean2/
├── prisma/
│   ├── schema.prisma              ← 資料庫 Schema（8 張表）
│   ├── migrations/                ← Migration 記錄
│   └── seed.ts                    ← 種子資料（Admin + Demo User）
├── e2e/
│   ├── navigation.spec.ts         ← 導航 + SEO 測試（7 項）
│   ├── contact-form.spec.ts       ← 表單測試（3 項）
│   ├── auth.spec.ts               ← 認證測試（5 項）
│   └── api.spec.ts                ← API 測試（4 項）
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← 根 Layout（字體 + SessionProvider + LanguageProvider + JSON-LD）
│   │   ├── globals.css            ← 全域樣式（Tailwind layers + 自訂 utilities）
│   │   ├── error.tsx              ← 全域錯誤邊界
│   │   ├── not-found.tsx          ← 404 頁面
│   │   ├── loading.tsx            ← 全域載入狀態
│   │   ├── sitemap.ts             ← 動態 sitemap.xml
│   │   ├── robots.ts              ← robots.txt
│   │   ├── (public)/              ← 前台 Route Group
│   │   │   ├── layout.tsx         ← Navbar + Footer + ChatWidget
│   │   │   ├── page.tsx           ← 首頁（含 ParallaxSection）
│   │   │   ├── about/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── dashboard/         ← 會員中心
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx       ← Dashboard（SSR）
│   │   │   │   ├── orders/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   └── payment/
│   │   │       ├── success/page.tsx
│   │   │       └── cancel/page.tsx
│   │   ├── (auth)/                ← 認證 Route Group
│   │   │   ├── layout.tsx         ← 精簡佈局（無導覽列）
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── admin/                 ← 後台管理
│   │   │   ├── layout.tsx         ← Sidebar + Header 佈局
│   │   │   ├── page.tsx           ← Dashboard（統計 + Recharts 圖表）
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── UserRoleForm.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   └── logs/page.tsx
│   │   └── api/
│   │       ├── v1/health/route.ts
│   │       ├── contact/route.ts
│   │       ├── chat/route.ts
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── payment/
│   │       │   ├── create-session/route.ts
│   │       │   ├── create-portal/route.ts
│   │       │   └── webhook/route.ts
│   │       └── admin/
│   │           ├── stats/route.ts
│   │           └── users/[id]/route.ts
│   ├── components/
│   │   ├── about/                 ← 關於頁元件
│   │   ├── contact/               ← 聯繫頁元件（ContactForm 真實 API 呼叫）
│   │   ├── home/                  ← 首頁元件
│   │   ├── services/              ← 服務頁元件
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         ← 含 Auth 狀態判斷（登入/Dashboard/登出按鈕）
│   │   │   └── Footer.tsx
│   │   ├── shared/
│   │   │   └── HKSkyline.tsx
│   │   ├── ui/
│   │   │   ├── AnimatedSection.tsx  ← useReducedMotion 支援
│   │   │   ├── ParallaxSection.tsx  ← 視差滾動（行動裝置自動停用）
│   │   │   ├── GlowCard.tsx
│   │   │   └── SectionTitle.tsx
│   │   ├── admin/
│   │   │   └── charts/
│   │   │       ├── RevenueChart.tsx   ← Recharts Area Chart
│   │   │       └── OrdersChart.tsx    ← Recharts Bar Chart
│   │   ├── chat/
│   │   │   └── ChatWidget.tsx     ← AI 浮動對話視窗
│   │   ├── seo/
│   │   │   └── JsonLd.tsx         ← Organization + WebSite JSON-LD
│   │   └── providers/
│   │       └── SessionProvider.tsx ← NextAuth Client Provider
│   ├── context/
│   │   └── LanguageContext.tsx     ← i18n（en/zh）
│   ├── hooks/
│   │   ├── useIsMobile.ts         ← 裝置偵測
│   │   └── useIntersectionObserver.ts
│   ├── i18n/
│   │   └── translations.ts       ← 雙語翻譯（771 行）
│   ├── lib/
│   │   ├── utils.ts               ← cn() + formatDate()
│   │   ├── db.ts                  ← Prisma Client singleton
│   │   ├── auth.ts                ← NextAuth 配置
│   │   ├── permissions.ts         ← RBAC 權限矩陣
│   │   ├── stripe.ts              ← Stripe Server instance
│   │   ├── stripe-client.ts       ← Stripe Client loadStripe
│   │   ├── api-response.ts        ← 統一回應格式
│   │   ├── api-handler.ts         ← 錯誤攔截 wrapper
│   │   ├── rate-limit.ts          ← IP-based 限流器
│   │   ├── audit.ts               ← Audit Log 工具
│   │   ├── error-tracking.ts      ← 錯誤追蹤（可替換 Sentry）
│   │   ├── validations/
│   │   │   └── contact.ts         ← Zod schema
│   │   └── email/
│   │       └── send.ts            ← Resend 郵件發送
│   ├── types/
│   │   └── next-auth.d.ts         ← NextAuth 型別擴展
│   └── middleware.ts              ← 安全 Headers + JWT 驗證 + RBAC + CORS
├── .env.example                   ← 環境變數範本
├── .env.local                     ← 本地開發環境
├── next.config.mjs                ← Security Headers + HSTS + Image Optimization
├── tailwind.config.ts             ← 自訂色彩 + 動畫 + 字體
├── tsconfig.json                  ← strict + @/* 路徑別名
├── playwright.config.ts           ← E2E 測試設定
└── package.json
```

### 3.2 路由架構設計

三套獨立 Layout 透過 Route Groups 分離：

```
根 Layout（src/app/layout.tsx）
├── 字體載入（Inter + Space Grotesk）
├── SessionProvider（NextAuth）
├── LanguageProvider（i18n）
├── JSON-LD 結構化資料
│
├── (public) Layout → Navbar + Footer + ChatWidget
│   ├── 首頁、關於、服務、聯繫
│   ├── 會員 Dashboard
│   └── 付款結果頁
│
├── (auth) Layout → 精簡居中佈局
│   ├── 登入頁
│   └── 註冊頁
│
└── admin Layout → Sidebar + Header
    ├── Dashboard（圖表）
    ├── 用戶管理
    ├── 訂單管理
    ├── 聯繫表單
    └── 操作日誌
```

### 3.3 Server / Client Component 分工

| 類型 | 位置 | 說明 |
|------|------|------|
| **Server Component** | 所有 `page.tsx`（預設） | 資料擷取、metadata、SSR 渲染 |
| **Server Component** | `admin/page.tsx` | Prisma 直接查詢統計資料，零 API 呼叫 |
| **Server Component** | `dashboard/page.tsx` | SSR 查詢用戶訂單 |
| **Client Component** | `ContactForm.tsx` | 表單互動 + API 呼叫 |
| **Client Component** | `Navbar.tsx` | 滾動偵測 + Auth 狀態 + 選單動畫 |
| **Client Component** | `ChatWidget.tsx` | AI 對話 + Streaming |
| **Client Component** | `AnimatedSection.tsx` | Framer Motion 動畫 |
| **Client Component** | `ParallaxSection.tsx` | 視差滾動 |
| **Client Component** | `RevenueChart.tsx` / `OrdersChart.tsx` | Recharts（dynamic import, ssr: false） |
| **Client Component** | `UserRoleForm.tsx` | 角色管理表單 |
| **Client Component** | 登入/註冊頁面 | 表單互動 + signIn |

---

## 4. 各功能模組實作紀錄

### 4.1 表單寄信

| 項目 | 實作內容 |
|------|----------|
| **API Route** | `POST /api/contact` |
| **驗證** | 前端 HTML5 + 後端 Zod（name min 2, email format, message min 10） |
| **防垃圾信** | IP-based Rate Limiting：同一 IP 每分鐘 3 次 |
| **郵件服務** | Resend SDK（lazy init，無 API Key 不 crash） |
| **資料儲存** | 所有提交存入 `ContactSubmission` 表 |
| **郵件模板** | HTML 格式（表格排版 + escapeHtml 防 XSS） |
| **錯誤處理** | 郵件發送失敗為 non-blocking（表單資料已存入 DB） |
| **前端** | `ContactForm.tsx` 改為真實 `fetch` 呼叫，顯示 API 回傳的錯誤訊息 |

**關鍵檔案：**
- `src/app/api/contact/route.ts`
- `src/lib/validations/contact.ts`
- `src/lib/email/send.ts`
- `src/components/contact/ContactForm.tsx`

### 4.2 金流串接（Stripe）

| 項目 | 實作內容 |
|------|----------|
| **方案** | Stripe Checkout Sessions API（遵循 Stripe Best Practices） |
| **支援模式** | 一次性付款（`payment`）+ 訂閱制（`subscription`） |
| **Checkout API** | `POST /api/payment/create-session`：需登入 → 建立 Order → 建立 Stripe Session → 回傳 URL |
| **Billing Portal** | `POST /api/payment/create-portal`：讓用戶自行管理訂閱 |
| **Webhook** | `POST /api/payment/webhook`：Raw body + 簽章驗證 |
| **處理事件** | `checkout.session.completed`、`checkout.session.expired`、`invoice.payment_succeeded`、`customer.subscription.deleted`、`charge.refunded` |
| **訂單狀態機** | `created → pending_payment → paid → fulfilled → completed` / `expired` / `cancelled` / `refunded` |
| **安全性** | `stripe.webhooks.constructEvent()` 簽章驗證，金額由 Server 端決定 |
| **冪等性** | `stripeSessionId` unique 約束防重複處理 |

**關鍵檔案：**
- `src/lib/stripe.ts`（Server）
- `src/lib/stripe-client.ts`（Client）
- `src/app/api/payment/create-session/route.ts`
- `src/app/api/payment/create-portal/route.ts`
- `src/app/api/payment/webhook/route.ts`

### 4.3 會員系統（NextAuth）

| 項目 | 實作內容 |
|------|----------|
| **框架** | NextAuth v4 + Prisma Adapter |
| **Session 策略** | JWT（7 天有效期） |
| **Provider** | Credentials（email/password） |
| **密碼安全** | bcryptjs 12 rounds |
| **註冊驗證** | Zod：min 8 chars + 1 大寫 + 1 數字 + Rate Limit（每 IP 15 分鐘 5 次） |
| **JWT 擴展** | `callbacks.jwt` 注入 `id` + `role`；`callbacks.session` 傳遞至 Client |
| **型別擴展** | `src/types/next-auth.d.ts` 擴展 Session + JWT 介面 |
| **RBAC** | 三層角色：`SUPER_ADMIN > ADMIN > MEMBER` |
| **權限矩陣** | `src/lib/permissions.ts`：11 項細粒度權限 |
| **路由保護** | Middleware 層 JWT 驗證：`/dashboard/*` 需登入、`/admin/*` 需 ADMIN |
| **UX 流程** | 註冊後自動 signIn → 跳轉 Dashboard；已登入訪問 `/login` 自動跳轉 |

**關鍵檔案：**
- `src/lib/auth.ts`
- `src/lib/permissions.ts`
- `src/types/next-auth.d.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/middleware.ts`

### 4.4 後台管理系統

| 項目 | 實作內容 |
|------|----------|
| **佈局** | 獨立 Layout：左側 Sidebar（導航）+ 頂部 Header |
| **Dashboard** | 4 張統計卡片 + RevenueChart（Area）+ OrdersChart（Bar） |
| **用戶管理** | 列表（角色/狀態/訂單數）+ 詳情頁 + 角色/狀態修改表單 |
| **訂單管理** | 列表（關聯 Customer）+ 詳情頁（Stripe ID、Items） |
| **聯繫表單** | 列表（狀態標籤：new/read/replied/archived） |
| **操作日誌** | Action + Target + Changes JSON diff + IP |
| **Audit Log** | 所有管理操作自動記錄（`src/lib/audit.ts`） |
| **權限控制** | Middleware（路由層）+ Layout（Server-side session 檢查）雙重驗證 |
| **API** | `PATCH /api/admin/users/[id]` + `GET /api/admin/stats` |

**關鍵檔案：**
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/users/`、`orders/`、`contacts/`、`logs/`
- `src/lib/audit.ts`

### 4.5 API 串接架構

| 項目 | 實作內容 |
|------|----------|
| **統一回應格式** | `apiSuccess(data, status)`、`apiError(code, message, status)`、`apiPaginated(data, total, page, limit)` |
| **Error Handler** | `withErrorHandler(handler)` wrapper：自動攔截 ZodError → 400、AuthError → 401、ForbiddenError → 403、其他 → 500 |
| **Rate Limiting** | In-memory Map 限流器，含自動清理機制 |
| **限流配置** | Contact: 3/min、Register: 5/15min、Chat: 20/min |
| **API Versioning** | `/api/v1/health` 作為版本化 API 起點 |
| **Health Check** | 回傳 DB 狀態、版本號、uptime、延遲、各服務配置狀態 |
| **CORS** | Middleware 層設定（允許所有來源，可依需求限縮） |

**關鍵檔案：**
- `src/lib/api-response.ts`
- `src/lib/api-handler.ts`
- `src/lib/rate-limit.ts`
- `src/app/api/v1/health/route.ts`

### 4.6 動畫效果設計

| 項目 | 實作內容 |
|------|----------|
| **Framer Motion** | 已有 `AnimatedSection`、`StaggerContainer`、`StaggerItem` |
| **useReducedMotion** | 三個元件均已加入：系統設定 `prefers-reduced-motion` 時完全停用動畫，改為靜態 `<div>` |
| **Navbar 動畫** | 入場動畫、滑動指示器（layoutId）、手機選單 AnimatePresence |
| **ContactForm** | 表單入場 + 成功狀態切換動畫 |
| **ChatWidget** | 視窗開關動畫（scale + y 位移）+ 按鈕 hover/tap 縮放 |
| **CSS Animations** | dataPulse、nodePulse、float、glowPulse、fadeUp（globals.css + tailwind.config.ts） |

**關鍵檔案：**
- `src/components/ui/AnimatedSection.tsx`
- `src/app/globals.css`
- `tailwind.config.ts`

### 4.7 滾動視差效果

| 項目 | 實作內容 |
|------|----------|
| **元件** | `ParallaxSection`：Framer Motion `useScroll` + `useTransform` |
| **speed 參數** | -1 到 1 控制視差強度與方向 |
| **行動裝置** | `useIsMobile` hook：768px 以下自動停用視差 |
| **無障礙** | `useReducedMotion`：系統動畫偏好設定時停用 |
| **效能** | 使用 `transform: translateY()`（GPU 合成，不觸發 reflow） + `overflow: hidden` |
| **首頁整合** | CompanyIntro（speed 0.15）、TechAdvantages（0.1）、CTASection（0.12） |

**關鍵檔案：**
- `src/components/ui/ParallaxSection.tsx`
- `src/hooks/useIsMobile.ts`
- `src/hooks/useIntersectionObserver.ts`
- `src/app/(public)/page.tsx`

### 4.8 數據圖表呈現

| 項目 | 實作內容 |
|------|----------|
| **圖表庫** | Recharts（React 原生元件化 API） |
| **載入方式** | `dynamic()` + `ssr: false` + `loading: ChartSkeleton` |
| **RevenueChart** | Area Chart：30 天營收趨勢（accent-cyan 漸層） |
| **OrdersChart** | Bar Chart：30 天訂單量（accent-purple） |
| **資料來源** | Server Component 直接查 Prisma（零 API 呼叫、零 waterfall） |
| **主題整合** | 使用 Tailwind 定義的色彩系統（#22d3ee、#a855f7、#27272a、#52525b） |
| **Tooltip** | 自訂暗色主題樣式，與整體設計一致 |

**關鍵檔案：**
- `src/components/admin/charts/RevenueChart.tsx`
- `src/components/admin/charts/OrdersChart.tsx`
- `src/app/admin/page.tsx`

### 4.9 Chatbot 系統整合

| 項目 | 實作內容 |
|------|----------|
| **AI 模型** | OpenAI GPT-4o-mini via Vercel AI SDK v6 |
| **Streaming** | `streamText()` → `toTextStreamResponse()`（即時串流顯示） |
| **System Prompt** | 限定 easecity 業務範圍、專業友善語氣、同語言回覆、300 字限制 |
| **Rate Limiting** | 每 IP 每分鐘 20 次 |
| **對話儲存** | `onFinish` callback 將 assistant 回覆存入 `Message` 表（含 token count） |
| **前端** | 浮動視窗（Framer Motion 動畫）、自動滾動、打字指示器、錯誤顯示 |
| **Transport** | AI SDK v6 `DefaultChatTransport({ api: '/api/chat' })` |
| **安全** | API Key 僅在 Server-side 使用，Client 端不接觸 |
| **降級處理** | 無 OPENAI_API_KEY 時回傳 503 而非 crash |

**關鍵檔案：**
- `src/app/api/chat/route.ts`
- `src/components/chat/ChatWidget.tsx`

---

## 5. 資料庫設計

### 5.1 Schema（8 張表）

```
users                          ← 會員資料 + RBAC
├── id: cuid (PK)
├── email: unique
├── emailVerified: DateTime?
├── hashedPassword: String?     ← OAuth 用戶無密碼
├── name, image: String?
├── role: String (SUPER_ADMIN / ADMIN / MEMBER)
├── status: String (ACTIVE / SUSPENDED / DELETED)
├── createdAt, updatedAt
│
├── → accounts[]               ← OAuth 帳號連結（NextAuth 標準）
├── → sessions[]               ← Session 管理
├── → orders[]
├── → conversations[]
└── → auditLogs[]

accounts                       ← NextAuth OAuth Adapter
├── provider + providerAccountId (unique)
├── access_token, refresh_token, expires_at
└── → user (FK, cascade delete)

sessions                       ← NextAuth Session
├── sessionToken: unique
└── → user (FK, cascade delete)

verification_tokens             ← Email 驗證
├── identifier + token (unique)
└── expires

orders                         ← 訂單
├── id: cuid (PK)
├── userId (FK → users)
├── stripeSessionId: unique?
├── stripePaymentIntentId: String?
├── status: created / pending_payment / paid / fulfilled / completed / expired / cancelled / refunded
├── amount: Int (cents)
├── currency, items (JSON), metadata (JSON)
└── createdAt, updatedAt

contact_submissions            ← 聯繫表單
├── id: cuid (PK)
├── name, email, company?, subject, message
├── status: new / read / replied / archived
├── ipAddress
└── createdAt

conversations                  ← Chatbot 對話
├── id: cuid (PK)
├── userId? (FK → users)
├── sessionId? (匿名追蹤)
├── title, status, metadata
├── → messages[]
└── createdAt, updatedAt

messages                       ← 對話訊息
├── id: cuid (PK)
├── conversationId (FK, cascade delete)
├── role: user / assistant / system
├── content, tokenCount?
└── createdAt

audit_logs                     ← 操作日誌
├── id: cuid (PK)
├── userId (FK → users)
├── action: String (e.g., 'user.update')
├── targetType, targetId
├── changes: JSON (before/after diff)
├── ipAddress, userAgent
└── createdAt
```

### 5.2 種子資料

```bash
npm run db:seed
```

| 帳號 | 密碼 | 角色 |
|------|------|------|
| admin@easecity.com | Admin123! | SUPER_ADMIN |
| user@easecity.com | User1234! | MEMBER |

---

## 6. 安全性設計

### 6.1 已實作的安全措施

| 威脅 | 防禦 | 實作位置 |
|------|------|----------|
| **XSS** | React 自動 escape + `escapeHtml()` 郵件模板 | 元件層 + email/send.ts |
| **Clickjacking** | `X-Frame-Options: DENY` | Middleware + next.config.mjs |
| **MIME Sniffing** | `X-Content-Type-Options: nosniff` | Middleware + next.config.mjs |
| **HSTS** | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | next.config.mjs |
| **Info Leak** | `poweredByHeader: false` | next.config.mjs |
| **Referrer** | `strict-origin-when-cross-origin` | Middleware |
| **Device APIs** | `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Middleware |
| **Brute Force** | IP-based Rate Limiting（Login: 5/15min, Register: 5/15min, Contact: 3/min） | rate-limit.ts |
| **SQL Injection** | Prisma ORM 參數化查詢 | 所有 DB 操作 |
| **Password** | bcryptjs 12 rounds | auth.ts / register route |
| **Session** | JWT HttpOnly Cookie（NextAuth 預設） | auth.ts |
| **Webhook 偽造** | `stripe.webhooks.constructEvent()` 簽章驗證 | webhook route |
| **API Key 外洩** | 所有 Secret 僅 Server-side，lazy init 防 build crash | stripe.ts / send.ts |
| **帳號枯竭** | 重複 email 檢查 + 泛化錯誤訊息 | register route |

### 6.2 Middleware 資料流

```
請求進入 → middleware.ts
  │
  ├── 1. 注入安全 Headers（所有路由）
  ├── 2. API 路由 → 設定 CORS Headers → OPTIONS 直接回傳 204
  ├── 3. /dashboard/* → JWT 驗證 → 無 token → 重導 /login?callbackUrl=...
  ├── 4. /admin/* → JWT 驗證 → 無 token → 重導 /login
  │                           → role ≠ ADMIN/SUPER_ADMIN → 重導 /dashboard
  └── 5. /login, /register → 已登入 → 重導 /dashboard
```

---

## 7. SEO 與效能優化

### 7.1 SEO

| 項目 | 實作 |
|------|------|
| **Metadata** | 根 Layout 設定完整 metadata（title template、description、keywords、OpenGraph、Twitter Card、robots） |
| **Sitemap** | `src/app/sitemap.ts` 動態生成，含 priority 和 changeFrequency |
| **Robots** | `src/app/robots.ts` 屏蔽 `/admin/`、`/dashboard/`、`/api/` |
| **JSON-LD** | Organization + WebSite 結構化資料注入 `<body>` |
| **語義 HTML** | 正確的 heading 層級、語義標籤 |
| **字體** | `next/font/google` 自動優化（Inter + Space Grotesk，display: swap） |

### 7.2 效能

| 項目 | 實作 |
|------|------|
| **Package Imports** | `optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts']` |
| **圖片** | `formats: ['image/avif', 'image/webp']` |
| **壓縮** | `compress: true` |
| **動態載入** | Recharts 圖表 `dynamic()` + `ssr: false`（減少首屏 JS） |
| **Server Components** | 頁面層級預設 Server Component，最大化 SSR/SSG |
| **Client 邊界** | `'use client'` 僅在葉節點元件，不在頁面層級 |
| **動畫效能** | 僅使用 `transform` + `opacity`（GPU 合成）；`useReducedMotion` 停用動畫 |
| **行動裝置** | 視差效果 768px 以下自動停用 |

---

## 8. 測試策略

### 8.1 Playwright E2E 測試

**設定：** `playwright.config.ts`

- 測試環境：Desktop Chrome + iPhone 14
- 自動啟動 dev server
- CI 模式：禁止 `.only()`、失敗重試 2 次

**測試案例（19 項）：**

| 檔案 | 測試 | 數量 |
|------|------|------|
| `navigation.spec.ts` | 首頁載入、頁面導航（about/services/contact）、404 頁面、sitemap.xml、robots.txt | 7 |
| `contact-form.spec.ts` | 欄位渲染、必填驗證、表單提交成功 | 3 |
| `auth.spec.ts` | 登入/註冊頁渲染、頁面間導航、Dashboard 重導、Admin 重導 | 5 |
| `api.spec.ts` | Health endpoint、Input validation、Rate Limiting、認證保護 | 4 |

**執行：**

```bash
npx playwright install    # 首次安裝瀏覽器
npm run test:e2e          # CLI 執行
npm run test:e2e:ui       # UI 模式
```

---

## 9. 開發階段實作紀錄

### Phase 1：核心基礎 ✅

| 任務 | 狀態 |
|------|------|
| 安裝基礎套件（Prisma, Zod, Resend, bcryptjs） | ✅ 完成 |
| 建立 .env.example + .env.local | ✅ 完成 |
| Prisma Schema 設計（8 張表）+ Migration | ✅ 完成 |
| API 基礎架構（Response / Error Handler / Rate Limiter） | ✅ 完成 |
| Route Groups 路由重構（public / auth / admin） | ✅ 完成 |
| Middleware（安全 Headers + CORS） | ✅ 完成 |
| 表單寄信（Resend + Zod + DB 儲存） | ✅ 完成 |
| 錯誤邊界（error.tsx / not-found.tsx / loading.tsx） | ✅ 完成 |
| 動畫系統升級（useReducedMotion） | ✅ 完成 |

### Phase 2：會員與金流 ✅

| 任務 | 狀態 |
|------|------|
| NextAuth 整合（Credentials + Prisma Adapter + JWT） | ✅ 完成 |
| 會員註冊/登入頁面（Framer Motion 動畫） | ✅ 完成 |
| Middleware JWT 驗證 + RBAC 路由保護 | ✅ 完成 |
| Stripe Checkout Session（一次性付款） | ✅ 完成 |
| Stripe Webhook Handler + 訂單狀態機 | ✅ 完成 |
| 會員 Dashboard（SSR 訂單統計 + 設定頁） | ✅ 完成 |
| 付款成功/失敗頁面 | ✅ 完成 |
| Navbar Auth 狀態判斷 | ✅ 完成 |

### Phase 3：進階體驗 ✅

| 任務 | 狀態 |
|------|------|
| 後台 Dashboard（統計 + Recharts 圖表） | ✅ 完成 |
| 用戶管理 CRUD + 角色管理 + Audit Log | ✅ 完成 |
| 訂單管理 CRUD（詳情含 Stripe ID） | ✅ 完成 |
| 聯繫表單管理 + 操作日誌頁面 | ✅ 完成 |
| Chatbot AI（OpenAI Streaming + 浮動視窗） | ✅ 完成 |
| 對話記錄 DB 儲存 | ✅ 完成 |
| 滾動視差效果整合（首頁 3 區塊） | ✅ 完成 |

### Phase 4：優化與擴展 ✅

| 任務 | 狀態 |
|------|------|
| SEO（Sitemap + robots.txt + JSON-LD） | ✅ 完成 |
| next.config 升級（HSTS + Security Headers + Image Optimization） | ✅ 完成 |
| API Versioning（/api/v1/health） | ✅ 完成 |
| Stripe 訂閱制支援 + Billing Portal | ✅ 完成 |
| Playwright E2E 測試（4 檔案 19 項） | ✅ 完成 |
| 錯誤追蹤模組（可替換 Sentry） | ✅ 完成 |
| DB Seed（Admin + Demo User） | ✅ 完成 |

---

## 10. 環境變數與部署指南

### 10.1 環境變數

```bash
# ── Database ──
DATABASE_URL="file:./dev.db"           # 開發用 SQLite
# DATABASE_URL="postgresql://..."      # 生產用 PostgreSQL

# ── Authentication ──
NEXTAUTH_SECRET=<隨機字串>             # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000     # 生產環境改為正式域名

# ── Email ──
RESEND_API_KEY=re_...                  # https://resend.com/api-keys
CONTACT_EMAIL_TO=hello@easecity.com

# ── Security ──
RECAPTCHA_SECRET_KEY=                  # Google reCAPTCHA（選用）
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=        # 前端用

# ── Stripe ──
STRIPE_SECRET_KEY=sk_...              # https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...       # stripe listen --forward-to localhost:3000/api/payment/webhook

# ── Chatbot ──
OPENAI_API_KEY=sk-...                 # https://platform.openai.com/api-keys
```

### 10.2 本地開發快速開始

```bash
git clone <repo>
cd easecity-clean2
npm install                 # 安裝依賴 + 自動 prisma generate
npm run db:migrate          # 建立 SQLite 資料庫
npm run db:seed             # 建立測試帳號
npm run dev                 # 啟動 http://localhost:3000

# 測試帳號
# Admin:  admin@easecity.com / Admin123!
# Member: user@easecity.com  / User1234!
```

### 10.3 生產部署（Vercel）

1. 推送程式碼到 GitHub
2. 在 Vercel 導入專案
3. 設定環境變數（Dashboard → Settings → Environment Variables）
4. 將 `DATABASE_URL` 改為 PostgreSQL（Vercel Postgres / Neon / Supabase）
5. 更新 `prisma/schema.prisma` 的 `provider` 為 `"postgresql"`
6. 設定 Stripe Webhook endpoint 為 `https://your-domain.com/api/payment/webhook`

### 10.4 資料庫遷移（SQLite → PostgreSQL）

1. 修改 `prisma/schema.prisma`：`provider = "postgresql"`
2. 設定 `DATABASE_URL` 為 PostgreSQL 連線字串
3. 執行 `npx prisma migrate dev --name switch-to-postgres`
4. 執行 `npm run db:seed`

---

> **文件結束**  
> 本文件為 easecity 專案 Phase 1–4 完整實作紀錄。  
> 所有功能模組均已通過 production build（31 路由，零錯誤）。
