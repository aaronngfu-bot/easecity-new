# MUPhone / EC-Share — Engineering Changelog

所有從 Cursor 介入到目前狀態的實際改動記錄。
最後更新：2026-08-27

## 2026-08-27 — 服務頁主案例圖與產品頁寬幅圖分離、產品頁圖片精確尺寸、圖片圓角美化

- **`servicesCaseEcShare` 從 `ecShareHero` 拆出**：`ecShareHero` 插槽同時餵給兩處——產品頁標題下方的寬幅圖、以及 services 頁的主案例圖——共用同一張照片時，替換任何一處都會連帶改掉另一處。新增獨立插槽 `servicesCaseEcShare`（`fallback` 沿用原本同一張出貨照片，所以外觀當下不變），`ServicesPageClient.tsx` 的 `cases[0]` 改讀這個新插槽，跟上一輪拆出場景牆插槽是同一個模式。
- **產品頁寬幅圖的精確上傳尺寸**：該圖的 `sizes="100vw"` 是錯的——它包在 `container-max` 裡，內容寬度上限固定在 1360px（1440px 減去左右內距），不管螢幕多寬都不會再長大，`100vw` 卻在告訴 Next.js 的圖片最佳化器「可能需要滿版寬度的圖」。改成 `sizes="(max-width: 767px) 100vw, 1360px"`。同時算出這格圖片實際渲染的精確尺寸（桌面 21:9 最大 1360×583px，手機 4:3 最大約 720×540px），並把「建議至少上傳 2720×1166px（2 倍解析度）」直接寫進 `site-images.ts` 該插槽的 `shape` 說明——後台媒體庫的卡片會原樣顯示這段文字，之後要上傳的人不用再問。順手把 app icon 插槽的說明也補上「建議至少 320×320px」，並修正寬幅圖 `alt` 文字誤用了場景牆第一格的文案（已改成描述 hero 本身的標語）。
- **圖片加圓角美化**：`/ec-share` 的寬幅圖（`.heroPlate`，新增 `border-radius: 0.75rem`）與場景牆每一格（`.pieceFrame`，新增 `border-radius: 0.625rem`，同時套用在照片與尚未拍攝時的文字預留框）原本完全沒有圓角，現在補上。Services 頁的三個案例卡片（`.caseShot`）本來就已經是 `border-radius: 0.625rem`，不需改動。刻意不動 services 頁第一個 section 的滿版寬度圖（`.heroPlate`，撐滿整個視窗寬度）——貼齊視窗邊緣的圖加圓角只會在邊緣留一道空隙，讀起來不像框，像沒對齊。
- 驗證：`tsc --noEmit`、`next lint` 乾淨（`next build` 這次略過——本機 `next dev` 正佔用同一個 `.next` 目錄，跟正式 build 同時跑一定會撞出跟這次改動無關的 `MODULE_NOT_FOUND` chunk 錯誤）。在瀏覽器開 `/ec-share` 與 `/services` 截圖確認：寬幅圖與場景牆都有圓角，services 首屏滿版圖維持直角，主案例圖仍顯示同一張鏡像照片（現在讀自 `servicesCaseEcShare`）。`/admin/media` 確認新插槽「Services case: EC-Share」出現、有獨立的 `Replace` 按鈕與自己的 fallback 路徑、沒有「replaced」標記（代表沒有繼承原 hero 插槽可能已存在的覆寫），且 hero 插槽卡片上顯示新的精確尺寸建議文字。

## 2026-08-27 — 產品動畫重新設計、顯示器鏡像畫面貼齊裝置、斷線不再影響手機自身畫面、blog 進場位移移除、ec-share 場景圖片獨立插槽

- **五個產品動畫重新設計**：`HeroIllustration` 的 news／game／social／youtube／gallery 五個場景（chat 之外的全部）整個重畫。上一版用了很多細節（news 的多行文字列表、game 的虛線巡邏路徑、social 的頭像＋字幕捲動 feed）在這些裝置實際渲染的尺寸下根本看不清楚，讀起來像靜止畫面。新版全部改成單一、放大、清楚的主視覺：news 是一塊在三色間循環淡入淡出的色塊標籤配兩條固定粗字條；game 是三顆依序點亮的星星（連擊計數）加一顆獨立彈跳的寶石；social 拿掉捲動 feed，改成一張靜止相片配愛心爆炸＋擴散光環的雙擊按讚動作；youtube 拿掉看不清的頻道資訊小字；gallery 的放大相片拿掉字幕列。全部維持閉環動畫（第 0 幀＝第 100 幀）。
- **顯示器鏡像畫面貼齊裝置**：中央顯示器每一格鏡像畫面實際上是包在 `<g transform="translate() scale()">` 裡，跟外層的邊框／底色 `<rect>` 用不同機制定位（`transform` 屬性 vs `x`/`y` 屬性）。重新排列時 CSS transition 只加在 `rect` 上，那個 `<g>` 沒有對應規則，於是格子的邊框在 0.4s 內滑動，畫面內容卻瞬間跳到新位置——短暫看起來「畫面跟邊框分開了」。修法：把 `.ec-mon-cell > g` 加進同一組 transition selector，三個部分現在同步移動。
- **斷線不再影響手機自身畫面**：上一版點擊裝置斷線後，外圈裝置會整個變暗＋去色＋顯示「無訊號」X 圖示。這個模型是錯的——裝置本身是訊號來源，不是顯示器的鏡像，斷線只代表顯示器不再鏡像它，裝置自己應該完全不受影響、畫面照常播放。移除了外圈裝置渲染裡所有讀取 `isOn`/`connected` 的邏輯，只剩下 `visibleDevices`（驅動顯示器格線與連接線）還會反應斷線狀態。
- **blog 卡片進場位移**：`.blog-berth` 進場時會從水平位移 22px 的位置滑進最終位置，每張卡依 `--i` 錯開時間；快速滾動時好幾張卡同時處於「滑動中」的狀態，看起來像整條 rail 先往左晃一下才彈回正常位置，而不是刻意設計的進場動作。移除該 transform，卡片現在只靠 opacity 淡入，沒有位置可以位移或彈回。
- **`/ec-share` 場景圖片獨立成自己的插槽**：`site-images.ts` 的 `ecShareHero` 插槽同時餵給三個地方——產品頁標題下的寬幅圖、services 頁的主案例圖、以及產品頁場景牆的「一張桌子，八個即時畫面」那一格——三處共用同一張上傳的照片，換掉任何一處都會連帶改掉另外兩處。新增獨立插槽 `ecShareSceneDesk`（`fallback: null`，跟其他還沒拍的場景一樣），這格現在會先顯示文字組成的預留框，直到後台上傳專屬照片為止，跟 hero 圖完全脫鉤。`SITE_IMAGE_SLOTS` 本來就是後台媒體庫的資料來源，新增插槽不需要改動後台程式碼。
- 驗證：`tsc --noEmit`、`next lint`、`next build`（45 條路由）全部乾淨。用 `getComputedStyle` 確認新增的動畫 class（`ec-game-star`/`ec-game-gem`/`ec-news-thumb`/`ec-like`/`ec-like-ring`）都存在且套上對應動畫名稱。用 `dispatchEvent` 模擬點擊裝置斷線：外圈裝置 class 沒有任何「斷線」樣式、`innerHTML` 確認場景內容仍在（未被替換成無訊號圖示），對應連接線消失，顯示器格線從 2×3 重排成置中的 3+2 且畫面與邊框沒有分離的瞬間。確認所有真實 `.blog-berth` 卡片的 `getComputedStyle(...).transform` 都是 `'none'`。確認 `/ec-share` 第一個場景現在顯示文字預留框而不是 hero 照片，`GET /api/admin/site-images` 也列出 `ecShareSceneDesk` 這個獨立插槽。

## 2026-08-27 — 修復註冊頁 Turnstile 語言切換、首頁 blog skeleton 對齊、產品插圖五個閉環動畫、裝置斷線重排

- **註冊頁 Turnstile**：切換語言後人機驗證失敗，因為 Turnstile 的 `options.language` 寫死 `zh-TW`，`language` 改變時沒有任何機制重置這顆 widget——Cloudflare 的 script 繼續用建立時的語言跑，跟頁面其餘部分講不同語言；伺服器端驗證失敗時也沒清掉舊 token。修法：`Turnstile` 加 `key={language}`（強制乾淨重掛載，而不是嘗試更新一顆活著的 widget）；`options.theme` 改成 `'auto'`（原本讀 `next-themes` 的 `resolvedTheme`，是另一個不相關的重掛載觸發點）；`options.language` 跟隨 `language`；`onError` 與伺服器驗證失敗分支都會 `reset()` widget 並清空已存的 token，避免重試還在打一顆已經死掉的 token。
- **首頁 blog skeleton**：載入骨架的 DOM 結構／樣式跟真正的貼文卡片不一致（寬度 class 不同、沒有 `blog-berth`／`--i` stagger、沒有 `pt-5`），資料回來替換時版面跳動，在滾動視差下讀起來像「貼文從錯的位置滑進來」。骨架現在完全共用卡片外殼與滾動驅動定位，替換時視覺無縫。
- **首頁產品插圖五個動畫**：`HeroIllustration` 六個裝置活動中，news／game／social／youtube 四個（chat 之前已完成）在 `globals.css` 裡定義了 keyframes 卻沒有對應 SVG 內容、動畫也是關閉的，所以這五支手機/平板在裝置環與中央顯示器鏡像裡都是靜止畫面。補完每個場景的 SVG（news 的列表列、game 的巡邏點、social 的三則貼文＋愛心爆發、youtube 的播放鍵＋進度條）並打開動畫。全部都是用百分比 transform 的 SVG group，缺了 `transform-box: fill-box`——沒有這個屬性，`%` 會相對整個 900×500 viewBox 解析而不是元素自己的邊界，導致 `translateY(-50%)` 幾乎跳出畫面，而不是精準位移一份重複內容的高度。驗證時順手抓到一個 console 警告：`NewsScene` 的 `drawRow` 回傳裸的 `<g>` 沒有 key，`articles.map` 產生的三個元素共用同一個 React key，已修正為逐列傳入唯一 key。
- **產品裝置點擊斷線／重排**：產品手機／平板現在可點擊切換連線狀態。點擊後外圈裝置原地變暗＋去色（位置不變，只是「斷線」），它在中央顯示器鏡像格裡的畫面則直接消失，其餘格子重新排列填滿空缺——新寫的 `layoutMonitorGrid()` 把原本假設固定六台裝置的 2×3 排列邏輯，一般化成可處理任意數量與任意子集合的版面。斷線裝置的連接線整條隱藏；全部斷線時顯示器顯示一個小小的「無訊號」圖示，而不是空白格子。格子位移、連接線路徑、格子尺寸都加了 0.4s 緩動的 CSS transition（`prefers-reduced-motion` 下關閉），讓重新排列讀起來是刻意設計而不是瞬間跳動。
- 驗證：`tsc --noEmit`、`next lint`、`next build`（45 條路由）全部乾淨。在瀏覽器用 `getComputedStyle` 確認十一個動畫 class 的 `animationPlayState` 都是 `running`；用放大截圖確認 news/game/social/gallery/youtube 每格內容確實在變化（gallery 在相簿格線與單張放大間切換，youtube 的播放鍵與進度條會動）——第一輪用原始縮圖大小截圖時看起來像靜止，實際是縮圖太小看不出差異。用 `dispatchEvent` 模擬點擊裝置：斷線一台後顯示器從 2×3 變成重新置中的 3+2、對應連接線消失、裝置變暗；再點一次恢復原本 2×3 排列、連接線與全彩。

## 2026-08-27 — 修正後台圖片上傳 500（強制走 read-write token，不再誤用過期 OIDC token）

- `/admin/media`（以及共用同一段程式碼的網誌編輯器上傳）每次上傳都 500，前台顯示籠統的「An unexpected error occurred」；伺服器端實際錯誤是 `BlobOidcEnvironmentNotAllowedError: Vercel Blob: OIDC is enabled for this project, but not for the "development" environment.`。原因是 `@vercel/blob@2.8.0` 的 `resolveBlobAuth()` 認證順序把 `VERCEL_OIDC_TOKEN`（配合 `BLOB_STORE_ID`）排在 `BLOB_READ_WRITE_TOKEN` 前面，而且只看這個環境變數是不是非空字串，不管它有沒有過期、也不管這個 Blob store 在 Vercel 後台的「Project Connection」是否真的允許 Development 環境用 OIDC。`.env.local` 裡剛好殘留一顆之前 `vercel env pull` 抓下來的 `VERCEL_OIDC_TOKEN`（解碼後是 scope 到 `environment:development` 的 12 小時短命 token，早已過期），而這個 store 的連線設定本來就沒開放 Development 用 OIDC——所以每次上傳都走進這條死路，`BLOB_READ_WRITE_TOKEN`（同一個檔案裡、完全可用）從來沒被試過。
- 修法寫在程式碼而非 `.env.local`（後者下次 `vercel env pull` 還是會被覆寫）：`uploadImage()` 呼叫 `put()` 時明確傳入 `token: process.env.BLOB_READ_WRITE_TOKEN`；`resolveBlobAuth` 對明確傳入的 `token` 選項優先權高於 OIDC，之後就算環境變數怎麼同步都不會再繞回 OIDC 分支。
- 驗證：直接用登入後的 admin session 打 `POST /api/admin/upload` 送一張 1×1 PNG，修好前這通會 500，修好後回 201 並拿到真正的 `https://*.public.blob.vercel-storage.com/...` URL；測試用的 blob 事後用一次性 `del()` 腳本清掉，不留垂測垃圾。

