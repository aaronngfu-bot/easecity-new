# EaseCity / EC-Share 專案現況

- 產出日期：2026-05-20
- 專案版本：`0.1.0`（來源：`package.json`）
- 掃描範圍：目前工作區的應用程式與文件檔案，排除 `node_modules/`、`.git/`、`.next/`、`dist/`、`playwright-report/`、`test-results/`、`.agents/` 等依賴、生成物與代理工具資料夾。
- 安全邊界：已記錄 `.env`、`.env.local` 存在，但未讀取內容；環境變數分析以 `.env.example`、`backend-handoff/ENVIRONMENT_VARIABLES.md` 與 `docs_legacy/STAGING_ENV_CHECKLIST.md` 為準。

## 掃描摘要

本專案是以 Next.js App Router 建置的全端 Web App，承載 easecity 行銷網站、EC-Share 會員/後台、桌面端授權 API、Stripe 訂閱與 webhook、聯絡表單與 AI chatbot；核心入口分布於 `src/app/`、`src/app/api/`、`src/app/webhooks/stripe/route.ts`、`src/actions/stripe.ts`，資料層以 `prisma/schema.prisma` 為單一 schema 來源。

量化快照如下，統計口徑同上方掃描範圍，文字行數包含 TypeScript、Markdown、JSON、CSS、Prisma、SQL、設定檔，不等於有效業務 SLOC；`.env` 與 `.env.local` 未被讀取計行。主要佐證為 `package.json`、`src/`、`prisma/`、`docs/`、`backend-handoff/BACKEND_HANDOFF.md`。

| 指標 | 數量 | 佐證 |
|---|---:|---|
| 應用相關檔案 | 219 | `src/`, `e2e/`, `docs/`, `prisma/`, `scripts/dev/`, `.cursor/`, root config |
| 可讀文字總行數 | 38,298 | 同上，排除依賴/生成物/secret 實值 |
| `src/` 檔案 / 行數 | 156 / 19,446 | `src/app/`, `src/components/`, `src/lib/` |
| App Router `page.tsx` | 28 | `src/app/**/page.tsx` |
| Route handler | 27 | `src/app/api/**/route.ts`, `src/app/webhooks/stripe/route.ts` |
| UI components | 58 | `src/components/**/*.tsx` |
| shared backend libs | 21 | `src/lib/**/*.ts` |
| E2E spec | 4 檔 / 22 tests | `e2e/api.spec.ts`, `e2e/auth.spec.ts`, `e2e/contact-form.spec.ts`, `e2e/navigation.spec.ts` |
| Prisma models | 16 | `prisma/schema.prisma` |
| Prisma migrations | 2 個 migration + lock/README | `prisma/migrations/` |
| docs | 12 | `docs/*.md` |
| backend handoff docs | 4 | `backend-handoff/` |

目前 `git status --short` 顯示 `backend-handoff/` 為未追蹤資料夾；該目錄包含後端遷移說明與 API/ENV 文件，內容宣告不含 secrets，見 `backend-handoff/BACKEND_HANDOFF.md`。

## 1. 專案基本資訊

專案名稱為 `easecity`，版本 `0.1.0`，`private: true`；專案用途是 EaseCity / EC-Share 的 Web 與 backend foundation，產品定位可從 `src/app/layout.tsx` 的 metadata「Stream Control Infrastructure」、`docs/PROGRESS.md` 的 EC-Share 進度、`backend-handoff/BACKEND_HANDOFF.md` 的遷移摘要交叉確認。

專案類型是 Next.js 14 App Router 全端 Web App / API monolith，不是 monorepo；Web pages、Route Handlers、Server Actions、Prisma schema 與 Playwright E2E 都在同一 repo 中，主要程式碼集中於 `src/`、資料層於 `prisma/`、測試於 `e2e/`、文件於 `docs/` 與 `backend-handoff/`。

主要語言與框架如下，版本以 `package.json` 為準，實際用法可於 `src/app/`、`src/lib/`、`tailwind.config.ts`、`playwright.config.ts`、`prisma/schema.prisma` 看到。

