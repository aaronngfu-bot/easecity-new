# Staging／正式環境 env 核對清單

對照根目錄 `.env.example` 逐項填寫。**先用 Staging／Stripe test mode 跑通**，再換 Production keys。

---

## 0. 基本流程

| 步驟 | 說明 |
|------|------|
| 1 | 複製 `.env.example` → `.env.local`（本機）或主機環境變數（Vercel 等） |
| 2 | 由下表標記為 **必填** 的變數先填完 |
| 3 | `npm run ecshare:env-check` 檢查 staging 必填 env（只顯示變數名，不輸出 secret 值） |
| 4 | 執行 `npx prisma migrate deploy`（或託管所要求之 migration 指令） |
| 5 | `npm run check:staging` 確認 schema / lint / build / API e2e |
| 6 | 啟動後測：`GET /api/v1/health`，以及下方「驗證指令」 |
| 7 | 跑 EC-Share API smoke：至少 register/login 或 OTP → license refresh → account/me → heartbeat |

### 0a. 既有 Neon DB 的 Prisma baseline 注意

如果 `npx prisma migrate deploy` 回 `P3005`，代表資料庫不是空的但 `_prisma_migrations` 尚未記錄 repo migrations。對目前這個既有 Neon DB，已採用以下安全流程：

```bash
npx prisma migrate resolve --applied 20260427172000_ec_share_m2_foundation
npx prisma migrate deploy
npx prisma migrate status
```

原因：foundation schema 已存在於 DB；第二個 migration 會補 `EmailOtpChallenge.purpose` 與 `StripeWebhookEvent`。新建空 DB 不需要手動 resolve，直接 `npx prisma migrate deploy` 即可。

---

## 1. 資料庫（必填）

| 變數 | 用途 | 備註 |
|------|------|------|
| `DATABASE_URL` | Prisma 連線（連線池 URL 視供應商定義） | 含 `sslmode` 如需 |
| `DIRECT_URL` | Migration／introspection 用直連（若與 pooled 分流） | 若供應商單一 URL 則可與上相同 |

---

## 2. 網站與 Session（Staging 必填）

| 變數 | 用途 | 備註 |
|------|------|------|
| `NEXTAUTH_SECRET` | JWT 加密 | `openssl rand -base64 32` 等產生，**每台環境獨立** |
| `NEXTAUTH_URL` | 站台完整 origin | Staging：`https://your-staging.example`（**無尾斜線**） |

---

## 3. EC-Share 授權 JWT（後端發 desktop 憑證，必填）

| 變數 | 用途 | 備註 |
|------|------|------|
| `LICENSE_JWT_PRIVATE_KEY_PEM` | Ed25519 私鑰（PEM，`\n` 轉義） | `npm run ecshare:key -- --write-env` 或 OpenSSL |
| `LICENSE_JWT_KEY_ID` | JWKS／輪換用識別 | 例如 `2026a` |
| `LICENSE_JWT_ISSUER` | JWT `iss` | 須與桌面端設定一致 |
| `LICENSE_JWT_AUDIENCE` | JWT `aud` | 須與桌面端設定一致 |

---

## 4. Email（Staging 強烈建議；否則無真實收信）

| 變數 | 用途 | 備註 |
|------|------|------|
| `RESEND_API_KEY` | Resend API | 填入後 OTP **不會**走 `dev_otp` |
| `AUTH_EMAIL_FROM` | 寄件人 | **已驗證網域** 的發信身分 |

若不設 `RESEND_API_KEY` 且 `NODE_ENV !== 'production'`：後端仍可回傳 `dev_otp` 方便本機測 API；**Production 請務必設定**，否則無法寄信。

| 選填 | 用途 |
|------|------|
| `CONTACT_EMAIL_TO` | 聯絡表寄達（有設 `RESEND_API_KEY` 時較有用） |

---

## 5. Stripe（Staging 請用 Test keys）