## 2026-08-27 — 移除服務詳情頁 v1/v2/v3 比較版本，改以現行頁面為優化基礎

- 四個服務詳情頁處理方式中，決定保留的是目前線上實際使用的 `/services/[slug]`（簡單條列＋交付流程時間軸），不是這幾週在 `v1`（Datasheet）／`v2`（Engagement）／`v3`（Questions）三條比較路線上反覆打磨的一頁式重設計。刪除 `services/[slug]/{v1,v2,v3}/page.tsx` 與 `components/services/detail/{ServiceDatasheet,ServiceEngagement,ServiceQuestions,StageGlyph}.tsx` 及其三個 CSS module；確認過沒有導覽、`ServicesPageClient`、`sitemap.ts` 連到這幾條路徑，純粹是刪除，不需要導轉。`lib/service-content.ts`（三個重設計版本寫的雙語定義／訊號／範圍／FAQ 資料）保留不動——它是內容資料而非「版本」本身，之後優化現行頁面時很可能會用到。
- 刪除後 `next build` 一度因 `.next/types` 裡殘留舊路由的型別 stub 而報錯，清掉 `.next` 快取後 `tsc` / `lint` / `build` 全部乾淨；瀏覽器確認 `/services/system-development/v2` 已回 404，`/services/system-development` 中英雙語均正常渲染。

## 2026-08-27 — 服務詳情頁 V2 圖標按服務區分、大螢幕填滿、標籤與報價 modal 補語言

- `StageGlyph` 從固定四個圖標改為接受 `family`（沿用 `ServiceIcon` 的六個 key），共畫出 24 個圖標——四個階段依各服務自己的視覺語彙重新詮釋：系統開發用機架／終端機，網頁平台用瀏覽器／地球，UI/UX 用畫板／手機螢幕，諮詢用放大鏡／循環箭頭，廣告用瞄準鏡／漏斗，品牌用放大鏡／色板。六個系列的第四個圖標都刻意保留同一個「呼吸點」（終端機游標、地球脈動、QA 勾號旁的小點、漏斗頂端的點），讓「上線與維護」在六種不同外框下仍讀作同一件事——工程結束後仍在運作的那一步。
- V2 在 1080p 螢幕下內容底部留白是合理的頁尾邊距，但在 1440p 以上的大螢幕上同一段留白會變成幾百像素的空洞。`.stages` 現在在 `.body` 裡吃下 `flex: 1 1 auto`（`.foot` 維持 `flex: none`），螢幕變高時是格線列被撐高，不是內容下方多出一塊空白——每張階段卡片原本就靠 `margin-top: auto` 把「這階段結束時／你的部分」釘在卡片底部，卡片被撐高後這兩行只是往下沉得更多。實測 2560×1440：內容現在到 y=1398（滿版是 1434），改動前只到 y=1041。
- `service.tags`（`Architecture`、`Performance`、`Process`、`Design Systems`、`Brand Identity`、`Visual System`）原本是單一 `string[]`，根本沒有中文版可切——現在改成 `{ en, zh }`，`ServiceDatasheet`／`ServiceEngagement`／`ServiceQuestions`／舊版 `/services/[slug]`／`ServicesPageClient` 全部跟著改讀。`QuoteModal` 與 `ContactForm` 的表頭則是直接寫死字串 `"QUOTE.REQUEST"`——從來就不是翻譯 key，現在改成 `contactForm.quoteEyebrow`。

## 2026-08-26 — 報價三個插圖統一到同一個墨跡框

- `/services`：報價三個插圖的 `svg` 方框大小一致，但圖形本身各自畫到不同範圍 —— 48 單位底上的墨跡左緣分別在 x 4 / 10 / 9，上緣在 y 10 / 6 / 6。三個直排時眼睛量的正是左緣與上緣，所以第一個對話框往左凸出約 5px、又比另外兩個低 4px，旁邊的編號跟著一起錯。現在三個共用同一個框：x 9→39、y 8→40，左緣、右緣、上緣一致。`.stepGlyph` 的負上邊距改為以 y = 8 推算（`8/48 × 2.85rem = 0.475rem`，編號 cap 高在 0.25rem），讓插圖頂端正好落在編號的 cap 高度上，而不是接近它。
- 順帶縮短提案插圖的紙張到 y 38。印章移進框內後圓心上移，紙張右下角的圓角落到圓盤之外，原本被印章遮住的角會從章底露出來。

## 2026-08-25 — 報價動畫無縫化、插圖上品牌色、服務頁頂部目錄、圖標重繪

- `/services`：報價三個插圖不流暢的原因不是掉幀 —— 在該區段實測 179 幀，中位數 8.4ms、p95 10.1ms、無一幀超過 20ms。問題出在 opacity 軌：`--gd` 讓每條筆畫錯開最多 0.4s，三條線就會在 1.16s 的區間裡先後淡出，整個插圖是「一條一條散掉」的。現在每條筆畫帶一組與路徑等長的實線＋空隙，offset 由 1 → 0 → -1，筆畫沿著書寫方向掃出去；週期兩端都是空白，所以任何錯開量都能無縫循環，opacity 軌整個移除。印章與勾號併入同一個群組共用淡出，先前各自計時會讓勾號活得比它所在的圓盤久。
- `/ec-share`：六個功能與四個上手插圖統一上色規則 —— 承載動作的元素用品牌色，周圍靜止的機構維持灰階。所以聚焦模式的大窗格是品牌色、被讓開的三個小窗不是；整個圖就是動作本身的（裝置網格、收合的截圖框）則整組上色。索引因此有「響」與「靜」的節奏，不是六個一模一樣的列。
- `/ec-share`：上手行程線加終點。線走到第四步就沒了，讀起來像被切斷而不是走完；終點用實心圓，四個停靠點是刻度，形狀不同才不會被當成第五步。編號同時移到插圖上方 —— 它是用來標示停靠點的，原本卻隔了兩列才出現。
- `/services`：頂部細線下方原本是 3.5rem 空白，現在放整頁的目錄：六個服務範疇，點擊會展開下方索引中對應的項目並捲動過去。做成可點按鈕而不是純標籤 —— 六個看起來可點卻不能點的名稱，比留白更糟。
- `/services`：過往案例中尚未有內頁的兩則改為 `article`，不再連到不相干的路由，同時移除 hover 放大與標題變色，不再暗示可點擊。僅「Android 裝置鏡像」維持連結。
- 六個服務圖標重繪。舊的每次都選最通用的隱喻 —— 網頁用地球、諮詢用燈泡、品牌用調色盤 —— 六個裡有四個互換位置也不會有人發現。新的直接畫交付物：機櫃、瀏覽器框內的儀表板、被主題一分為二的畫板、對著圖表的量測、命中的標靶、疊在色票上的標記。

## 2026-08-25 — 功能改雙欄索引、上手步驟共用一條時間軸、報價插圖重寫

- `/ec-share`：各段落標題的描述改為置於大標題下方，限制在 42rem 閱讀寬度。先前兩次嘗試都是放在同一行的右側（先頂端對齊，再改為對齊索引軌道並共用底緣），兩次都不對：在這個容器寬度下，大標題與那一行小字之間有 500px 的空白，不論把遠端對齊到哪裡，兩者都不會讀成同一件事。`/services` 的段落標題本來就是這樣堆疊的，現在兩頁一致。
- `/ec-share`：六項功能由六列改為雙欄三列。原本每列橫跨整個版面，但說明欄最多只有兩行，大半寬度是空的，在 1080 高的螢幕上整段要 780px；改雙欄後整段 632px（英文 708px），一屏看完。仍維持細線分隔的列，不是卡片格 —— 六個等分方塊說明不了它們之間的關係。
- `/ec-share`：上手四步驟改為共用一條貫穿的線。細線由各欄移到清單本身，訊號色填充延伸進欄間距，四段首尾相接成一條連續的線，每一步在線上留一個刻度並隨該步驟亮起。它們是同一次安裝的四個階段，各自獨立的細線把它們說成了四件不相干的事。1024px 以下排成 2×2 時維持原本的分欄細線。
- `/services`：報價三個插圖以 `pathLength="1"` 重寫，單一組正規化 keyframe 驅動所有筆畫，不再有任何縮放 —— 範疇框原本用 `scaleX` 撐開，過程中垂直筆畫變細、圓端點被壓扁。現在範疇框固定，先畫內容再由左至右量測全寬並補上兩端刻度；提案的內文行先寫完，印章才落下；印章以原尺寸淡出，不再縮回去（等於把已蓋的章收回）。

## 2026-08-25 — 標題組改用索引網格、步驟加插圖、功能區加色帶

- `/ec-share`：各段落標題右邊的描述位置修正。原本標題組走 12 欄網格，底下的功能列走 `3rem / 4fr / 6fr`，兩套網格沒有共用的線 —— 描述起點在 977，而它要介紹的說明欄起點在 898，尾端又短了 117px，結果與頁面上任何東西都不對齊。標題組改用索引自己的軌道，描述現在正好蓋在說明欄之上（898–1637），並與大標題共用底緣，不再是對著大字級頂端對齊而浮在右半邊。
- `/ec-share`：上手區的版面是四等分欄，所以它的標題組改用 `headQuad` 走同一組四欄，否則描述會落在第三步左邊 79px 處。
- `/ec-share`：首屏圖標改為同時對齊平台版本行與大標題（不再只對大標題），平台行移回標題旁。`--icon-size` 改成它所跨越內容的總和 —— 兩行標題 + 平台行 + 列間距，為此 eyebrow 的 line-height 由繼承改為固定值。實測圖標 130–294，eyebrow 頂端 130、標題底端 294。
- `/ec-share`：上手四步驟加入線稿插圖（`StepGlyph.tsx`，與功能圖同一 48 單位底）：下載落入承接盤、接線找到連接埠、畫面逐格出現在桌面、手指觸控並把工作階段送出去。原本四欄只有編號與文字，正確但沒有溫度。
- `/ec-share`：功能索引一併移到色帶上，頁面改為交替 —— 首屏／實景／CTA 用基底色，兩份清單抬到 surface。
- `/services`：過往案例的小標有 `.scrubbed` 但沒有 `--lag` 也沒有動態規則，是全頁唯一不會隨捲動進場的元素，底下的標題與說明都在動它卻不動。已補上。
- `/services`：查看詳情按鈕移到面板右下角（列的結束處），不再跟在技術標籤後面。
- `/services`：兩處索取報價按鈕移除箭咀。

## 2026-08-25 — 上手步驟橫向排列、查看詳情按鈕化、進場時機回調

- `/ec-share`：上手四步驟由直行改為橫向四欄，每欄自帶頂端細線並隨該步驟進場填上訊號色，由左至右依序畫出；原本的直向 spine 移除。之前功能六列與步驟四列都是「細線＋編號＋直向堆疊」，接連出現讀起來像同一份清單。
- `/ec-share`：實景圖組移到兩份清單之間，順序改為 功能 → 實景 → 上手 → CTA，「怎麼開始」緊接在行動呼籲之前。
- `/ec-share`：closer 移除自身頂線 —— 色帶區塊現在就結束在它上方數 rem 處，兩條線並置會讀成一條粗邊。
- `/ec-share`：首屏平台行改為對齊圖標左緣而非標題左緣。它是整個識別區塊的標籤，掛在區塊自己的邊上；圖標與 eyebrow 現在與下方數據列同一條 x。
- `/services`：索引的「查看詳情」由純文字連結改為按鈕 —— 沿用全站次要按鈕外型，訊號細框內填 `--signal-soft`，hover 填實、按下縮放。刻意不做 999px 藥丸型，因為正上方的技術標籤就是藥丸型，動作必須看起來像動作。
- 進場時機由上一次 `pace="early"` 的過早回調：`--p` 起點 `0.88vh` → `0.8vh`、行程 `0.4vh` → `0.34–0.5vh`。區塊頂端位於畫面 70% 高度時讀數由 0.45 降到約 0.2，仍遠早於 `normal`（該處仍為 0）。

## 2026-08-25 — 圖標對齊標題、線稿圖無限循環、索引框線

- `/ec-share`：應用圖標改為與兩行標題等高的正方形，上下緣與標題齊平，兩者共用 `--title-size`。為此標題 clamp 上限由 4.6rem 調到 4.1rem —— 圖標進場後英文 "Every Android device," 被擠成第三行，圖標無法對齊行數不固定的區塊。平台 eyebrow 併入標題同一欄，圖標／eyebrow／標題三邊對齊。
- `/ec-share`：首屏加 `min-height: 100svh` 並垂直置中。原本首屏高度隨標題長度而定，中文比英文短 73px，於是中文會露出「為裝置團隊打造」而英文不會；現在兩語系的下一段一律落在摺線之下，`Scrub` 的掛載進場也不會為看不見的區塊觸發。
- `/ec-share`：功能列移除 01–06 編號。線稿圖不再讀 `--t`，改為各自的 CSS 閉環無限循環，以列為單位用負值 `--rd` 錯開起始相位（六個不會同步閃動），區塊離開視窗即暫停，`prefers-reduced-motion` 下停在最好辨識的一格。
- `/services`：「我們提供什麼」右欄索引改為完整框線面板 —— 圓角外框、列間分隔線、展開列加表面色與 2px 訊號側邊、未展開列 hover 上色；展開內容的留白跟著外框走。
- `/services`：取得報價三個步驟加入線稿插圖（與產品頁同一 48 單位底），編號移到步驟名稱上方。三張圖分別是寫入中的訊息、對著固定量尺調整的範疇框、蓋上印記的提案書。
- 兩頁所有捲動區塊改用 `pace="early"`：`--p` 起點由 `0.52vh` 提前到 `0.88vh`、行程由 `0.72vh` 縮到 `0.4vh`，區塊頂端還在畫面三分之一高度時就幾乎進場完成。