| 層級 | 技術 | 版本 / 狀態 | 佐證 |
|---|---|---:|---|
| Runtime / framework | Next.js App Router | `14.2.35` | `package.json`, `src/app/` |
| UI | React / React DOM | `^18` | `package.json`, `src/components/` |
| Language | TypeScript | `^5`, `strict: true` | `tsconfig.json` |
| Styling | Tailwind CSS | `^3.4.1` | `tailwind.config.ts`, `src/app/globals.css` |
| ORM | Prisma | `^6.19.3` | `package.json`, `prisma/schema.prisma` |
| Database | PostgreSQL | Prisma datasource | `prisma/schema.prisma` |
| Web auth | NextAuth | `^4.24.13` | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` |
| Payments | Stripe | `^21.0.1` | `src/actions/stripe.ts`, `src/lib/stripe-webhook.ts` |
| Validation | Zod | `^4.3.6` | `src/lib/validations/`, `src/app/api/chat/route.ts` |
| Tests | Playwright | `^1.59.0` | `playwright.config.ts`, `e2e/` |

套件管理工具是 npm，依據 `package-lock.json` 與 `package.json` 判定；目前 `package.json` 有 17 個 scripts、23 個 production dependencies、12 個 devDependencies。重點 production 依賴包含 `next`、`react`、`@prisma/client`、`next-auth`、`stripe`、`resend`、`@upstash/redis`、`ai`、`@ai-sdk/openai`、`zod`、`bcryptjs`、`@marsidev/react-turnstile`；dev 依賴包含 `@playwright/test`、`typescript`、`eslint`、`eslint-config-next`、`tailwindcss`、`postcss`、`tsx`。

## 2. 專案架構

整體架構是模組化全端 monolith / layered architecture：`src/app/` 負責 App Router 頁面、layouts 與 route handlers；`src/components/` 負責 UI；`src/lib/` 承載後端核心邏輯、API envelope、auth、license、Stripe、email、rate limit；`src/actions/stripe.ts` 承載 Stripe Server Actions；`prisma/schema.prisma` 與 migrations 負責資料層。這不是嚴格 Clean Architecture，但已把 route handler 與可重用 domain/service libs 部分分離。

主要目錄職責如下，來源為實際檔案布局與 `backend-handoff/BACKEND_HANDOFF.md` 的「Backend Structure」清單。

| 路徑 | 職責 |
|---|---|
| `src/app/` | Next.js App Router：公開頁、auth 頁、admin 頁、API routes、webhooks、SEO route |
| `src/app/(public)/` | 行銷頁、pricing、download、dashboard、payment result、legal pages |
| `src/app/(auth)/` | `/login`、`/register` 與 auth layout |
| `src/app/admin/` | 管理後台 pages 與 layout |
| `src/app/api/` | NextAuth、web register、admin API、contact、chat、legacy payment、EC-Share v1 API |
| `src/app/webhooks/stripe/` | Stripe canonical webhook route |
| `src/components/` | UI component library，含 home/pricing/contact/admin/chart/chat/layout/shared/ui |
| `src/context/` | `LanguageProvider` 與 client i18n 狀態 |
| `src/i18n/` | `translations.ts`，目前 `en` / `zh` |
| `src/lib/` | Prisma singleton、auth、license JWT、Stripe、email、rate limit、API response、validation |
| `src/actions/` | Server Actions，目前為 Stripe checkout / billing portal |
| `prisma/` | PostgreSQL schema、migrations、seed |
| `e2e/` | Playwright E2E / API smoke tests |
| `scripts/dev/` | env check、license key、Stripe catalog verify、API smoke |
| `docs/` | 產品、API、roadmap、dashboard、progress 等活文件 |
| `docs_legacy/` | staging checklist 舊版/操作文件 |
| `backend-handoff/` | 後端遷移 handoff，目前未追蹤於 git |

主要 entry points 是 `src/app/layout.tsx`（全站 metadata、font、SessionProvider、LanguageProvider）、`src/middleware.ts`（dashboard/admin/auth route protection 與安全 headers）、`src/app/(public)/layout.tsx`（公開站 Navbar/Footer/ChatWidget）、`src/app/(auth)/layout.tsx`、`src/app/admin/layout.tsx`、`src/app/api/**/route.ts`、`src/app/webhooks/stripe/route.ts`、`src/actions/stripe.ts`。

主要路由分三類。公開頁在 `src/app/(public)/`，包含 `/`、`/ec-share`、`/download`、`/pricing`、`/services`、`/about`、`/contact`、`/docs`、`/security`、`/dashboard`、`/dashboard/orders`、`/dashboard/settings`、`/payment/success`、`/payment/cancel`；auth 頁在 `src/app/(auth)/login/page.tsx` 與 `src/app/(auth)/register/page.tsx`；admin 頁在 `src/app/admin/`，包含 users、orders、contacts、logs 等。

API surface 目前共有 27 個 route handlers。EC-Share desktop-facing v1 API 在 `src/app/api/v1/`，包含 health、auth register/login/logout/email OTP、license activate/refresh/heartbeat/deactivate/jwks、account me/change-email/devices、download latest-manifest；Web/Admin API 包含 `src/app/api/auth/[...nextauth]/route.ts`、`src/app/api/auth/register/route.ts`、`src/app/api/contact/route.ts`、`src/app/api/chat/route.ts`、`src/app/api/admin/stats/route.ts`、`src/app/api/admin/users/[id]/route.ts`、legacy payment routes 與 `src/app/webhooks/stripe/route.ts`。

設定檔總覽如下：`package.json` 定義 scripts 與 dependencies；`tsconfig.json` 啟用 strict 並設定 `@/*` alias；`next.config.mjs` 設定 security headers、`optimizePackageImports`、image formats、compression、移除 powered-by header；`.eslintrc.json` 使用 `next/core-web-vitals`；`tailwind.config.ts` 定義 easecity 語意色、字體、動畫；`playwright.config.ts` 定義 Chromium/mobile projects 與測試 server；`.env.example` 與 `docs_legacy/STAGING_ENV_CHECKLIST.md` 定義部署環境變數。

## 3. 核心功能模組

Web 認證模組使用 NextAuth JWT session，`src/lib/auth.ts` 設定 Credentials Provider、條件式 Google Provider、PrismaAdapter、7 天 session maxAge，並把 `session.user.id` 與 `session.user.role` 放入 session；`src/middleware.ts` 依 JWT 保護 `/dashboard`、`/admin`，並要求 admin role 為 `ADMIN` 或 `SUPER_ADMIN`。

EC-Share desktop 授權模組以自訂 Ed25519 license JWT 為中心。`src/lib/license-jwt.ts` 定義 tier、features、max devices、issuer/audience、簽章與驗證；`src/lib/ec-share-license.ts` 解析 user subscription、org subscription、trial 狀態並 upsert `Device`；`src/lib/license-jwt-revocation.ts` 透過 Upstash Redis deny-list 撤銷 token，未設定 Redis 時為 no-op。

Stripe 訂閱與 entitlement 模組由 `src/actions/stripe.ts` 發起 Checkout / Billing Portal，`src/lib/stripe-catalog.ts` 管理 price allowlist、tier 與 seats，`src/lib/stripe-webhook.ts` 驗證 webhook signature、處理 subscription / invoice / checkout / refund 事件，並以 `StripeWebhookEvent` model 做 event idempotency；canonical webhook path 是 `src/app/webhooks/stripe/route.ts`，legacy path 是 `src/app/api/payment/webhook/route.ts`。

聯絡表單模組由 `src/components/contact/ContactForm.tsx` 發送至 `src/app/api/contact/route.ts`，route 使用 `src/lib/validations/contact.ts` 做 Zod 驗證、`src/lib/rate-limit.ts` 做 IP 限流、`prisma.contactSubmission.create` 儲存資料，若存在 `RESEND_API_KEY` 則透過 `src/lib/email/send.ts` 寄信。

AI Chatbot 模組由 `src/components/chat/ChatWidget.tsx` 呼叫 `src/app/api/chat/route.ts`，後端使用 Vercel AI SDK 的 `generateText` 與 OpenRouter-compatible provider，內建多個 free model fallback，並可將已登入使用者的 conversation/message 寫入 `Conversation` 與 `Message` models。

Admin 後台模組在 `src/app/admin/`，包含 users/orders/contacts/logs dashboard，資料主要由 Server Components 直接透過 `prisma` 讀取；互動 API 包含 `src/app/api/admin/stats/route.ts` 與 `src/app/api/admin/users/[id]/route.ts`，角色檢查需與 `src/middleware.ts` 與 `src/lib/permissions.ts` 對齊。

i18n 模組目前是 client-side provider：`src/context/LanguageContext.tsx` 使用 localStorage key `easecity-lang`，語言型別為 `en | zh`，文案集中在 `src/i18n/translations.ts`；`src/app/layout.tsx` 初始 `lang="en"`，切換時會將 document lang 設為 `zh-HK` 或 `en`。

模組間資料流可概括為：Browser / Desktop client 進入 `src/app/**/page.tsx` 或 `src/app/api/**/route.ts`，API route 使用 Zod / auth / rate-limit 驗證，呼叫 `src/lib/*` domain/service helper，經由 `src/lib/db.ts` 的 Prisma singleton 存取 PostgreSQL，必要時呼叫 Stripe / Resend / Upstash / OpenRouter，最後用 `src/lib/api-response.ts` 的 `{ success, data, meta }` envelope 或特定 third-party webhook response 回傳。

第三方服務整合如下，變數來源以 `.env.example` 與 `docs_legacy/STAGING_ENV_CHECKLIST.md` 為準。

| 整合 | 用途 | 主要檔案 |
|---|---|---|
| PostgreSQL | 主資料庫 | `prisma/schema.prisma`, `src/lib/db.ts` |
| Prisma | ORM / migrations / seed | `prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` |
| NextAuth | Web session / OAuth | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` |
| Stripe | Checkout, Billing Portal, Webhooks | `src/actions/stripe.ts`, `src/lib/stripe-webhook.ts`, `src/lib/stripe.ts` |
| Resend | OTP / contact email | `src/lib/email/send.ts`, `.env.example` |
| Upstash Redis | Rate limit / JWT deny-list | `src/lib/rate-limit.ts`, `src/lib/license-jwt-revocation.ts` |
| Cloudflare Turnstile | Register anti-bot | `src/app/(auth)/register/page.tsx`, `.env.example` |
| OpenRouter / AI SDK | Chatbot | `src/app/api/chat/route.ts` |
| External CDN | EC-Share download manifest | `src/app/api/v1/download/latest-manifest/route.ts`, `.env.example` |

## 4. 資料層

資料庫類型是 PostgreSQL，ORM 是 Prisma；datasource 使用 `DATABASE_URL` 與 `DIRECT_URL`，client 由 `src/lib/db.ts` 暴露 singleton，避免在 dev hot reload 中重複建立 PrismaClient，schema 來源為 `prisma/schema.prisma`。

`prisma/schema.prisma` 目前有 16 個 models，可分為認證、組織、商業、授權、互動與稽核。認證包含 `User`、`Account`、`Session`、`VerificationToken`、`EmailOtpChallenge`；組織包含 `Organization`、`OrgMember`；商業與授權包含 `Order`、`Subscription`、`StripeWebhookEvent`、`Trial`、`Device`；互動與營運包含 `ContactSubmission`、`Conversation`、`Message`、`AuditLog`。

多個狀態/角色欄位目前用 `String` 搭配註解表示枚舉，例如 `User.role`、`User.status`、`OrgMember.role`、`Order.status`、`Subscription.status`、`Conversation.status`；這與 `.cursor/rules/database-prisma.mdc` 中「role 字串需與程式檢查一致」相符，但 DB 層沒有 native enum 約束。

部分欄位以 `String` 儲存 JSON，例如 `Order.items`、`Order.metadata`、`Conversation.metadata`、`AuditLog.changes`，讀寫時需由應用層 `JSON.parse` / `JSON.stringify` 並處理錯誤；這在 `prisma/schema.prisma` 與 `.cursor/rules/database-prisma.mdc` 均有佐證。

Migration 狀態：`prisma/migrations/20260427172000_ec_share_m2_foundation/migration.sql` 是 EC-Share M2 foundation；`prisma/migrations/20260505041000_stripe_webhook_events/migration.sql` 新增 webhook idempotency 與 OTP purpose/index patch；`prisma/migrations/README.md` 說明 existing Neon DB 的 baseline / `P3005` resolve 流程；`docs/PROGRESS.md` 記錄 Neon 已 `migrate resolve`、`migrate deploy`，且 schema up to date。

Seed 狀態：`prisma/seed.ts` upsert `admin@easecity.com`（`SUPER_ADMIN`）與 `user@easecity.com`（`MEMBER`），bcrypt rounds 為 12；此檔同時在 console 輸出固定 demo 密碼 `Admin123!` / `User1234!`，僅適合作為本機開發 seed，不應在 production 直接執行。

## 5. 測試與品質

測試框架目前只有 Playwright，設定在 `playwright.config.ts`，testDir 為 `./e2e`，projects 包含 Desktop Chrome 與 iPhone 14 mobile；E2E server 由 `npm run dev` 啟動，並在測試環境清空 `RESEND_API_KEY` 與 Upstash env，避免寄信或消耗真實 rate-limit state。

測試檔分布為 4 檔 22 個 `test()`：`e2e/api.spec.ts` 有 7 個、`e2e/auth.spec.ts` 有 5 個、`e2e/contact-form.spec.ts` 有 3 個、`e2e/navigation.spec.ts` 有 7 個；但 `package.json` 的 `npm test` 只執行 `e2e/api.spec.ts --project=chromium`，因此預設測試覆蓋 7 個 API baseline case，其餘需要手動 `npm run test:e2e`。

目前未找到 Jest、Vitest、unit test、coverage script、Istanbul/c8/nyc 設定；也沒有 coverage threshold。品質閘道主要依靠 `npm run lint`、`npm run build`、`npm test`、`npm run check:staging`，相關 scripts 定義在 `package.json`，最近一次文件化驗證見 `docs/PROGRESS.md`，記錄 `lint` clean、`build` success、`npm test` 7/7 passing。

Linting 使用 `.eslintrc.json` 的 `next/core-web-vitals`；TypeScript 在 `tsconfig.json` 中啟用 `strict: true` 與 `@/*` alias；Formatting 方面未看到 Prettier、format script、Husky 或 lint-staged 設定，因此格式一致性目前主要依賴 Next lint、TypeScript 與人工/編輯器。

CI/CD pipeline 設定目前未發現 `.github/workflows/`、`vercel.json`、Dockerfile 或 docker-compose；部署驗證流程以 `docs_legacy/STAGING_ENV_CHECKLIST.md` 與 `package.json` 的 `check:staging` script 為主，屬於文件化的手動/半自動 staging gate。

## 6. 部署與基礎設施

部署方式從 `backend-handoff/BACKEND_HANDOFF.md`、`docs/API_CONTRACT.md` 與 `docs_legacy/STAGING_ENV_CHECKLIST.md` 推斷為 Vercel / Node.js route handlers / server actions，加 PostgreSQL（文件提及 Neon）與外部 CDN `dl.easecity.hk`；repo 內目前沒有 `vercel.json`，所以實際 Vercel project 設定不在版本庫中。

容器化設定目前不存在：未找到 `Dockerfile` 或 `docker-compose*.yml`；runtime 以 Next.js + Node route handlers 為主，`backend-handoff/BACKEND_HANDOFF.md` 也明確指出沒有 custom long-running server、cron、object storage SDK 或 backend WebSocket server。

環境區分已透過文件與 env template 表達。`.env.example` 包含 Database、NextAuth、Google OAuth、License JWT、EC-Share download manifest、Resend、reCAPTCHA、Upstash、Stripe、OpenRouter、Turnstile；`docs_legacy/STAGING_ENV_CHECKLIST.md` 描述 staging / production 的 env 填寫、`npm run ecshare:env-check`、`npx prisma migrate deploy`、`npm run check:staging`、health check 與 API smoke。

重要硬編碼/預設網域需要部署前確認：`src/lib/license-jwt.ts` 預設 issuer 為 `https://api.easecity.hk`；`.env.example` 預設 download manifest 為 `https://dl.easecity.hk/ec-share/windows/stable/latest.json`；`src/app/layout.tsx` OpenGraph URL 為 `https://easecity.com`；`docs/API_CONTRACT.md` 提到 `api.easecity.hk`、`ecshare.easecity.hk`、`dl.easecity.hk`；`backend-handoff/BACKEND_HANDOFF.md` 也列出需替換或確認的 legacy URLs。

## 7. 現況評估

程式碼品質整體有清楚分層與命名慣例：App Router route groups、`src/lib/*` 後端 helpers、`src/components/*` UI folders、`src/lib/api-response.ts` envelope、`src/lib/api-handler.ts` error wrapper、`src/lib/validations/*` Zod schemas 都具一致性。`src/middleware.ts` 與 `.cursor/rules/auth-middleware.mdc` 對 dashboard/admin 權限行為也有明確規則。

主要技術債之一是測試金字塔偏薄：目前只有 Playwright E2E，沒有 unit/integration tests，也沒有 coverage 門檻；`npm test` 只跑 7 個 API tests，無法覆蓋 58 個 UI components、21 個 backend libs 與 Stripe/license 的多數 edge cases。佐證為 `package.json`、`playwright.config.ts`、`e2e/`。

第二個技術債是 production observability 尚未完成。`src/lib/error-tracking.ts` 目前是 lightweight wrapper，production 仍以 `console.error` / `console.log` 為主，且檔內有 2 個 TODO 指向 Sentry 或類似服務；這會影響 webhook、payment、license API 的實際事故追蹤。

第三個風險是 Redis 為 production 必要但程式允許 fallback。`src/lib/rate-limit.ts` 在沒有 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` 時使用 in-memory Map；`src/lib/license-jwt-revocation.ts` 在 Redis 未設定時 revocation no-op。這對 serverless / 多 instance production 不可靠，`docs_legacy/STAGING_ENV_CHECKLIST.md` 也明確說明未設定 Upstash 僅適合單機/開發。

第四個風險是 Stripe webhook 有 canonical 與 legacy 兩個入口：`src/app/webhooks/stripe/route.ts` 與 `src/app/api/payment/webhook/route.ts` 都進入 `handleStripeWebhook`；雖然 `StripeWebhookEvent` 可做 event idempotency，但 production Stripe Dashboard 仍需清楚決定註冊一個或兩個 endpoint、是否共用 webhook secret，避免重複事件、簽章混淆與排錯成本。

第五個風險是安全 header 有基本盤但沒有完整 CSP。`next.config.mjs` 與 `src/middleware.ts` 均設定 `X-Frame-Options`、`X-Content-Type-Options`、`Referrer-Policy`、`Permissions-Policy`，`next.config.mjs` 另有 HSTS；但未看到 Content-Security-Policy，若後續加入第三方 scripts、chat、analytics、Stripe elements、Turnstile，需用 CSP 與 nonce/hash 策略補強。

第六個風險是 schema 層約束偏弱。`prisma/schema.prisma` 使用 String 表示 role/status/tier 等枚舉，且多個 JSON-like 欄位用 String 存放；這降低 migration complexity，但長期會把資料一致性壓在應用層與測試上。

套件安全狀態：`npm audit --omit=dev --json` 目前回報 production dependency 有 2 個 vulnerability nodes，集中在 direct `next` 與 transitive `postcss`，metadata 為 1 moderate、1 high、0 critical，且 Next advisory 清單涵蓋多個 Next.js 14/15 之前版本的 DoS / SSRF / cache poisoning / XSS 風險；audit 顯示 fixAvailable 為 `next@16.2.6` semver-major。佐證為 `package.json` 的 `next@14.2.35` 與 npm audit 輸出。

套件過期狀態：`npm outdated --json` 顯示多個套件有 patch/minor 或 major latest 可升級，例如 `next` latest `16.2.6`、`eslint-config-next` latest `16.2.6`、`@prisma/client` / `prisma` latest `7.8.0`、`react` / `react-dom` latest `19.2.6`、`stripe` latest `22.1.1`、`tailwindcss` latest `4.3.0`；其中 Next 升級會牽涉 App Router、middleware、安全修補與測試回歸，應獨立規劃。

效能觀察：`next.config.mjs` 已對 `lucide-react`、`framer-motion`、`recharts` 做 `optimizePackageImports`，這是正向措施；但 `src/i18n/translations.ts` 約 1,457 行且由 `LanguageProvider` client-side 引入，`framer-motion` 與 `recharts` 也在 UI/admin 中使用，缺少 bundle analyzer，因此首屏 bundle 與 client JS 體積仍需量測後再優化。

文件一致性風險：`docs/API_CONTRACT.md` 提到 `/api/v1/org/*`、`/api/v1/billing/*` 與 product-specific `/api/v1/ec-share/*` 作為 path convention，但目前實作路由尚未包含 org/billing/product-specific API；`prisma/schema.prisma` 已有 `Organization` / `OrgMember`，表示資料模型比 API surface 更超前。

## 8. 待辦與建議

程式碼 TODO/FIXME/HACK 掃描結果：`src/` 內只有 `src/lib/error-tracking.ts` 兩個 TODO，分別是替換為 Sentry exception capture 與 message capture；未在 `src/` 找到 `FIXME`、`HACK`、`XXX`。文件中的 TODO 多為 `docs/FOUNDER_TODO.md` 之類的檔名或進度紀錄，不一定代表程式碼未完成。

已知未完成或待確認功能：`docs/PROGRESS.md` 標記 M2 web/backend foundation partial，production Stripe/DNS/key material、desktop public-key embedding、Redis deny-list production 決策仍是 blocker；`docs/API_CONTRACT.md` 的 org/billing/product-specific APIs 尚未實作；`backend-handoff/BACKEND_HANDOFF.md` 表示 WebSocket/share infrastructure 仍在 roadmap docs，非現有 backend。

短期 Quick Wins 建議如下，均可在現有架構內小步完成。

1. 建立 GitHub Actions 或 Vercel check，跑 `npm run lint`、`npm run build`、`npm test`、`npx prisma validate`，把 `docs_legacy/STAGING_ENV_CHECKLIST.md` 的手動 gate 固化。
2. 調整 `npm test` 或新增 `npm run test:ci`，至少跑完整 `e2e/*.spec.ts` 的 Chromium 專案，而不只 `e2e/api.spec.ts`。
3. 接上 Sentry 或等價 error tracking，替換 `src/lib/error-tracking.ts` 的 TODO，並在 Stripe webhook / license API 中保留 event context。
4. 決定 production Stripe webhook canonical path，只註冊 `src/app/webhooks/stripe/route.ts` 或明確記錄雙入口策略與 secret 策略。
5. 補上 CSP 設計，將 `next.config.mjs` 與 `src/middleware.ts` 的 security headers 統一管理或至少消除重複維護風險。
6. 把 `backend-handoff/` 是否納入版控做決策；若保留，建議加 README 註明 status、owner、是否為遷移暫存。

中長期架構優化方向如下，建議用獨立 PR / migration 計畫處理。

1. 規劃 Next.js 安全升級路線：先評估能否升至 Next 14/15 的安全 patch；若 audit 只能透過 Next 16 修復，需建立 Next 16 upgrade branch，覆蓋 middleware、App Router、Playwright、Stripe webhook、Prisma build。
2. 建立更完整的測試金字塔：對 `src/lib/license-jwt.ts`、`src/lib/ec-share-license.ts`、`src/lib/stripe-webhook.ts`、`src/lib/rate-limit.ts` 增加 unit/integration tests，避免只靠 E2E smoke。
3. 將 role/status/tier 逐步升級為 Prisma enum 或集中常數 + DB check constraints，降低字串漂移風險；涉及 `prisma/schema.prisma`、`src/middleware.ts`、`src/lib/permissions.ts`、license/Stripe entitlement。
4. 釐清 multi-product API 邊界：若 `/api/v1/org/*`、`/api/v1/billing/*` 是近期目標，應補 route handlers、authz model、tests；若只是未來保留，應在 `docs/API_CONTRACT.md` 標記「planned」而非 implied implemented。
5. 對 client bundle 做量測再優化，尤其是 `src/i18n/translations.ts`、`framer-motion`、`recharts`、chat widget；可導入 bundle analyzer 並區分 public marketing、dashboard、admin 的 lazy loading。
6. 將 production readiness 明確化為 checklist + automated smoke：涵蓋 Upstash 必填、Resend verified domain、Stripe webhook idempotency、license JWKS、download manifest、NextAuth callback URL、DNS 與 HSTS/CSP。

## 不確定事項

`.env` 與 `.env.local` 未讀取，因此無法確認本機或 staging 的實際 secrets 是否完整、是否使用 test mode、是否有 production key；可確認的只有 `.env.example` 與 `docs_legacy/STAGING_ENV_CHECKLIST.md` 所列需求。

實際部署平台設定不在 repo 中，未看到 `vercel.json`、GitHub Actions 或 Docker 設定；因此「Vercel + Neon」是從 `backend-handoff/BACKEND_HANDOFF.md`、`docs/API_CONTRACT.md`、`docs/PROGRESS.md` 與 staging checklist 推斷，而非由部署設定檔直接證明。

`docs/PROGRESS.md` 包含較早的 desktop/client/server 歷史紀錄，現有 repo 主要是 Next.js web/backend handoff 後的工作區；本文件以目前實際存在的 Next.js/Prisma/Playwright 檔案為準，歷史 client/server 內容僅作產品進度背景。

`npm audit` 與 `npm outdated` 結果取決於 2026-05-20 執行時 npm registry 狀態；後續 registry advisory 或套件版本更新可能改變安全與過期套件評估。