| 變數 | 備註 |
|------|------|
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | Billing → Webhooks → 簽署密鑰（**每個 webhook endpoint 一組**） |
| `NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID` | `price_…` |
| `NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID` | 同上 |
| `NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID` | 同上 |
| `NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID` | 同上 |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID` | 同上 |

若暫無月付／年付專用變數，定價頁會遞補 legacy 的 `STARTER`／`PRO`／`BIZ` Price ID（見 `src/lib/stripe-public-price-ids.ts`）；若實際計費與 UI 標價不符，請在 Stripe 建好各幣別後填滿上表六格。

Stripe Dashboard 中 **每個 Price** 建議設定 metadata：**`product=ec_share`**、**`tier=pro`**（或 business／enterprise）。

Stripe Tax 請在 Dashboard 啟用；Business Price 的數量語意為至少 3 seats，Enterprise 為至少 50 seats。後端會在 webhook entitlement 中套用這個最低值。

**Webhook URL（擇一或兩個都設定同一密鑰策略）：**

- `https://<你的網域>/webhooks/stripe`（規格對齊用）
- 或相容舊路徑：`/api/payment/webhook`

至少需要訂閱相關事件（如 `checkout.session.completed`、`customer.subscription.*`、`invoice.payment_*`，依 webhook  handler 為準）。

---

## 6. Rate limit（多台 instance／正式強烈建議）

| 變數 | 備註 |
|------|------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | 同上一起建立 |

皆未設定時使用 **程式內記憶體**，僅適合單機／開發。

---

## 7. 註冊防機器人（正式建議開）

| 變數 | 備註 |
|------|------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile 網站金鑰 |
| `TURNSTILE_SECRET_KEY` | Secret |

未設 secret 時，註冊流程中 Turnstile 驗證會 **視為跳過**（僅適合開發）。

---

## 8. 其他選填

| 變數 | 用途 |
|------|------|
| `OPENROUTER_API_KEY` | `/api/chat`；未設定則回 503 |
| `RECAPTCHA_*` | 若有舊表單路徑使用（依實際程式為準） |

---

## 9. 建議驗證指令

```bash
# 建置
npm run build

# 本機 staging readiness 結構檢查（env 缺漏只警告，仍會跑 validate/lint/build/test）
npm run check:staging

# 真正部署前的 env 嚴格檢查（缺必填值會 exit 1）
npm run ecshare:env-check

# 標準 API e2e（會自動啟動本機 dev server）
npm test

# 本機或 Staging URL 可把 BASE_URL 換成環境網址
npm run ecshare:smoke -- --email your+test@example.com

# 非 production 且未設 RESEND_API_KEY 時，dev_otp 會自動完成 OTP flow。
# Native password registration + license lifecycle baseline：
npm run ecshare:smoke -- --email your+smoke@example.com --register-password Password1! --test-license-lifecycle

# 已有帳號時可測 login + activate/heartbeat/deactivate（deactivate 會移除 Device row）：
npm run ecshare:smoke -- --email your+smoke@example.com --login-password Password1! --test-deactivate

# Smoke 需在可連到後端的情境下（已設 OTP／或 dev_otp）；正式應禁用 dev_otp：設 RESEND 且 NODE_ENV=production。
```

另手動核對：

- `npx prisma migrate deploy` 應套用 `20260427172000_ec_share_m2_foundation` 與 `20260505041000_stripe_webhook_events`。
- **Stripe Test Checkout → Webhook → 資料庫 `Subscription`** 是否符合預期的 `product`／`tier`／`seats`。
- `StripeWebhookEvent` 是否記錄 event id；重送同一 event 應回 duplicate success，不應重複產生副作用。

---

## 10. 「已跑通但未代表正式」對照速記

- **dev_otp**：僅在非 production 且未設 Resend 時；上線環境請依賴真實郵件。
- **記憶體 rate limit**：多副本時請換 Upstash。
- **Turnstile 未設定**：勿在公開正式站依賴此狀態。

更新 `.env.example` 時請同步檢視本檢查表是否要增刪項目。