## 2026-08-25 — 功能線稿圖、流程箭頭軌道

- `/ec-share`：新增 `FeatureGlyph.tsx`，六項功能各一個 48 單位線稿圖，動態由該列的 `--t` 驅動（非 keyframes），捲到哪演到哪、停在捲動留下的位置，無指標裝置一樣有動態；hover 只轉訊號色。列改為四欄（編號／圖／名稱／說明）。
- `/ec-share`：應用圖標移到大標題左側，僅圖標；平台行改當標題上方的 eyebrow。首屏左欄由 7 欄放寬到 8 欄（圖標吃掉版心會讓標題斷在詞中間）；行動版首屏上緣 padding 5rem → 6.5rem。
- `/services`：「從提出到驗收」改為一條帶箭頭的軌道 —— 堆疊時垂直、成列時水平，每階段一個節點、末端節點實心，訊號隨區塊進場沿軌道推進。
- `/services`：取得報價右側三個步驟移除分隔線。

## 2026-08-25 — 落地即進場、產品頁應用圖標位

- `Scrub`：掛載時已在視窗內的區塊改由計時驅動進場（160ms 前置 + 1.1s ease-out），以只升不降的下限接回捲動值。服務頁「我們提供什麼」與右欄索引不再開場空白。
- `/services`：左欄 meta 表格的細線全拿掉，橫線系統只留給右欄索引；收尾段 `.steps` 去掉上緣線，避免與版塊自身的線疊成雙線。
- `/ec-share`：移除十二欄線背景（顆粒保留）。首屏改為應用識別區塊 — 圓角方形圖標槽 + 產品名 + 平台行。圖標槽暫置公司 mark，套 `appIconPlaceholder` 內縮並給白底；換上正式圖標時移除該 class 並改 `APP_ICON`。
- 文案（en + zh）：產品頁平台由 Windows 改為 macOS 與 Windows，含首屏副標、規格列、安裝步驟與下載 CTA。`/download`、FAQ `a3`、首頁產品卡仍寫 Windows only，待決定。

## 2026-08-25 — 服務頁定案：案卷版面

- V1 案卷升為 `/services`；實作搬進 `ServicesPageClient` + `components/services/atelier.module.css`，`page.tsx` 維持 server component 保留 metadata。
- 舊版 `PageHero` + 六格卡片 + how-we-work 那套整組移除；`v1|v2|v3` 三個預覽路由與切換列一併刪掉。
- 首屏 padding 由 5rem / 6rem 改成 8rem / 10rem，對齊 `PageHero` 的 `pt-32 md:pt-40`；先前靠變體頁的返回列補位才沒撞到浮動 header。
- 收尾段也拿掉同款被裁切的 radial 暈染，全頁不再有角落暈染。

## 2026-08-25 — V1 首屏拿掉角落暈染

- 首屏左上那團訊號色 radial 被 `.hero` 的 `overflow: hidden` 切出一條平的橫邊，看起來像被裁掉的髒霧；整團移除。
- 改用一條齊版心的細線收掉首屏；順手修掉 `var(--border-subtle)`（本專案沒這個 token，實際渲染成透明）。

## 2026-08-25 — 服務頁三個方向

- `/services/v1|v2|v3` 三個預覽路由，底部切換列可與現行版對比；`/services` 本身未動。
- V1 案卷：左欄論述 sticky，右欄六項服務為細線列，展開才露出重點與標籤。
- V2 配置盤：12 欄磚格，首屏本身就是第一塊磚；兩塊帶照片、一塊帶色，其餘用放大的服務符號。
- V3 海報：滿版影像帶、六個服務名以海報級字級左右交錯、階段用沉底編號、案例走橫向軌。
- 文案：清掉 `servicesPage` 內全部 em-dash（en + zh）；新增 `heroLede` / `servicesTitle` / `servicesSubtitle` / `viewDetails`。

## 2026-08-25 — 產品頁背景層

- 整頁單一底色太平，加上版面家具：對齊版心的 12 欄細線（≥1024px 才畫，因為那才是實際在用的格）、3.5% 顆粒。
- 首屏加偏左的訊號色暈染；收尾段右下角加一道暈染。
- 安裝步驟改成 `--bg-surface` 底色帶＋上下細線，打斷四段同色的連續感。

## 2026-08-25 — 產品頁定案：編輯式版面

- 做了三個方向（劇場／控制台／編輯）放在 `/ec-share/v1|v2|v3` 比較，選定編輯式，其餘兩版與切換列已刪。
- 首屏改 12 欄非對稱、大留白；功能改六條細線索引列；步驟改編號脊線；收尾左右分欄。
- 實景改攝影散頁：三張圖各自偏移，圖說移到圖片旁邊的留白處（右／左／右），含編號、標題與一句描述。
- 新增 i18n `gallery1Desc` / `gallery2Desc` / `gallery3Desc`（en + zh）。
- 頁面樣式改用 `ec-share/editorial.module.css`；`globals.css` 內所有 `prod-*` 規則移除。

## 2026-08-25 — 產品頁改走自己的構圖

- 首屏置中，用 `prod-enter` 進場，不再包 Scrub（落地時 `--p` 已是 1）。
- 功能改磁吸模組底盤；步驟改站點連線（線接到圓點）；實景改 1+2 影像底板，不是 blog 軌。

## 2026-08-25 — 產品頁改回主頁構圖

- `/ec-share` 不再自創版面：hero 用主頁產品 split，功能用服務 lead 格，流程用既有 process-line，實景用 blog 橫軌，收尾用置中 punch-in CTA。
- 刪掉 `.prod-stat-strip` / `.prod-flow*` / `.prod-gallery*`。

## 2026-08-25 — 產品頁 taste-skill preserve 重設計

- `/ec-share` 改非置中 split hero；統計移出 hero；功能格有 lead/raised/flat 表面差；流程改左右分欄軌道；實景圖 1+2，說明在圖下。
- 拿掉各區 eyebrow、圖上疊字、手繪 SVG icon；改 lucide + 既有 Scrub。
- 文案破折號清掉（en/zh gallery 與 eyebrow）。

## 2026-08-25 — 飛艇漣漪上移一點

- 飛艇 slosh `nudgeY` +2→+1，仍在船底下方的水裡。

## 2026-08-25 — 飛艇漣漪落到水裡

- 飛艇 slosh 原本 `nudgeY` -3.5，疊在白船身上。改為 +2，線落在船底下方；條數 14→20。

## 2026-08-25 — 飛艇再下 1px、小輪漣漪往下加

- 飛艇 `y` 543→544。
- 小輪船底 slosh 50→64，深度帶 12.6→19，讓多出來的線落在船底下方的水裡。

## 2026-08-25 — 小輪加漣漪、飛艇下移 1px

- 小輪船底 slosh 由 36 條加到 50 條。
- 飛艇（cruiser）整塊 `y` 542→543，漣漪跟著走。

## 2026-08-25 — 小輪船底漣漪抬高

- 小輪原本多沉 6，漣漪又從圖底算起（水線在圖底上方 10），一起加的 2px 看不出。`nudgeY` 改為 -8，貼近船底水線。

## 2026-08-25 — 三艘船底漣漪上移 2px

- `buildHullWaves` 的 floor 對 ferry / junk / cruiser 一律減 2。船體、水線、canvas 水面不動。

## 2026-08-25 — Hero 文字完全退場、下滑露出更多水面

- 標題區淡出不再停在 58%，也不再由下往上遮罩，整塊 copy 會到 opacity 0。
- 海港整塊上移由 7vh 改 20vh，下滑時水面佔比加大；建築／船／水線仍同一 HTML transform。
- Pin 軌道加長；`--p-mask` 提早到 p=0.22。

## 2026-08-25 — 大尺寸海港明顯下移

- 已推送的 1920 / 2560 與 6–16vh 在縮放後的 2K 最大化開不到，看起來沒差。
- 改為 `1600×850` 起開。位移先用 16–22vh 過低，收到 `10–14vh`。海港與星空一起下、標題不動、不縮圖。

## 2026-08-24 — 海港改成同一個 HTML transform

- 單位換算再準，建築與水面仍是兩個獨立位移，天空漸層若再各走各的，水線下方的 bleed 會相對建築腳底滑動，讀成水位線沒釘住。
- plate 位移改掛在 `.hero-pin-city`（同時包住 SVG 與 canvas 的 HTML 盒）。這是真正的 CSS px，viewBox 縮放無法只放大其中一邊。建築、天空漸層、船、水都不再各自做滾動位移。
- 畫布上的船底泡沫漣漪拿掉。它們每幀用 `mapSvgY` 對場景盒與 canvas 盒重算，滾動時必然走鐘；SVG 船底波已在 bob/sail 裡，那才是該鎖的漣漪。水面自身的 chops 留在 canvas 上，跟著整塊 plate 走。
- 實測 `--p-depth` 0.917：建築水線、天空同 y、canvas 頂端都走 **-69.33px**，相對位移 **0.00px**。

## 2026-08-24 — 海港整塊釘死（單位陷阱）

- plate 其實沒有釘住，原因是單位陷阱。建築與船是 SVG group、水是 HTML canvas，兩者共用同一個 `--plate-lift`，但 CSS `transform` 的 px 用在 SVG 元素上是 **user unit**，還要再乘 viewBox 縮放；用在 canvas 上就是 CSS px。實測兩者拿到完全相同的 `translateY(-69.3252px)`，卻分別走了 **82.93px** 與 **69.33px**，比例剛好是 viewBox 縮放 1.1963。所以每次滾動水位線就往建築物爬約 14px——正是註解裡警告過的「漲潮」。390px 寬的視窗下同一個 bug 反向且更大：14.4px 對 59px。
- 改為把位移定義成「場景的比例」，那是兩個座標空間唯一都認得的東西：場景高度的 9%，對 SVG 成員寫成 760 viewBox 單位中的 68.4，對 canvas 寫成同一距離的 `cqw`（1600×760 的場景，高度的 9% 等於寬度的 4.275%）。`.hero-enter-city` 改為 query container，讓參考寬度是 viewBox 貼合的那個未縮放寬度；`--hk-scale` 在共同祖先上，對兩者等倍放大。
- 第二個缺陷、不同成因：`VesselWaves` 放在 `hk-vessel-sail` 與 `hk-bob` 之外，所以船體橫向漂移最多 22 user unit（螢幕 26px）滑離自己的漣漪，而漣漪原地不動。漣漪已移進 bob group 內——`hk-hull-wave` 的註解「born on the bob」本來就是這個意思。
- 畫布上的船體倒影有同樣問題但無法用嵌套解決，改由 `HarbourWater` 每幀從 DOM 讀取 sail 的即時矩陣，把倒影帶著走。在 canvas 時間軸重現那組 keyframes 會起始相位不同並逐漸走鐘。
- 實測：桌機四個滾動位置、390×844 手機三個、768×900（`--hk-scale` 1.12）三個，建築／船／水位線之間的位移差全部 **0.00px**，pin 釋放時 0.01px 為四捨五入。船體與漣漪的相對位移在 3.6 秒內取樣 14 次，橫向 0.85px、縱向 0.56px，修正前擺幅約 26px。加入 query container 後場景版面完全未變（1914×909.14，canvas top 850.24）。

## 2026-08-24 — 水線接續到場景下方

- 移除會往上爬的 `hero-scene-water`。它由下往上用 `--bg-base` 把城市糊掉，等於把水換成頁面底色，與構圖要的相反：建築要留在水面上，水要繼續往下走。
- 真正的斷點在場景後面，不在前面。場景遮罩會淡掉 stage 底部約 24vh，露出的是頁面本身；畫布水是深藍（`--hk-water` `#0a1233`、`--hk-water-deep` `#05091f`），`--bg-base` 是中性 `#0b0f14`，所以即使沒畫線，接合處也帶著色相變化而讀成一刀切。
- 新增 `.hero-deep-water`，放在 `.hero-scene-mask` 後方，把水本身的兩個色階往下帶滿底部 40vh，最底才收到頁面色——那也是深度對水做的事，所以下沉讀成深度而不是抹除。
- 該層原本是靜態的，實測不成立：固定螢幕位置在整段滾動中只走過漸層的 9%，等於海港從一塊不變的水上抬走。改為以 30vh 行進（plate 是 7vh）。這不是視差速率——該層是無特徵的平滑色場，沒有東西能讓人讀出速率，行程的唯一作用是把深度漸層往上掃過畫面。stage 底部附近的點因此從水面藍一路讀到近黑，這才是下沉。
- plate 自身各層（建築、船、尾流、水畫布）仍共用 `--plate-lift`，完全沒動，所以場景內部不會散開。實測 `--p-depth` 0.917 時水畫布與建築都位移 69.3px，等於 `0.917 × 7vh`；船身與尾流唯一的差是 `hk-bob` 的幾 px 浮動。
- 盒子下緣掛在 stage 底部下方 30vh，讓掃描結束時 `--bg-base` 端剛好落在 stage 底部，也就是下一區的起點。頂端留長段透明，確保任何視窗尺寸下該層都在遮罩淡出前方之上就已不透明。
- `--p-mask` 起點由 p=0.48 提前到 0.32。原本前半段甚麼都沒發生、後半段一次湧上，下沉要漸進才讀得出來。
- Blog 的 `blog-horizon` 橫線與每張卡上方的 `blog-tick` 直線全部移除（taste-skill §9.F：純裝飾的細線與格線）。
- 標題不再淡入，改成從自身邊緣後方掀起：新增 `.scrub-reveal` / `.scrub-word-mask` 遮罩盒，標題位移 112% 且完全不動 opacity。遮罩用 padding-bottom 預留降部再以負 margin 收回，實測英文 `building` 的 g 完整（遮罩 55px / 字 48px）。
- `SectionHeading` 的 h2 拿掉 `scrub-title`。原本區塊級位移疊在逐字位移上，兩者互相抹平成一團軟淡入。
- 各區進場軸向改為對應內容：blog 卡片沿軌道橫向進場（原本縱向，與唯一可手動拖曳的方向相反）；CTA 區改為縮放收束，因為它是抵達而不是又一次進場。

## 2026-08-24 — 服務卡片依 taste-skill 修正（Leonxlnx/taste-skill）

- 安裝 `Leonxlnx/taste-skill`（13 個技能落在 `.agents/skills/`），核心 `design-taste-frontend` 接進 `skill-router`：它管構圖，`emil-design-eng` 管動效參數。
- 拿掉卡片底層序號 01–06。taste-skill 明令 bento tile 不得帶 `01 / 4` 式編號（使用者自己會數）。
- 指針聚光從「內部徑向洗色」改為「1px 邊框受光」（`mask-composite: exclude` 打穿內容框）。原本的填色屬於被禁的 outer glow；邊框受光才是 Spotlight Border Card。
- 服務網格補上表面層級（原本六格同一個 surface，違反 feature grid 必須有真實視覺變化的硬規）：前三項建置服務用 elevated（主打面板另加品牌色 wash）、後三項顧問服務維持 flat 並改用中性圖示底，讓強調色只留給核心服務。
- 主打面板條列改單欄無分隔線，關掉條列與標籤之間約 100px 的死空間；`mt-auto` 從標籤移到 CTA，剩餘空間落在行動前而非內容中間。

## 2026-08-24 — 整頁 motion 系統（emil-design-eng）

- `Scrub` 改出兩個變數：`--p` 進場（會飽和）、`--q` 持續滾差（不飽和）。此前所有 `--t` 一到 1 就靜止，Hero 以下整頁其實只有進場淡入、沒有滾差。
- 二十種 scrub 視窗與七種位移距離收斂成一個 `--scrub-span` + `--lift-sm/md/lg` 三級尺度；元素身分只剩一個 `--lag`。部落格標題原本每字位移 72px，其他區塊 28px，現已同尺度。
- `will-change` 從常駐改為只在 `[data-scrubbing]` 的區塊上；離開視窗的區塊不再量測、不再寫入 custom property（避免整棵子樹每格失效，證言牆有 48 張卡）。
- 持續滾差只放在真有前後景的地方：產品區 art 對 copy 反向漂移（實測差 29px）、部落格標題對軌道。服務區網格與證言牆刻意不加，理由記在 CSS 註解。
- Hero 解除釘住後改為深度出場：海港整板（建築＋船＋水面，以 `--plate-lift` 綁定，因為水帶覆蓋建築基座）帶頭 -7vh，月亮殿後 -1.4vh。

## 2026-08-24 — Hero 滾差改以水線為樞紐；部落格與服務區重構

- Hero 滾差：所有圖層按「離水線高度」等比下沉，方向統一。修掉星空 canvas 下沉、SVG 天空上升的互打，以及遠景（月亮 5vh）比近景（建築 1vh）動得多的反向深度。船與水線仍為 0。
- 場景上方加 haze + 水平線細規（在遮罩之外），靜止時 `--p-mask: 0` 完全不顯示；下滑時海港溶入大氣並把水平線交給部落格。
- 部落格：水平線延伸成碼頭線，貼文以刻度掛在線下，逐張 `--i` 進場（不再整條軌道位移，避免與拖曳互打）。
- 服務區：主打面板（條列 + 技術棧標籤，2×2）＋ 其餘面板以 `--i`／`--row` 對角鉸起落位；加指針聚光與底層序號。

## 2026-08-24 — 全站動效掃描（不動海港場景）

- 命令盤／快捷鍵表即開即關；聊天室從 FAB 原點進場，按壓縮小。
- Hero 滾差：`--p-fade` / `--p-depth` 用 ease-out，遮罩維持線性晚溶。
- 首頁 scrub 拿掉 blur／clip-path；區塊進場壓到 200–280ms。

## 2026-08-24 — 安裝 emilkowalski/skills 並套用全站

- 以 `npx skills add emilkowalski/skills` 安裝 12 項技能；網頁相關 10 項複製到 `.cursor/skills/`。
- Skill router + `emil-design-eng` rule 約束全站 UI。
- 加入 `--ease-out`／`--ease-in-out`／`--ease-drawer`；按鈕／CTA 按壓 `scale(0.97)`，hover 限精細指標。

## 2026-08-24 — 手機海港完整入鏡

- 手機不再 1.28／偏左裁切；建築與太陽完整顯示。

## 2026-08-24 — 手機／桌面首屏輕量遮罩

- 下滑溶場遮罩手機也保留；桌面同樣維持，只溶底部約 20%。

## 2026-08-24 — 手機星空還原、船隻可見

- 手機海港倍率從 2.18 回到 1.28，星空佔比恢復原尺寸。
- 拿掉淺色模式船體 `filter`（對 SVG image + 祖先 mask 在 iOS 會整艘消失）；手機關場景 mask。

## 2026-08-24 — 天際線改回原 PNG、補回船體漣漪

- 天際線改回未壓縮 `hk-skyline-light.png` / `hk-skyline-dark.png`，以 CSS 切換日夜。
- 三艘船底改為隨機短橫條漣漪；畫在船體之下、不跟 bob／漂移，渡輪加長加矮。

## 2026-08-24 — Impeccable optimize（hero LCP / canvas）

- 天際線改載入單一主題 WebP（1280 / 1920），不再同時拉兩張原尺寸 PNG。
- `CityField` / `HarbourWater`：離開視窗、淺色模式、save-data 時停 RAF；滑鼠未互動時不做 n² 排斥。

## 2026-08-24 — Impeccable harden（a11y / i18n）

- 公開、登入、admin 加上 skip-to-content 與單一 `#main`。
- 導覽改一般連結（去掉 menubar）；聊天與密碼切換改雙語 aria。
- Admin 側欄／頂欄走 i18n；聊天支援 Esc、abort、長文換行。

## 2026-08-24 — 安裝 Impeccable 並完成全站 audit

- 以 `npx impeccable install --providers=cursor --scope=project` 安裝 [pbakaus/impeccable](https://github.com/pbakaus/impeccable)（skill、agents、pre-edit hook）。
- 對 `src/` 跑 detector + 五維 audit；報告見 session canvas。

## 2026-08-24 — 建築後方山脈圖層

- 新增 `hk-mountain.png` 山脊剪影，置於建築後方；日夜配色切換。

## 2026-08-24 — 倒影下移、移除水面橫線

- 船隻倒影下移 10px（`REFLECTION_DROP`）。
- 移除水面 `SURFACE_LINES` / `WAVES` 全寬橫線。

## 2026-08-24 — 移除擴散環、修正水面倒影座標

- 移除 SVG 擴散環尾跡。
- 水面彩色倒影以 `mapSvgY()` runtime 對齊 SVG 船底位置。

## 2026-08-24 — 移除 V 尾跡、快艇漣漪上移

- 移除 Kelvin V 與快艇橫紋，只保留擴散環。
- 快艇 `wakeSink -10`、`reflectionLift 58` 上移漣漪與水面倒影。

## 2026-08-24 — 漣漪改船體局部座標

- 漣漪錨點改為船體局部座標（`h - draftInset`），隨船體 bob 同步移動。

## 2026-08-24 — 移除建築浮動、漣漪上移

- 移除天際線 `hk-skyline-breathe` 呼吸動畫。
- 船隻漣漪 `wakeSink` 上調（約高於水線 4–6px）。

## 2026-08-24 — 漣漪水線對齊 + 日夜天際線 foot 對齊

- 船隻漣漪錨點移至 `BASE` 水線（`wakeSink`）；繪製於船體之上。
- `skylineImageY()` 依各 PNG `footRow` 對齊 light/dark 建築腳位；dark 尺寸更正為 5504×2310。

## 2026-08-24 — 日間 light / 夜間 dark 天際線

- 日間顯示 `hk-skyline-light.png`；夜間顯示 `hk-skyline-dark.png`（無濾鏡）。

## 2026-08-24 — 移除天際線 sky-key 濾鏡

- 移除 `hk-skyline-dark.png` 的 `#hk-dark-sky-key` 濾鏡。

## 2026-08-24 — 改用 hk-skyline-dark.png

- 日夜模式共用 `hk-skyline-light.png`；移除 `hk-skyline-dark.png` 切換與 `#hk-dark-sky-key` 濾鏡。

## 2026-08-24 — SVG 船隻漣漪、移除摩天輪、夜景還原

- 船隻尾跡改在 `HarbourSkyline` SVG 船體群組內繪製，與船底同座標系。
- 移除 canvas 隨機 `RIPPLES` 與錯位的 `VESSEL_WAKE_SPECS` 繪製。
- 暫時移除摩天輪（`FerrisWheel`）。
- 夜景天際線移除 `mix-blend-mode: screen`，還原 `hk-skyline-dark.png` 原色。

## 2026-08-23 — 水位再上重疊、船隻再下移

- 水位線 `BASE` 448→428；水面向上重疊 22%（`height: 132%`）。
- 三艘船再下移約 37px。

## 2026-08-23 — 水位再抬高、船隻下移

- 水位線 `BASE` 470→448；水面向上重疊 17%。
- 三艘船 y 下移約 45px，尾跡對齊新水線。

## 2026-08-23 — 月亮上移、消除建築與水面空白

- 月亮／太陽 `CELESTIAL_Y` 112→58。
- 水位線 `BASE` 488→470；天際線 `SKYLINE_FOOT_DROP` 42→110，蓋住 PNG 底部透明區。
- 水面 canvas 向上重疊增至 14%；船隻座標對齊新水線。

## 2026-08-23 — 水面向下延伸

- 水面 canvas 向下溢出 12%（`margin-bottom` + `height: 117%`），向上仍重疊建築 5%。
- 水位線 `BASE` 502→488，水域比例加大；`ScrollPin` 改為 `overflow-y: visible` 避免裁切。

## 2026-08-23 — 雲層上移、水位線與建築重疊

- 雲朵 y 座標上移約 80px。
- 水位線 `BASE` 532→502；天際線圖下移 38px（`SKYLINE_FOOT_DROP`）浸入水面。
- 水面 canvas 向上延伸 5%，消除建築與水面的空隙。

## 2026-08-23 — Hero 入場動畫與滾動節奏重調

- 初次載入：星空淡入、維港整體上滑入場，天體→雲→建築→水面→三艘船依序登場。
- 滾動分三階段：`--p-fade`（文字先淡出）、`--p-depth`（場景視差）、`--p-exit`（底部漸層銜接下一 section）。
- 視差幅度下調，避免船隻與建築位移過猛。

## 2026-08-23 — Hero 視差滾動與分層動畫

- 天空、月亮/太陽、雲、建築、水面、三艘船各以 `--p` 不同速率位移，滾動時有景深視差。
- 天體光暈脈動、建築微呼吸、船隻橫移+起伏；水面波紋略加速。
- `prefers-reduced-motion` 下關閉視差與 idle 動畫。

## 2026-08-23 — 天際線裁切與紅邊修正

- 根因：`SKYLINE_VB_H` 用錯比例（寬/高×VB_W），建築頂超出 viewBox 被裁掉；改為天空帶高度 = `BASE`（578），IFC 等高塔完整顯示。
- `SkyColumn` 加強四邊 backdrop flood 與粉紅抗鋸齒 halo peel，減少紅色殘留。
- 重新輸出 `hk-skyline.png`。

## 2026-08-23 — 天際線換紅底插畫（SkyColumn 去紅）

- 使用者提供紅底維港插畫；Matte 會洗色，改用 `-Mode SkyColumn -Floor 28` 自頂剝離紅色天空並保留原色霓虹。
- `SkyColumn` 新增底邊 backdrop flood，清除碼頭下方紅色出血。
- 輸出 `public/hero/hk-skyline.png`；`SKYLINE_ART.height` 427。

## 2026-08-23 — 天際線改 SkyColumn 去背（修正 Matte 洗色）

- 夜景插畫建築暗面與天空同色 navy，Matte／距離門檻會打洞並洗成灰藍。
- `dekey.ps1` 新增 `-Mode SkyColumn`：每欄自頂向下剝離連續天空色（`-Floor 5`），保留原色與霓虹窗光；另恢復 `Threshold`（邊緣 flood）。
- 重新輸出 `hk-skyline.png`（1024×571）；`SKYLINE_ART.height` 571。

## 2026-08-23 — 天際線建築換成使用者夜景插畫

- 使用者提供維港夜景插畫（深藍底 rgb(5,20,61)），`dekey.ps1` Matte 去背後輸出 `public/hero/hk-skyline.png`（1024×406 trim）。
- `HarbourSkyline` `SKYLINE_ART.height` 更新為 406；天空、水面、三艘船不變。

## 2026-08-23 — 天星小輪右桅三角形與第一層窗戶去背

- 右桅黑底被深灰抗鋸齒索具包圍，舊 seed（純白鄰居）無法擴散；新增 `Flood-ClearVoidFromArt` 從索具灰線反向 flood 清除 backdrop-black。
- 第一層白甲板矩形窗以 `Is-WindowVoid` + 甲板白邊 seed 清除；`Protect-WhiteDetail` 保留白色圓形救生圈。
- 重新輸出 `public/hero/star-ferry.png`（`-Mode Yellow`）。

## 2026-08-23 — 首頁 hero 建築物改為使用者插畫（僅建築層）

- 新增 `public/hero/hk-skyline.png`。
- `HarbourSkyline` 以 SVG `<image>` 在水線處疊加插畫，取代向量建築／山脊／地標。
- 保留：天空漸層、月亮／太陽、雲、動畫水面、海濱步道、三艘船。

## 2026-08-23 — 天星小輪黑邊殘留清除

- Mast void 改為 `Is-BackdropBlack`（RGB ≤12，排除深綠與窗玻璃藍），清除桅杆三角形與抗鿾黑邊。
- 全船 halo peel：貼近透明的 backdrop-black 剝離；煙囪中段白底上的黑星／黑條保留。

## 2026-08-23 — 桅杆三角形內黑底清除

- Yellow 模式新增 mast void fill：船體上緣 28% 內、與白色桅杆相鄰的超級黑，沿超級黑 flood 進三角形封閉區（煙囪黑星／輪胎不受影響）。

## 2026-08-23 — 黃色去背：僅超級黑、不碰深綠

- Flood fill 門檻改為超級黑（RGB 各 ≤4）；深綠不再進邊緣清除。
- Yellow matte 僅在像素明顯偏黃時執行；綠主導像素跳過解算，保留原色。

## 2026-08-23 — 天星小輪改黃色去背（不用 Threshold）

- 移除 `Threshold` 模式；新增 `-Mode Yellow`：僅對黃色 (255,255,0) 做 palette matte，邊緣白桅解回白色而非金色；強制綠色調色盤候選保留船身飽和度。
- 黑底匯出檔：邊緣連通純黑 flood fill 清背景，不動船內黑星／輪胎。
- 天星小輪 `star-ferry.png` 重新輸出；快艇改回 `Matte`。

## 2026-08-23 — 天星小輪飽和度還原（Threshold 去背）

- 根因：黑底圖走 `Matte` 調色盤解算時，綠色船身距黑底不夠遠進不了 palette，邊緣被解成灰白 → 整艘船看起來不飽和。
- `dekey.ps1` 新增 `-Mode Threshold`：黑底素材保留原像素色；天星小輪與快艇改用此模式，戎克船仍用 `Matte`。
- 移除 `.dark .hk-vessel-art` 的 `brightness/saturate` filter（會主動洗淡顏色）。
- 天星小輪改用使用者最新參考圖重新輸出 `public/hero/star-ferry.png`。

## 2026-08-23 — 天星小輪不透明化、淺色海水加深

- `dekey.ps1` 新增 `OpaqueMin`：覆蓋率 > 0.08 的像素強制 alpha=255，避免船身半透明疊在水面上像幽靈船。
- 三艘船 PNG 重新輸出；移除淺色模式船隻 `brightness` 提亮 filter。
- 淺色主題 `--hk-water` → `#5a7394`、`--hk-water-deep` → `#3d5674`（海水不再過淺）。

## 2026-08-23 — 維港三艘船全部改用參考圖

- 戎克船與快艇的手繪 SVG 整段刪除，天星小輪 keyed 圖更新；三艘船皆嵌入 `public/hero/{junk,star-ferry,cruiser}.png`。
- `HarbourSkyline` 用 `<image>` 定位到既有 `VESSELS` 船身跨度，canvas 倒影無需改座標。
- 深淺色：場景本已有 `--hk-*` token 與日月切換；船隻圖改共用 `.hk-vessel-art`（淺色略提亮、暗色 `brightness(0.86)`），取代僅天星小輪的 `.hk-ferry-art`。

## 2026-08-23 — 天星小輪改用參考圖本身（不再手繪）

- 手繪 SVG 版本整段刪除，改成直接嵌入去背後的參考圖 `public/hero/star-ferry.png`。
- 新增 `scripts/dekey.ps1` 做去背。純色距門檻不夠用：桅杆與索具是髮絲線，每個像素本來就是白與黃的混色，直接門檻化會保留黃色 → 桅杆變金色。改成用圖檔自身取出的調色盤反解每個邊緣像素的覆蓋率（解 `C = a*F + (1-a)*BG`），覆蓋率 ≥ 0.98 的內部像素保留原色不量化。
- 定位：圖中舷弧在第 310/415 列，對到 viewBox 的 566；船身橫跨 293–547，與原手繪位置一致，所以 canvas 倒影不用改。
- 圖檔無法隨主題換色，暗色主題用 `filter: brightness(0.86)` 壓一下白色上層建築。
- 移除已無用的 `--hk-ferry-lit` / `--hk-ferry-deep` / `--hk-ferry-keel` token 與 `#hk-ferry-hull` clip path；`--hk-ferry` 保留給水面倒影。

## 2026-08-23 — 天星小輪舷弧改成曲線

- 船殼上緣（甲板與船殼交界、輪胎掛的那條線）原本是 `H547` 一條橫貫全船的直線。改成真正的舷弧：中段最低、往艏艉兩端上翹 6 單位。
- 下層甲板由 `rect` 改成 `path`，底邊跟著同一條舷弧，所以交界線是弧不是尺；防撞條、輪胎、機艙罩一併對齊新曲線。
- 舷弧與舭部曲線在艏艉兩端交會於同一點，船體上下都沒有直線段了。

## 2026-08-23 — 天星小輪船殼 2.5D 色階

- 船殼原本只有「本體綠 + 底部深綠」兩色，是一塊平的剪影。改成沿舭部曲線疊四層色階：受光舷側板、船側本體、水線漆帶、龍骨暗邊。
- 每層邊界都是舭部曲線「垂直上移」而非等距平行——靠近艏艉時舭部爬升比位移快，各層會自己收尖消失，這個收尖才是體積感的來源。
- 新增 `--hk-ferry-lit` / `--hk-ferry-keel` token（明暗各一組）。
- 船殼吃水由 26 加深到 28 單位、兩端各延長 5 單位超出甲板，比例對齊參考圖的 0.115 深長比；`VESSELS` 的天星小輪 x 範圍同步改成 293–547。

## 2026-08-23 — 船殼曲線與帆面弧度修正（dev build 回饋）

- 天星小輪船底原本是「兩端圓角 + 中段 144 單位水平直線」，輪胎正下方那段完全是直的。改成從艏到艉一條連續曲線，最深點仍保持參考圖的飽滿舭部，水線漆帶跟著平行位移。
- 戎克帆的後緣原本從帆桁尖端沿切線緩緩張開，弧度不足。改成離開尖端就立刻鼓出，三面帆的最大寬度與高度比維持參考圖的 0.9，帆骨長度重算對齊新後緣。
- 戎克船殼重畫：舷弧最低點移到中後段、船底同樣去掉水平直線段、艉部起翹加大；棕色腹板與舷側開口依新舷弧重新定位，艏樓與船燈落到甲板上。
- 戎克艙房窗戶改用 `--hk-hull`，與天星小輪的窗戶同色。

## 2026-08-23 — 戎克船重畫、三艘船分層水平線、天星小輪修正

### 天星小輪
- 煙囪原本比船身中線右偏 1 單位，星徽又比煙囪左偏 1 單位，兩處都對不齊。煙囪、黑頂、樓梯間、星徽現在一律以 `x=420` 為準；星徽同時放大並重算座標，讓外框正中於露出的白色段。
- 船底水線漆帶改成「與艉舭曲線平行」的帶狀，而非水平矩形，因此一路延伸到兩端艏艉都維持等寬。
- 輪胎碰墊改畫成圓環，中間透出船殼綠，才看得出是輪胎而不是黑點。
- 一度加上的甲板橫向線腳已移除：參考圖的窗戶是乾淨的，加了反而雜亂。

### 戎克船（依新參考圖 1:1 重畫）
- 長斜艏柱、平直舷弧、上翹船艉；棕色腹板與五個舷側開口以 clip 夾在船殼內；艙房有外伸屋簷與八扇亮窗；艏樓小艙房與紅頂船燈。
- 三面縱帆的帆骨往桅杆左側與後緣兩邊都伸出去——這是戎克帆最關鍵的辨識特徵，原本沒有。
- 船殼配色由深藍改為參考圖的棕色系，新增 `--hk-junk` / `--hk-junk-mid` token。

### 三艘船分層
- 遊艇留在岸線當最遠、天星小輪下移 22 單位、戎克船畫在最低最大，形成前中後三層景深。天星小輪用外層 `<g>` 位移，因為 `.hk-bob` 動的是 `transform`，直接寫在同一個元素上會被 CSS 蓋掉。
- `VESSELS` 新增 `top` 欄位，讓每艘船的倒影從自己的水平線往下拖，而不是三艘都從岸線開始。

## 2026-08-22 — 天星小輪依正側面參考圖重畫

- 依使用者提供的正側面參考圖重新量比例重畫，取代先前憑印象畫的版本。全長 244 viewBox 單位，船身／綠色下層甲板／白色客艙各約佔 76 單位乾舷的三分之一，桅杆再往上 41 單位；雙頭船故全船以 `x=420` 鏡射對稱。
- 新增細節：兩端尖削斜艏艉之間的平直舷弧、以 `#hk-ferry-hull` clip 在艉舭曲線內的水線漆帶、每側四格開放欄杆艙與三片客艙玻璃加一組帶框窗、與上方直紋樓梯間對齊的機艙罩、20 扇圓角客艙窗、24 個舷窗、跨在屋頂線上的四座天窗、黑頂白身帶星徽的煙囪、防撞條上四個輪胎碰墊。
- 船殼綠由偏藍綠改為參考圖的森林綠，另加 `--hk-ferry-deep` token 畫水線漆帶。
- `harbour-scene.ts` 的 `VESSELS` 天星小輪範圍改為 `298…542`、depth `48`，讓 canvas 倒影仍對得上船身。

## 2026-08-22 — 維港 hero 第二輪：日月切換、星空融合、Canvas 水面

### Sun / moon
- 月亮改為只在 dark 模式出現；light 模式換成太陽（實心圓 + 多段日暈）。以 `.hk-day` / `.hk-night` 搭配 `.dark` class 切換，未套主題時視同 light。
- 新增 `--hk-sun` 與 `--hk-glint` token。`--hk-glint` 代表「當下掛在天上的那顆」，水面的鏡面光路直接跟著它換色。

### Stars
- 移除 SVG 內的靜態星星，改由既有的 `CityField` 單獨負責，避免兩套星空並存。
- `CityField` 配色改為暖白 + 金 + 少量品牌青，最亮的幾顆加十字星芒；亮度隨高度往地平線衰減，銜接天際線的天空漸層；light 模式完全不畫星星。

### Water（Canvas）
- 新增 `src/components/hero/HarbourWater.tsx`：以 canvas 取代原本靜態的 SVG 水波。內容包含對齊上方建築燈光的倒影光柱、月/日光漣灑、各船隻的顏色暈染、以及橫向漂移的水面紋理。離開視窗時暫停，`prefers-reduced-motion` 下只畫一張靜態幀。
- 新增 `src/components/hero/harbour-scene.ts`：SVG 與 canvas 共用的場景幾何與燈光來源，倒影因此會落在真正發光的那一欄下方。
- `HarbourSkyline` 改為輸出 `.hk-scene` grid 容器，依 viewBox 水平線（578/760）切成兩列，讓 canvas 在任何寬度都貼齊岸邊。

### Vessels
- 天星小輪：雙頭斜艏艉、防撞條、煙囪、前後駕駛室、兩層甲板窗，吃水改淺。
- 戎克船：改為正統四邊形硬帆（斜桁 + 竹骨 + 後緣扇形外凸）、上翹船舷加金色舷緣、船首斜桅與船眼、船尾艙房。
- 遊艇：斜擋風玻璃、雷達架、航行燈。
- 三艘船改為僅略低於水平線，並在水面留下尾流。

### Theme
- scroll cue 遮罩改用新的 `--hk-cue-scrim`：dark 壓深、light 提亮。原本固定用 `--hk-water-deep`，在淺色水面上會變成一塊灰斑。

### Note
- `.hk-scene` 刻意不宣告 `position`：先前草稿寫了 `position: relative`，權重與 Tailwind 的 `absolute` 相同但排在樣式表後面，會把整幅場景推到 hero 頂端。

## 2026-08-22 — 首頁 hero 背景：手繪維港天際線 SVG

### Hero backdrop
- 新增 `src/components/hero/HarbourSkyline.tsx`：手繪維港夜景 flat-vector SVG（viewBox 1600×760），含會展中心殼形頂、中環廣場金字塔冠、中銀大廈 X 形桁架、國金二期、摩天輪、太平山脊與發射塔、天星小輪、紅帆戎克船、遊艇、水面燈影。窗光與水波以固定 seed 的 mulberry32 產生，確保 SSR/CSR 標記一致。
- 接進 `ImmersionHero`，置於 `CityField` 星空層之上（z-1）、文案層之下（z-10）。

### Theme
- `globals.css` 新增 `--hk-*` token 兩套：dark 為夜景、light 為黃昏藍灰，避免深色插畫壓掉淺色主題的深色標題。
- 新增 `.hero-pin-city` 視差（`--p` 位移約為星空層一半）與 `--hk-scale` 響應式縮放（<640px 1.28 / <1024px 1.22 / 桌機 1）。
- 新增窗光閃爍、船身搖晃、摩天輪旋轉、塔頂航警燈動畫，全數在 `prefers-reduced-motion` 下停用。
- scroll cue 遮罩改用 `--hk-water-deep`，並新增 `--hk-cue-ink`；原本的 `--bg-base` 遮罩疊在水面上會變成一塊色斑。

### Fix
- `ImmersionHero` 的 ScrollPin track 由 `h-[70vh]` 改為 `h-[112vh]`（手機）。原值低於視窗高度，使 ScrollPin 在載入當下就把 `--p` 解為 1，導致手機版 hero 文案完全透明。

### Theme
- 新增 `--signal-ink` token（solid signal 背景上的文字色），修正 dark-mode 淺藍底 + 白字對比度不足：light=白字、dark=近黑字。
- 將 `.signal-cta`、`.pill-cta`、PricingCards 內所有 `bg-[var(--signal)] text-[var(--text-primary)]` 改為 `text-[var(--signal-ink)]`。

### Brand / assets
- 新增透明 favicon 組（`easecity-favicon.ico` / `.png` / `easecity-apple-touch-icon.png`），取代原白底 `easecity-logo.png`。
- 新增 `src/components/brand/BrandMark.tsx`：主題響應的品牌標記（訊號中心 + 四向節點），採 CSS 變數、透明背景。
- PillNav、Footer、login/register 頁統一改為 BrandMark；導覽列加入 wordmark。

### Auth animations
- `LoginBackground` 改為動態浮動訊號節點背景（純 CSS，尊重 reduced-motion）。
- register 頁補上與 login 一致的 AnimatePresence loading 遮罩 + LoginBackground。

### Navigation
- 手機漢堡按鈕改三條線 + 轉 X 動畫；mobile popover 加滑入動畫與更精緻樣式。

### Services page
- 服務頁新增「過往案例」區（3 張照片級 AI 生成圖 + 動畫卡片）、「如何取得報價」三步流程 + 電子郵件 CTA。
- 服務卡片與流程卡片補上 whileInView 淡入動畫。

### Pricing
- Enterprise 定價由「From $2,499/yr」改為「Contact us／聯絡我們」；`$2,499` 保留為內部 anchor（見 SUBSCRIPTION_TIERS.md §4、D-09）。
- 同步 metadata、CommandPalette、chat system prompt、docs。

## 2026-05-11 — Logout, JWKS, Redis JWT deny-list, download manifest discovery, Stripe catalog verify

### Auth / licensing
- **NEW** `POST /api/v1/auth/logout` — `204` empty body; registers JWT digest in Upstash Redis until token `exp` when configured.
- **NEW** `src/lib/license-jwt-revocation.ts` — Redis-backed revoke check keyed by SHA-256 of raw JWT.
- `requireEcShareLicense` is now **async** and enforces revocation; **`verifyLicenseJwtWithRevocationCheck`** wraps refresh/account flows.
- **NEW** `GET /api/v1/license/jwks` — returns Ed25519 JWK set + `kid` (`LICENSE_JWT_KEY_ID`, default `2026a`).

### Downloads / M1 bridge
- **NEW** `GET /api/v1/download/latest-manifest` — discovery payload pointing at `dl.easecity.hk` manifest URL (env-overridable).
- `src/app/(public)/download/page.tsx` — surfaces manifest URL + API discovery link.

### Stripe ops
- **NEW** `scripts/dev/stripe-catalog-verify.mjs` + `npm run ecshare:stripe-verify` — verifies configured Price IDs have metadata `product=ec_share` and tier ∈ `{pro,business,enterprise}`.

### Tooling / tests
- `scripts/dev/ec-share-api-smoke.mjs` — `--test-logout` exercises logout + optional post-logout refresh rejection when Redis is configured.
- `playwright.config.ts` — injects deterministic Ed25519 `LICENSE_JWT_PRIVATE_KEY_PEM` for JWKS/API e2e (not for production).
- `e2e/api.spec.ts` — JWKS, latest-manifest, logout 401 coverage.

### Docs
- `docs/API_CONTRACT.md` → **v0.4**; §10 decision log; §3.5–3.7 new endpoints.
- `docs/WEB_TEAM_TASKS.md` — auth/download tasks marked done; founder Q section points to §10.

### Env
- `.env.example` — `NEXT_PUBLIC_EC_SHARE_DOWNLOAD_MANIFEST_URL`, `EC_SHARE_DOWNLOAD_*`, Stripe verify comment.

### Validation
- `npm run lint`, `npm run build`, `npm test` → all green (7 API e2e tests on Chromium).

## 2026-05-08 — Neon Prisma baseline applied
### Database
- Existing Neon DB returned Prisma `P3005` because the schema was non-empty but `_prisma_migrations` had no records.
- Marked `20260427172000_ec_share_m2_foundation` as applied with `npx prisma migrate resolve --applied`.
- Applied `20260505041000_stripe_webhook_events` with `npx prisma migrate deploy`.
- Confirmed `npx prisma migrate status` reports the DB schema is up to date.
- Confirmed via introspection that Neon now has `EmailOtpChallenge.purpose` and `StripeWebhookEvent`.

### Code / Docs
- `prisma/migrations/20260505041000_stripe_webhook_events/migration.sql` — made migration additive/idempotent for existing Neon DBs; adds `EmailOtpChallenge.purpose`, compound OTP index, and `StripeWebhookEvent` if missing.
- `prisma/migrations/README.md` — documented existing-Neon baseline behavior.
- `docs_legacy/STAGING_ENV_CHECKLIST.md` — added Prisma `P3005` baseline instructions.
- `docs/PROGRESS.md` — updated migration status.

### Validation
- `npx prisma migrate resolve --applied 20260427172000_ec_share_m2_foundation` → foundation migration marked applied for existing Neon DB.
- `npx prisma migrate deploy` → applied `20260505041000_stripe_webhook_events`.
- `npx prisma migrate status` → database schema is up to date.
- `npx prisma db pull --print` → confirmed `EmailOtpChallenge.purpose` and `StripeWebhookEvent`.

## 2026-05-08 — Resend key corrected + e2e service isolation
### Code
- `playwright.config.ts` — clears `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` for Playwright's dev server so API e2e tests do not send real contact emails or consume real Upstash rate-limit state.

### Local env
- `.env.local` — corrected local `RESEND_API_KEY` to the supplied real `re_...` key. This file remains uncommitted and must not be committed.

### Docs
- `docs/PROGRESS.md` — updated current validation notes.

### Validation
- `npm run ecshare:env-check` → all required staging env vars present.
- `npm test` → API e2e baseline 4/4 passing with external services isolated.
- `npm run check:staging` → env report, `prisma validate`, lint, build, and API e2e all green.

## 2026-05-06 — M2 staging deploy readiness check
### Code
- **NEW** `scripts/dev/check-staging-env.mjs` — redacted staging env presence checker; defaults to strict mode and supports `--allow-missing` for local structural checks.
- `package.json` — added `ecshare:env-check` and `check:staging`. `check:staging` runs env presence reporting, Prisma schema validation, lint, production build, and API e2e baseline.

### Docs
- `docs_legacy/STAGING_ENV_CHECKLIST.md` — added strict env check, `check:staging`, and explicit Prisma migration deploy notes.
- `prisma/migrations/README.md` — documented `20260505041000_stripe_webhook_events`.
- `docs/PROGRESS.md` — updated with the staging deploy readiness follow-up.

### Validation
- `npm run ecshare:env-check -- --allow-missing` → runs without printing secret values; reports missing explicit Pro/Business Stripe Price IDs and recommended production email/Redis/Enterprise Price ID vars.
- `npm run check:staging` → passes: env presence report, `prisma validate`, lint, production build, and API e2e baseline all green.

## 2026-05-06 — M2 staging readiness / smoke baseline
### Code
- `scripts/dev/ec-share-api-smoke.mjs` — added native password register/login smoke paths (`--register-password`, `--login-password`) and license lifecycle checks (`--test-license-lifecycle`, `--test-deactivate`) covering activate/heartbeat/deactivate.
- `package.json` — added `npm test` as a stable API e2e entry point (`e2e/api.spec.ts` on Chromium).

### Docs
- `docs_legacy/STAGING_ENV_CHECKLIST.md` — added M2 staging readiness commands for `npm test`, native register/login smoke, license lifecycle smoke, and manual Stripe duplicate-event verification via `StripeWebhookEvent`.
- `docs/PROGRESS.md` — updated with the staging readiness follow-up.

### Validation
- `npm run ecshare:smoke -- --help` → smoke script help/arg parsing works
- `npm run lint` → 0 warnings/errors
- `npm test` → API Playwright baseline 4/4 passing
- `npm run build` → production build successful after rerun; first attempt was run in parallel with Playwright dev server and hit transient `.next` contention (`/_document` not found)

## 2026-05-05 — Stripe entitlement baseline
### Code
- `prisma/schema.prisma` — added `StripeWebhookEvent` model for persistent Stripe webhook idempotency.
- **NEW** `prisma/migrations/20260505041000_stripe_webhook_events/migration.sql` — creates webhook event table with unique `eventId` and status/type/created indexes.
- `src/lib/stripe-webhook.ts` — added event-id dedupe/status recording; processed duplicates return 200, failed events remain retryable, and failure messages are stored for debugging.
- `src/lib/stripe-catalog.ts` — centralized `EC_SHARE_PRODUCT` and tier seat minimum helpers (`pro=1`, `business>=3`, `enterprise>=50`).
- `src/actions/stripe.ts` — scoped Pro trial eligibility to EC-Share subscriptions only and reused the product constant in Stripe metadata.

### Docs / Config
- `.env.example` — documented canonical `/webhooks/stripe`, legacy `/api/payment/webhook`, required Stripe Price metadata, Stripe Tax dashboard setup, and seat minimums.
- `docs/API_CONTRACT.md` — documented webhook idempotency via stored Stripe `event.id`.
- `docs/PROGRESS.md` — updated current status and file list for this baseline.

### Validation
- `npx prisma generate` → Prisma Client generated successfully
- `npm run lint` → 0 warnings/errors
- `npm run build` → production build successful
- `npm run test:e2e -- e2e/api.spec.ts --project=chromium` → 4/4 passing
- `npm test` not run because `package.json` has no `test` script.

## 2026-05-05 — EC-Share license/account API baseline
### Code
- `src/lib/validations/ec-share.ts` — added native password auth schemas and license lifecycle schema, reusing the existing SHA-256 device fingerprint and Windows platform validation.
- `src/lib/rate-limit-policy.ts` — added password auth and license lifecycle rate-limit windows.
- **NEW** `src/app/api/v1/auth/register/route.ts` — native-client password registration; creates an active member user, hashes password with bcrypt cost 12, starts eligible trial, and returns EC-Share `license_jwt`.
- **NEW** `src/app/api/v1/auth/login/route.ts` — native-client password login; validates active password accounts with neutral `INVALID_CREDENTIALS` failures and returns EC-Share `license_jwt`.
- **NEW** `src/app/api/v1/license/activate/route.ts` — validates bearer license + same device fingerprint and reissues a fresh device-bound license.
- **NEW** `src/app/api/v1/license/heartbeat/route.ts` — validates bearer license and updates `Device.lastSeenAt`.
- **NEW** `src/app/api/v1/license/deactivate/route.ts` — validates bearer license and removes the matching `Device` row; returns `token_revoked: false` until JWT deny-list storage is implemented.

### Docs
- `docs/API_CONTRACT.md` — bumped to v0.3 with native register/login and license activate/heartbeat/deactivate request/response shapes, rate limits, and host-heartbeat distinction.
- `docs/PROGRESS.md` — updated current status and file list for the baseline implementation.

### Validation
- `npm run lint` → 0 warnings/errors
- `npm run build` → production build successful
- `npm run test:e2e -- e2e/api.spec.ts --project=chromium` → 4/4 passing
- `npm test` not run because `package.json` has no `test` script.

## 2026-05-05 — Web/backend contract reconciliation
### Code
- `src/app/api/v1/health/route.ts` — added `services.database` to the health response so the implemented endpoint matches the existing API e2e contract.
- `e2e/api.spec.ts` — protected API test now targets active `/api/admin/stats` instead of deprecated `/api/payment/create-session` (which correctly returns 410).

### Docs
- `docs/API_CONTRACT.md` — bumped to v0.2 and reconciled with current Next.js implementation: `/api/v1/*` path prefix, `{ success, data, meta }` response envelope, implemented OTP/license/account/device endpoints, split change-email flow, current rate limits, Stripe webhook canonical path `/webhooks/stripe` plus legacy `/api/payment/webhook` compatibility, and current device-delete limitation.
- `docs/WEB_TEAM_TASKS.md` — marked implemented M2 foundation items (OTP auth, license refresh, account lookup, device management, Prisma schema/migration, Stripe webhook, JWT signing); left production Stripe/DNS/key material and logout/deny-list decisions pending.
- `docs/_WEBTEAM_README.md` — added May 2026 contract reconciliation summary for web-team handoff.
- `docs/COMPANY_ARCHITECTURE.md`, `docs/PRODUCT_ROADMAP.md`, `docs/SUBSCRIPTION_TIERS.md`, `docs/DASHBOARDS_SPEC.md` — normalized endpoint examples and future references to the implemented `/api/v1` convention.
- `docs/PROGRESS.md` — updated current status, blockers, and validation summary for this session.

### Validation
- `npm run lint` → 0 warnings/errors
- `npm run build` → production build successful
- `npm run test:e2e -- e2e/api.spec.ts --project=chromium` → 4/4 passing

## 2026-04-24 — M0.5 Day 8: first-run mode chooser + TopBar wired up
### Code
- **NEW** `client/lib/models/recent_host.dart` — `RecentHost` data class
- **NEW** `client/lib/services/persistence_adapter.dart` — typed facade over `Persistence`: `loadLastMode/saveLastMode`, `loadLastHost/saveLastHost`, `loadRecentHosts/addOrUpdateRecentHost`, generic `loadSetting/saveSetting`
- **NEW** `client/lib/widgets/mode_selection.dart` — full-screen two-card chooser ("Share my devices" / "Connect to a host") + inline host validation + recent-hosts list
- `client/lib/models/app_state.dart` — added `AppMode` enum + `AppModeX` extension; `_currentMode` field, `currentMode` getter, `setMode(mode)` method; kept `isHostingServer`/`setHostingServer` as legacy shims
- `client/lib/widgets/main_screen.dart` — `initState → _initialize` gate (persistence + CLI-aware); `_onModePicked`/`_openModeSelection`/`_splitHostPort` helpers; `_initNativeAndConnect` made re-entrant safe; build returns `Column[TopBar, Expanded(DeviceGrid)]` when mode established, `ModeSelection` when not
- `client/lib/widgets/top_bar.dart` — `_Logo` → `_ModePill` (icon + wordmark + divider + current-mode chip + chevron); `TopBar` takes optional `onSwitchMode`
- `client/lib/widgets/device_grid.dart` — `_EmptyState` reads `state.serverHost`/`state.isHostingServer` instead of hardcoded strings; translated Chinese copy out
- **Bonus fix**: `TopBar` was never wired into the MainScreen render tree (Day 7's Copy-host button was invisible) — fixed by parenting TopBar above DeviceGrid in a Column

### Docs
- `docs/API_CONTRACT.md` — new §6 "Host-endpoint format convention (D-40)" codifying single `host:port` contract; called out M1 single-socket forward-compatibility (D-44)
- `docs/WEB_TEAM_TASKS.md` — M3 heartbeat body + `GET /api/v1/account/devices/live` response now include `alias`/`video_codec`/`video_encoder`; deep-link carries `alias`; ⚠ note about D-39 Cloudflare drop; M4 org-level custom-actions and device-alias-sync placeholder
- `docs/DASHBOARDS_SPEC.md` — §1a device-row shows alias + phase dot + reachability + codec tag + last-seen
- `docs/_WEBTEAM_README.md` — late-April addendum with D-39..D-49 impact table
- **NEW** `dist/EC-Share-WebTeam-Docs-2026-04-24b.zip` (84.8 KB, 12 docs)

### Validation
- `flutter analyze` → 0 issues
- `flutter test` → 14/14 passing
- `flutter build windows --release` → `ec-share.exe` built in 15.8s, zero warnings


## 2026-04-23 — Product direction set: EC-Share (v0.2 after founder sign-off)
- Founder confirmed: MUPhone3 (repo codename) → commercial product **EC-Share** under parent **EaseCity**
- `docs/BRAND.md` v0.2: EC-Share, domain `easecity.hk`, tagline "Android device mirroring for teams.", wordmark logo deferred
- `docs/SUBSCRIPTION_TIERS.md` v0.2: **No free-forever tier**; 14-day Pro trial → Pro $19 → Business $49 → Enterprise from $2,499/yr; Stripe + Stripe Tax; EV code-signing cert
- `docs/PRODUCT_ROADMAP.md` v0.2: M1 target ~2026-07-02 (10 weeks), cloud budget ceiling $150/mo Y1 months 1-6, i18n = zh-HK + en, solo + Cursor model with EaseCity web team owning backend
- `docs/SHARE_ARCHITECTURE.md` v0.2: **libdatachannel** (not libwebrtc), Fly.io signaling (Go), **self-hosted coturn in HK + US-East** ($36/mo), Token TTL user-picked per link, per-link viewer identity toggle, PRC deferred post-M4
- `docs/API_CONTRACT.md` v0.1 (**new**): HTTPS contract between desktop client and EaseCity backend (license JWT shape, Stripe webhook spec, Postgres schema reference)

### Decision log (see PRODUCT_ROADMAP §7)
- D-01: defer AV1 Layer 3 until M4 reassessment
- D-02: single-binary packaging in M1
- D-03: LAN-first + cloud-assisted share in M3 (WebRTC + TURN, Vysor parity)
- D-04 to D-15: see ROADMAP for full list (brand, pricing, provider, budget, launch target, team)
- D-16: self-host policy — **TailScale model** (Enterprise-only on-prem; Trial/Pro/Business all use managed cloud)
- D-17: LAN share URL is free in all tiers, M1 ships "Copy local URL" button (no mDNS in M1)
- D-18: M0.5 Internal Test Build added — self-host alpha for 3-5 testers, 2-week scope before M1

### Workflow discipline (this session)
- New Cursor rule `.cursor/rules/update-progress.mdc` (alwaysApply) — agent must update tracking files every session
- New `docs/PROGRESS.md` (living status, < 200 lines, auto-maintained)
- New `docs/FOUNDER_TODO.md` (founder-only actions, EV cert / Stripe / DNS / brand decisions)
- New `docs/WEB_TEAM_TASKS.md` (EaseCity web+backend team task list + info they need from founder)
- New `docs/INTERNAL_TEST_BUILD.md` (M0.5 spec)

### Legal entity captured (late 2026-04-23)
- HK company confirmed: **EaseCity Technologies Limited · 逸城科技有限公司**, BR issued
- Decisions B-07/B-08/B-09 in BRAND.md
- Stripe HK application has BR ready (only bank account + UBO docs remaining)
- Legal entity strings for footer/ToS/privacy/invoicing now documented verbatim in WEB_TEAM_TASKS.md

### Stripe scope clarified (evening 2026-04-23)
- **Web team owns Stripe end-to-end** after founder's HK account KYC
- Founder's Stripe TODO reduced to: open account, pass KYC, invite web team as Developer-role members, pick statement descriptor
- Web team's Stripe TODO expanded: create products/prices, enable Stripe Tax, build Checkout + Customer Portal + webhook, own API key lifecycle
- Web team can develop against Stripe test-mode keys immediately (no blocker from founder)

### Three-dashboards model + website content (night 2026-04-23)
- **New** `docs/DASHBOARDS_SPEC.md` — separates User Dashboard (`/account`) from EaseCity Staff Admin (`admin.easecity.hk`) from Customer Org Admin (`/org`); Linear/GitLab/WorkOS pattern
- **New** `docs/WEBSITE_CONTENT.md` — 13 pages × content assets × CTA/telemetry wiring for easecity.hk
- D-19: three-dashboards model confirmed
- D-20: Staff Admin on separate subdomain with IP allowlist + 2FA (security isolation)
- D-21: Stripe delegation to web team codified as roadmap decision
- D-22: statement descriptor = **EASECITY**

### UX design pass part 2 — device card (evening 2026-04-24)
- **NEW** `docs/UX_DEVICE_CARD.md` — 330-line spec for 22 px top ActionBar per device with nickname, App ▾, ADB ▾, ℹ hover, ⋮ menu; removes old bottom overlay entirely
- D-45: device cards gain **top ActionBar** (Vysor pattern)
- D-46: **custom actions** schema + defaults (Settings/Chrome/Camera + Reboot/Power/Vol/Screenshot) user-configurable under Settings → Host → Custom actions
- D-47: **device aliases persisted by serial** (not device_id); inline double-click edit
- D-48: **hover info panel** on ℹ icon showing serial, Android, codec+encoder, dimensions, fps, bitrate, uptime, last IDR, phase
- D-49: current `device_card.dart` bottom device-name overlay **removed** — duplicate info + obstructs video
- `INTERNAL_TEST_BUILD.md` Day 9 scope expanded to absorb device-card work (~1 contiguous extra day; Day 10 installer absorbed within buffer)
- No code — Day 9 implementation pending founder green-light

### UX design pass for Day 8-9 (late 2026-04-24)
- **NEW** `docs/UX_MODE_SELECTION.md` — 400-line spec: state machine, first-run flow, top-bar pill, settings IA (4-section: General/Host/Connect/About), skeleton-shimmer rules, single-port decision, persistence schema, day-by-day plan
- D-39: **Cancel Cloudflare tunnel in M0.5** — LAN + router port forward + Tailscale/ngrok as tester-side alternatives
- D-40: Single-port = **UI-layer unification (Option A)** for M0.5; protocol multiplex deferred (rom1v PR #2547/#2877 rationale)
- D-41: First-run shows **mode selection full-screen** (Host / Connect cards); subsequent launches auto-resume last mode
- D-42: Settings **reorganized into 4 sections**; removes ad-hoc rows+cols stepper, ADB playground, detach toggle
- D-43: Copy-host dropdown includes **Public IP** (opt-in via `api.ipify.org`) with port-forward guidance
- D-44: True single-socket multiplexing **scheduled for M1**
- `INTERNAL_TEST_BUILD.md` Day 8-9 scope rewritten: mode UI + settings redesign + shimmer (was: Cloudflare tunnel)
- No code changes — design-only pass; Day 8-9 implementation pending founder green-light

### M0.5 Day 7 — Copy host UI (2026-04-24)
- **New** `client/lib/services/host_info.dart` — detects site-local IPv4 addresses (RFC 1918), filters virtual adapters (Hyper-V/WSL/VMware/Docker/tap/tun/ZeroTier/Tailscale prefix match), ranks 192.168.x > 10.x > 172.16-31.x
- `AppState` adds `lanAddresses` + `isHostingServer` (false when launched `--client-only`)
- `MUPhoneApp` marks `isHostingServer=false` when `initialHost != null`
- `MainScreen._initNativeAndConnect` kicks off IP detection in background (only if hosting)
- **`_CopyHostButton`** widget in top bar:
    - Single address → one-click copy (hover tooltip shows full `ip:port`)
    - Multi-address → PopupMenu dropdown listing all site-local IPv4s
    - SnackBar confirmation `"Copied host: 192.168.0.113:28100"` (floating, 2s)
    - Hidden in `--client-only` mode (this machine isn't hosting)
- Verified on founder machine: detects `192.168.0.113` + `10.5.0.2` (NordVPN); both shown in dropdown
- Zero analyzer issues (after 1-line doc-comment fix), 14/14 tests pass, rebuild zero-warning

### Web-team docs repackaged (2026-04-24)
- `dist/EC-Share-WebTeam-Docs-2026-04-24.zip` (77.9 KB) — 12 docs including all D-23..D-38 decisions + `_WEBTEAM_README.md` entry doc
- Safe to forward to EaseCity web/backend team

### Transport-model rethink + M0.5 Day 6 (midnight 2026-04-23)
- D-34: **Cancel M0.5 focus mode** — not worth Day 6-7 cost for internal alpha
- D-35: **Two transport paths** — native peer (TCP, primary, low-latency) + browser WebRTC (fallback, zero-install). Matrix of when-to-use in SHARE_ARCHITECTURE.md §0.
- D-36: **M0.5 is native-only transport** — browser viewer deferred to M3 (saves ~2 days)
- D-37: **`ec-share://connect?host=...&device_id=...&token=...`** protocol handler for dashboard 1-click device open; installer registers URL scheme under HKEY_CLASSES_ROOT (M3 work)
- D-38: Dashboard device list has both "Open in app" (primary, D-37 protocol) and "Open in browser" (fallback, browser WebRTC) buttons
- D-33 superseded: Cloudflare tunnel changes from HTTP to **TCP mode** since consumers are native peers not browsers
- Docs updated: INTERNAL_TEST_BUILD (scope shrinks), SHARE_ARCHITECTURE (two-path rationale), DASHBOARDS_SPEC (device list + protocol), PRODUCT_ROADMAP (+D-34~D-38), WEB_TEAM_TASKS (M3 dashboard items), FOUNDER_TODO (Done log)
- **Code**: `client/lib/main.dart` now accepts `List<String> args` and extracts `--client-only <host>`; threads host via `MUPhoneApp.initialHost` into `AppState.setServerHost`. 14/14 tests green. Rebuild zero warning.

### M0.5 Day 2-5 — single-binary (night 2026-04-23)
- **Server library extraction**: `server/src/server_lib.{h,cpp}` — `run_server(ServerOptions)` + `run_server_cli(argc,argv)` public API. All main-loop logic (ADB poller, launch pool, TCP video/control servers, health monitor) now reusable as library.
- **CMake split**: `server/CMakeLists.txt` → `ec-share-server-lib` (STATIC, 16 MB, all subsystems) + `ec-share-server` (thin exe forwarding to `run_server_cli`)
- **Unified binary**: `client/windows/runner/main.cpp` detects mode via argv:
    - default (no flags) → hybrid: spawn server worker thread, run Flutter UI
    - `--server-only` → call `run_server_cli`, no Flutter
    - `--client-only` → Flutter UI only, no local server (placeholder; will consume url arg in M1)
- **Cooperative shutdown**: `ServerOptions.external_stop_event` lets Flutter signal server teardown via `WaitForMultipleObjects`; `install_ctrl_handler=false` in hybrid mode (no console handler needed)
- **Output**: `ec-share.exe` (815 KB) — single binary replaces the `ec-share-server.exe` + `ec-share-client.exe` pair for end-user install. Zero warnings.
- **Smoke test**: hybrid mode process boots, ports 28100/28101 listening, Flutter UI's control client connects to in-process server.
- **`<shellapi.h>` explicit include** in runner `main.cpp` + `utils.cpp` — `WIN32_LEAN_AND_MEAN` propagated from server-lib's PUBLIC compile definitions was hiding `CommandLineToArgvW`.
- **Scripts consolidated**: new `scripts/start-ec-share.bat` for unified binary; `start-server.bat` retained for headless server-only builds; `start-client.bat` becomes a thin shim.
- **Legacy retained**: `ec-share-server.exe` still ships for Enterprise on-prem / factory / CI deployments that don't want the Flutter UI.

### M0.5 Day 1 — user-visible rebrand (late evening 2026-04-23)
- **Binaries renamed** to user-visible product name:
    - `muphone-server.exe` → `ec-share-server.exe` (server CMake target + project name)
    - `muphone_client.exe` → `ec-share-client.exe` (client CMake BINARY_NAME only; project name + Dart package name preserved)
- **Log file** `muphone-server.log` → `ec-share-server.log`
- **Log banner** "=== MUPhone Server v..." → "=== EC-Share Server v... (alpha) ===" + EaseCity Technologies Limited (逸城科技有限公司) subtitle
- **Window title** (Dart) and **initial window title** (runner/main.cpp) show "EC-Share"
- **Runner.rc resource metadata**: CompanyName=`EaseCity Technologies Limited`, FileDescription=`EC-Share — Android device mirroring for teams`, ProductName=`EC-Share`, InternalName=`ec-share-client`, OriginalFilename=`ec-share-client.exe`, LegalCopyright updated
- **Top-bar brand text**: "MUPhone" → "EC-Share"
- **Detach-device window title** in native plugin: "MUPhone Device" → "EC-Share Device"
- **Scripts**: `start-server.bat` / `start-client.bat` point to new binaries
- **VERSION.txt**: `0.1.0` → `0.0.5-alpha.1`
- **Runner CMake `/utf-8` flag added** — resolves C4819 on zh-HK Windows (CP950 default code page); future-proofs non-ASCII UI strings
- **`client/build/native_assets/windows`** mkdir'd — Flutter's native-asset hook target (got wiped by recursive `Remove-Item client/build`)
- Builds: server zero-warning, client zero-warning; 14/14 Dart tests pass
- **Deferred to Day 2-5 single-binary refactor**: C++ `namespace muphone`, Dart classes (`MUPhoneColors`, `MUPhoneApp`, `MUPhoneShortcutManager`), Dart package `muphone_client`, plugin folder `muphone_native`, MethodChannel name

### i18n expansion + M0.5 public-tunnel + web-team zip handoff (midnight 2026-04-23)
- D-32: i18n scope expanded from en+zh-HK to **7 M1 launch locales**: en + zh-Hant + zh-Hans + ja + ko + pt-BR + es (covers ~75% Android-dev population)
- D-11 superseded by D-32 (history preserved)
- D-33: M0.5 gains **public-tunnel mode** via embedded Cloudflare Tunnel (`cloudflared.exe`) for beyond-LAN testing
- M0.5 scope: +public tunnel button, +minimal browser viewer page (WebCodecs H.264 decode)
- M0.5 implementation order: 10 days → 14-15 days (tunnel + viewer page)
- **Web team documentation packaged** into `dist/EC-Share-WebTeam-Docs-2026-04-23.zip` (70 KB, 12 docs)
- New `docs/_WEBTEAM_README.md` entry doc with reading order + top 5 questions needing web-team decision

### Multi-product umbrella architecture (late night 2026-04-23)
- **New** `docs/COMPANY_ARCHITECTURE.md` — Stripe/Atlassian/GitHub-platform-style umbrella; 3-layer identity (Account → Org → Product subscription); shared vs product-namespaced API paths; cross-product vs product-specific DB tables
- D-23: EaseCity = umbrella brand; EC-Share = product #1 of N
- D-24: `account.easecity.hk` is cross-product User Dashboard (single sign-on across all future EaseCity products)
- D-25: API gateway splits shared (`/auth/*` `/account/*` `/license/*` `/org/*` `/billing/*`) from product-specific (`/ec-share/*` `/<future>/*`)
- D-26: License JWT carries `product` claim; one JWT per product per user
- D-27: Stripe products scoped as "EC-Share Pro/Business/Enterprise"; prices metadata `{ product, tier }`
- D-28: DB `subscriptions`/`licenses`/`trials`/`devices`/`audit_log` carry `product`; `users`/`orgs`/`org_members` don't
- D-29: Staff Admin shows product switcher (default "All products")
- D-30: Customer Org Admin at `account.easecity.hk/org/<slug>` (cross-product scope)
- D-31: Corporate content pages (Privacy, ToS, About, Contact) shared across products at `easecity.hk/*`
- Aligned: BRAND.md, DASHBOARDS_SPEC.md, API_CONTRACT.md, WEBSITE_CONTENT.md, SUBSCRIPTION_TIERS.md, FOUNDER_TODO.md

---

## 系統目前狀態

| 指標 | 狀態 |
|------|------|
| 伺服器 | 穩定運行，12 裝置 ONLINE，零振盪 |
| scrcpy-server | ADB forward + TCP socket，77-byte header 解析實際解析度，max_size=720 |
| 客戶端連線 | 成功（EventChannel 事件到達 Dart） |
| 裝置列表 | 正確顯示，報告實際 video + physical 解析度 |
| 斷線偵測 | ControlClient disconnect_handler → 即時通知 Dart |
| H264 解碼 | MFT 軟體解碼 + IMF2DBuffer stride 修正 → NV12 D3D11 staging texture |
| 影片渲染 | 共享 VideoProcessor（1 個）+ per-device OutputView → BGRA shared handle |
| UI | 6×2 網格，NavBar ADB 按鈕，手勢/鍵盤控制，ADB 文字輸入 |

---

## 改動總覽

### 1. scrcpy 傳輸模型

| 項目 | 實際實作 |
|------|---------|
| 二進位 | `scrcpy-server` JAR (v2.7) |
| 啟動方式 | `adb shell app_process / com.genymobile.scrcpy.Server 2.7 tunnel_forward=true` |
| 傳輸 | ADB forward + TCP socket |
| max_size | **720**（原 1920，減少解碼負擔，提升 FPS） |
| Header 解析 | **77 bytes**（原 76），正確解析 codec_id + width + height |
| 實際解析度 | 從 header 讀取並報告（e.g. 328×720 for 20:9 phone） |
| 物理解析度 | 啟動前執行 `adb shell wm size` 取得（用於手勢座標映射） |
| 啟動前清理 | `adb shell ps | grep scrcpy | kill` + `forward --remove-all` |
| Push 驗證 | push 後 `adb shell ls` 驗證檔案存在 |

### 2. 伺服器

| 項目 | 實作 |
|------|------|
| 主迴圈 | Event-driven (`WaitForSingleObject`) + **LaunchPool(4 workers)** |
| 裝置啟動 | 非阻塞並行（最多 4 台同時），同時查詢 physical 解析度 |
| Health monitor | 只在 process dead + NAL timeout 時觸發 restart（queue-based，非阻塞） |
| 時間比較 | `safe_elapsed()` 防 uint64 underflow |
| 退避 | 1/2/4/8/10s cap + jitter(0-400ms) |
| Keyframe cache | 每裝置緩存 SPS+PPS+IDR，新 client 訂閱時立即發送 |
| SendQueue config 處理 | config NAL 累積（不被 IDR 覆蓋），dequeue 順序：config → IDR → P-frame |
| **TCP 傳送修復** | **per-session 專用發送線程（阻塞 I/O），消除 WOULDBLOCK 數據丟失** |
| **TCP 鎖優化** | **broadcast_frame 快照 session 指標，send 在鎖外執行，消除 PipeReader 阻塞** |
| device_list 欄位 | 新增 `physical_width`, `physical_height`, `width`, `height`（實際 scrcpy 解析度） |

### 3. 客戶端 Native Plugin

| 項目 | 實作 |
|------|------|
| Plugin 註冊 | C-export `MUPhonePluginRegisterWithRegistrar` 從 runner 呼叫 |
| Event dispatch | Adaptive demand-driven timer（EmitEvent CAS arm 1ms） |
| ControlClient 斷線偵測 | `disconnect_handler_` → EmitEvent("disconnected") |
| H264 解碼 | MFT (`CLSID_CMSH264DecoderMFT`) 軟體解碼（無 DXGI manager） |
| STREAM_CHANGE 處理 | 只重新協商 output type，保留 MFT 內部 NAL 緩衝 |
| NV12 stride | **IMF2DBuffer::Lock2D 取得實際 pitch**（修正右側條紋根因之一） |
| **共享 VideoProcessor** | **ONE VideoProcessorEnumerator + ONE VideoProcessor 供所有 12 台設備共用（消除 ~8 個上限）** |
| per-device 資源 | 每台設備只需一個 VideoProcessorOutputView |
| Texture 輸出 | NV12 staging → 共享 VideoProcessorBlt → BGRA shared handle → Flutter Texture |
| SPS/PPS 處理 | StreamManager 累積 SPS+PPS，合併後送 create_decoder |
| 解碼迴圈 | `drain_all_output()`: 最多 10 次 ProcessOutput 迴圈，非阻塞 |
| Sample 時間戳 | 單調遞增，100ns 單位，每幀 +333333 (~30fps) |
| **recv/decode 分離** | **VideoReceiver recv 線程只接收，推入 work_queue；單一 decode_worker 線程解碼** |
| **ADB 自動偵測** | **AdbExecutor 啟動時自動 SearchPath adb.exe 或找 vendor 目錄** |

### 4. 客戶端 UI (Flutter/Dart)

| 項目 | 實作 |
|------|------|
| 標題列 | Win32 原生（自訂 icon.ico + 動態中文標題） |
| 標題格式 | `MUPhone — IP — X 在線 / Y 裝置` |
| 視窗內容 | 100% DeviceGrid（無應用內頂部列） |
| Device Card | 影片區 + 底部 NavBar (22px)，無頂部 ADB 列 |
| **NavBar 按鈕** | **◀ → `input keyevent 4` (Back)；○ → `input keyevent 3` (Home)；☰ → `input keyevent 187` (Recent)** |
| **網格預設** | **6×2（原 5×2），state.json 持久化，啟動自動套用** |
| 設定（按 = 開啟） | 伺服器 IP/Port + 連線狀態 + 網格配置 + 裝置列表（中文） |
| 伺服器斷線 | 自動清空裝置列表，標題更新為「離線」 |
| 伺服器 IP | 設定視窗可修改並重新連接 |
| **activeSerial** | **AppState 追蹤最後互動設備，作為鍵盤/手勢輸入目標** |
| **手勢控制** | **左鍵點擊 → ADB tap；拖拽 → ADB swipe；長按 → ADB long press** |
| **滑鼠右鍵** | **→ `input keyevent 4` (Android Back)** |
| **滑鼠中鍵** | **→ 雙擊當前游標位置（連發兩次 tap，間距 80ms）** |
| **全域鍵盤輸入** | **點擊設備後成為鍵盤目標；可見字元 → ADB_INPUT_TEXT；Enter/Space → keyevent 66；Backspace → keyevent 67；Ctrl+V → 讀取剪貼板 → ADB_INPUT_TEXT** |
| **座標映射** | **widget 座標 × (physicalWidth / widgetWidth) → 設備物理座標** |
| **physicalWidth/Height** | **從 server device_list 接收（來自 `adb shell wm size`），估算比例用於 ADB 輸入** |

### 5. 已修復的 Bug

| Bug | 根因 | 修復 |
|-----|------|------|
| **12 台只有 8 台有畫面** | **VideoProcessorBlt 資源上限 ~8，後 4 台 CreateVideoProcessor 靜默失敗** | **ONE 共享 VideoProcessorEnumerator + VideoProcessor，per-device 只建 OutputView** |
| **右側彩色直條** | **VideoProcessor OutputWidth=328，BGRA texture=328，但 GPU 對齊邊界像素保留舊幀** | **共享 VP OutputWidth = BGRA texture width（精確填充）+ NV12 stride 修正** |
| **畫面不即時（首幀靜止）** | **recv 線程同步呼叫 MFT decode（~15ms），TCP 背壓導致 P-frame 全丟** | **recv/decode 分離：recv 線程只接收，work_queue + decode_worker 線程** |
| **TCP 串流損壞後凍結** | **VideoSession::send_pending WOULDBLOCK 丟棄 payload 殘餘，下一幀 header 錯位** | **per-session 阻塞發送線程，send_all 確保完整傳輸** |
| **scrcpy 解析度錯誤** | **server 回報硬編碼 1080×1920，實際 scrcpy 輸出 328×720** | **解析 77-byte scrcpy header 取得 width/height，正確回報** |
| **ADB 命令無效** | **AdbExecutor.adb_path_ 從未設置（空字串）** | **啟動時自動 SearchPath adb.exe 或找 vendor 目錄** |
| MFT ProcessOutput 不產出幀 | STREAM_CHANGE 時 configure_types() 重設 input type | 分離 set_output_type()，STREAM_CHANGE 只重新協商 output |
| PostMessage 事件不到達 Dart | 外部 PluginRegistrar delegate 不被 engine 路由 | Adaptive timer 取代 PostMessage |
| Health monitor 殺死靜態畫面裝置 | 30s NAL timeout 不區分 process alive/dead | 只在 process dead 時觸發 restart |
| SendQueue 丟棄 config NAL | config 被 IDR 覆蓋 | config 累積不被清除 |

---

## 已知待解決

| 問題 | 狀態 |
|------|------|
| 右側條紋（4 台不顯示） | 共享 VideoProcessor 部署中，測試驗證中 |
| 多 GPU 廠商相容性矩陣測試 | 待執行 |
| scrcpy 靜態畫面時不發送 P-frame | 正常行為（畫面無變化時 scrcpy 不發送新幀） |
