/**
 * Longer-form copy for the `/services/[slug]` detail pages, bilingual.
 *
 * `services.ts` holds what a service is; this holds what it is like to buy one.
 * The three detail-page layouts each draw on a different part of it, so a block
 * appears on the page that has a use for it rather than on all of them:
 *
 *   signals + deliverables + outOfScope   the datasheet
 *   needFromYou + STAGE_DETAIL            the engagement walk-through
 *   faq + COMMON_FAQ                      the questions page
 *
 * Nothing in here states a price, a duration, or a past result. Those are the
 * founder's to commit to, and a sales page is the wrong place to guess.
 */

export interface Bilingual {
  en: string
  zh: string
}

export interface BilingualList {
  en: string[]
  zh: string[]
}

export interface FaqEntry {
  q: Bilingual
  a: Bilingual
}

export interface ServiceContent {
  /** What this is, in one line, without the brochure voice. */
  definition: Bilingual
  /** Situations a visitor recognises as their own. Why they opened this page. */
  signals: BilingualList
  /** The artefacts that exist at the end and belong to the client. */
  deliverables: BilingualList
  /** Where this service stops. Said plainly, before anyone pays. */
  outOfScope: BilingualList
  /** What the engagement needs from the client's side to be possible. */
  needFromYou: BilingualList
  /** Questions particular to this service. The general ones are shared below. */
  faq: FaqEntry[]
}

export const SERVICE_CONTENT: Record<string, ServiceContent> = {
  'system-development': {
    definition: {
      en: 'Software that runs on a machine you own: desktop applications, background services, device pipelines.',
      zh: '在你自己機器上運行的軟體：桌面應用程式、背景服務、裝置管線。',
    },
    signals: {
      en: [
        'A workflow held together by scripts, a spreadsheet, and one person who knows how it works.',
        'Something has to run locally, on hardware, or in real time, and a web app cannot reach it.',
        'You have a prototype that works and no idea how to make it survive twenty users.',
      ],
      zh: [
        '一條靠腳本、一份 Excel，以及一位知道它怎麼運作的同事撐著的流程。',
        '有些事情必須在本機、在硬體上或即時執行，網頁應用碰不到。',
        '已經有一個能跑的原型，但不知道怎麼讓它撐住二十個使用者。',
      ],
    },
    deliverables: {
      en: [
        'A source repository you own, with build scripts that work on a clean machine.',
        'A signed installer or deployable binary for each target platform.',
        'Operations notes: how to run it, what breaks, where the logs are.',
        'A handover session with whoever will maintain it.',
      ],
      zh: [
        '屬於你的原始碼倉庫，附上在乾淨機器上就能建置的腳本。',
        '每個目標平台的簽章安裝檔或可部署執行檔。',
        '運維筆記：怎麼啟動、會壞在哪裡、日誌在哪裡。',
        '與後續維護者的交接會議。',
      ],
    },
    outOfScope: {
      en: [
        'Round-the-clock on-call. We set up the monitoring and train your team, or we agree a support arrangement separately.',
        'Rescuing a codebase nobody has read. That starts as an audit, under consulting.',
        'Machine-learning or AI features are included only where they are named in the scope. If you mention "AI" in a meeting, that prompts a scoping conversation, not an assumption that it is in the price.',
      ],
      zh: [
        '全天候值班待命。我們會建好監控並訓練你的團隊，或另行約定支援方式。',
        '搶救一份沒人讀過的程式碼庫。那要從稽核開始，屬於諮詢服務。',
        '機器學習或 AI 功能，只有在範圍文件裡明確寫出時才會包含。如果會議中提到「AI」，那會觸發一次範圍討論，而不是預設它已含在價格內。',
      ],
    },
    needFromYou: {
      en: [
        'Someone who can answer how the work actually gets done today.',
        'Access to the hardware, devices, or systems the software has to talk to.',
      ],
      zh: [
        '一位能回答「現在實際上是怎麼做的」的同事。',
        '軟體必須對接的硬體、裝置或系統的存取權。',
      ],
    },
    faq: [
      {
        q: {
          en: 'Can you work with the hardware we already have?',
          zh: '能配合我們現有的硬體嗎？',
        },
        a: {
          en: 'Usually. Send the model numbers and what protocol it speaks. If it has a documented interface, or we can watch its traffic, we can drive it. EC-Share began as exactly this kind of problem.',
          zh: '多數情況可以。把型號和它使用的協定告訴我們。只要有文件化的介面，或我們能觀察它的通訊，就能驅動它。EC-Share 本身就是從這類問題開始的。',
        },
      },
      {
        q: {
          en: 'What happens if the person who built it moves on?',
          zh: '如果負責建置的人離開了怎麼辦？',
        },
        a: {
          en: 'Nothing, provided the handover was real. The repository, the build scripts, and the operations notes are yours, and we walk your maintainer through them before the engagement closes.',
          zh: '只要交接是真的做過，就不會有事。倉庫、建置腳本與運維筆記都屬於你，而且結案前我們會帶著你的維護人員走過一遍。',
        },
      },
    ],
  },

  'web-platforms': {
    definition: {
      en: 'Everything behind a URL: the public site, the dashboard your customers log into, the admin panel your team lives in.',
      zh: 'URL 背後的一切：對外網站、客戶登入的儀表板，以及你的團隊每天都在用的後台。',
    },
    signals: {
      en: [
        'Customers email you asking for things they should be able to do themselves.',
        'The business runs out of a spreadsheet that three people edit at once.',
        'The site works, but changing a price or publishing a post needs a developer.',
      ],
      zh: [
        '客戶用電郵來要的東西，其實他們應該可以自己完成。',
        '整個營運靠一份三個人同時在改的 Excel。',
        '網站是能用，但改一個價錢或發一篇文章都得找工程師。',
      ],
    },
    deliverables: {
      en: [
        'The platform running on your own domain and your own accounts.',
        'An admin surface for the things you will want to change every week.',
        'Auth, billing, transactional email, and rate limiting wired up and tested.',
        'The repository, documented environment variables, and a deploy anyone on your team can trigger.',
      ],
      zh: [
        '平台上線運行，跑在你自己的網域與你自己的帳號上。',
        '一個後台介面，用來改那些你每週都會想改的東西。',
        '登入驗證、帳單、交易郵件與限流，都接好並測過。',
        '程式碼倉庫、環境變數說明，以及團隊任何人都能觸發的部署。',
      ],
    },
    outOfScope: {
      en: [
        'Copywriting and photography. We build the slots; the words and pictures are yours, or we bring in someone.',
        'Native mobile apps. We build responsive web; a real iOS or Android app is a separate conversation.',
      ],
      zh: [
        '文案與攝影。我們把版位做好，文字和照片由你提供，或我們代為找人。',
        '原生行動 App。我們做的是響應式網頁；真正的 iOS 或 Android App 是另一件事。',
      ],
    },
    needFromYou: {
      en: [
        'Domain and DNS access, plus whoever owns the payment account.',
        'A decision on who inside your team owns the content after launch.',
      ],
      zh: [
        '網域與 DNS 的存取權，以及支付帳號的負責人。',
        '決定上線之後由團隊裡的誰負責維護內容。',
      ],
    },
    faq: [
      {
        q: { en: 'Do we own the code and the accounts?', zh: '程式碼和帳號是我們的嗎？' },
        a: {
          en: 'Both. The repository is transferred to your organisation, and hosting, database, and payment accounts are opened in your name from the start. We are added as collaborators, not as the owner.',
          zh: '兩者都是。倉庫會轉移到你的組織，而主機、資料庫與支付帳號從一開始就以你的名義開立。我們是被加入的協作者，不是擁有者。',
        },
      },
      {
        q: {
          en: 'Can you take over a site someone else built?',
          zh: '能接手別人做的網站嗎？',
        },
        a: {
          en: 'Often, and it is usually cheaper than a rewrite. We read it first and tell you honestly whether it is worth keeping. If it is not, you hear that before you pay for a migration.',
          zh: '通常可以，而且往往比重寫便宜。我們會先讀過，然後老實告訴你值不值得留下。如果不值得，你會在付遷移費用之前先知道。',
        },
      },
    ],
  },

  'ui-ux-design': {
    definition: {
      en: 'How the product looks, and more to the point, what happens the moment someone touches it.',
      zh: '產品看起來如何，更關鍵的是，有人碰它的那一刻會發生什麼事。',
    },
    signals: {
      en: [
        'The product does more than the competitor and still feels harder to use.',
        'Every new screen is drawn from scratch, so nothing quite matches anything else.',
        'Dark mode arrived later, and half the screens have a colour that only works in one of them.',
      ],
      zh: [
        '產品的功能比競品多，用起來卻還是比較難。',
        '每一個新頁面都從零畫起，所以沒有一處是真的對齊的。',
        '深色模式是後來才加的，一半頁面的顏色只在其中一種模式下成立。',
      ],
    },
    deliverables: {
      en: [
        'A token set — colour, type, spacing, radius — as values your code imports.',
        'The components that carry the product, in both themes and every state.',
        'The flows that matter, including the empty, loading, and error states.',
        'A short written rationale, so the next person knows why and not only what.',
      ],
      zh: [
        '一組 token（顏色、字級、間距、圓角），以程式可直接引用的數值交付。',
        '支撐產品的元件，涵蓋兩種主題與每一種狀態。',
        '關鍵流程，包含空狀態、載入中與錯誤狀態。',
        '一份簡短的設計理由，讓下一個人知道為什麼，而不只是知道長什麼樣。',
      ],
    },
    outOfScope: {
      en: [
        'Design that stops at a picture. If it cannot be built at the size and speed you need, it is not finished.',
        'Illustration and 3D as a discipline of their own. We commission those when a project calls for them.',
      ],
      zh: [
        '只做到「一張圖」的設計。如果做不到你需要的尺寸與速度，那就不算完成。',
        '插畫與 3D 這類專門領域。專案需要時我們會另外委外。',
      ],
    },
    needFromYou: {
      en: [
        'Access to the product as a real user sees it, ideally with real data.',
        'One person with the authority to approve a direction.',
      ],
      zh: [
        '以真實使用者身分存取產品的權限，最好帶著真實資料。',
        '一位有權拍板決定方向的負責人。',
      ],
    },
    faq: [
      {
        q: { en: 'Do you hand over Figma files or code?', zh: '你們交付 Figma 檔還是程式碼？' },
        a: {
          en: 'Whichever your team can act on. If your engineers build the front end, Figma plus tokens. If we build it, the design lives in the codebase and the Figma is a sketch. Paying for a beautiful file nobody implements is the most common way design budget is wasted.',
          zh: '交付你的團隊真正用得上的那一種。如果前端由你的工程師實作，就給 Figma 加 token。如果由我們實作，設計就直接住在程式碼裡，Figma 只是草稿。花錢買一份漂亮但沒人實作的檔案，是設計預算最常見的浪費。',
        },
      },
      {
        q: {
          en: 'Can you redesign without breaking what already works?',
          zh: '能重新設計，又不弄壞現在能用的東西嗎？',
        },
        a: {
          en: 'That is the normal case. We audit first, list what is genuinely wrong, and leave alone what your users already know how to find. A redesign that moves everything spends the familiarity you paid to build.',
          zh: '這才是常態。我們先做稽核，列出真正有問題的地方，把使用者已經熟悉的東西留在原位。把所有東西都搬家的改版，會花掉你辛苦累積的熟悉度。',
        },
      },
    ],
  },

  consulting: {
    definition: {
      en: 'A second opinion with its hands in the code. You keep building; we tell you where it is going to hurt.',
      zh: '一份會親手翻程式碼的第二意見。你繼續往前做，我們告訴你哪裡會痛。',
    },
    signals: {
      en: [
        'Shipping has got slower every quarter and nobody can point at the reason.',
        'You are about to commit to an architecture and want someone to argue with first.',
        'An investor or an acquirer is asking technical questions you cannot answer with confidence.',
      ],
      zh: [
        '出貨速度每一季都在變慢，但沒人指得出原因。',
        '即將定案一套架構，想先找人來吵一輪。',
        '投資人或收購方問的技術問題，你沒有把握回答。',
      ],
    },
    deliverables: {
      en: [
        'A written findings document, ordered by what to fix first rather than by what we found first.',
        'The reproduction steps and measurements behind every performance claim.',
        'A walkthrough with your engineers, not a document dropped in a folder.',
      ],
      zh: [
        '一份書面稽核報告，依「該先修哪個」排序，而不是依「我們先看到哪個」排序。',
        '每一項效能結論背後的重現步驟與量測數據。',
        '與你的工程師逐項走過一遍，而不是丟一份文件到資料夾就結束。',
      ],
    },
    outOfScope: {
      en: [
        'A verdict on individual people. We review systems and process, not performance.',
        'Implementing the fixes as part of the audit. That is quoted separately, and you are free to take the report elsewhere.',
        'Vetting a vendor claim about a feature that does not exist yet. We review what runs today and what a roadmap realistically commits to, not what a slide deck promises.',
      ],
      zh: [
        '對個別成員的評價。我們檢視系統與流程，不做績效考核。',
        '在稽核範圍內順手把問題修好。那會另外報價，而你也可以拿著報告去找別人做。',
        '替還不存在的功能背書廠商的宣稱。我們審查今天實際上線的東西，以及路線圖真正承諾的範圍，而不是投影片上的承諾。',
      ],
    },
    needFromYou: {
      en: [
        'Read access to the repository and, ideally, to production metrics.',
        'An hour each with two or three of the people who work in it daily.',
      ],
      zh: [
        '程式碼倉庫的讀取權限，最好也包含生產環境的監控數據。',
        '與兩三位每天在裡面工作的同事，各一小時。',
      ],
    },
    faq: [
      {
        q: {
          en: 'Will you tell us things we would rather not hear?',
          zh: '你們會說我們不太想聽的話嗎？',
        },
        a: {
          en: 'That is what you are paying for. We will also tell you when something you were told is broken turns out to be fine, which happens more often than people expect.',
          zh: '你付錢買的就是這個。我們也會告訴你，哪些被說成有問題的東西其實沒事，這種情況比多數人以為的更常見。',
        },
      },
      {
        q: { en: 'How short can an engagement be?', zh: '合作可以短到什麼程度？' },
        a: {
          en: 'A few days is enough for a focused question: one performance problem, one architecture decision, one due-diligence read. A request phrased as "review everything" usually means the real question has not been found yet, and we help you name it before quoting.',
          zh: '針對一個聚焦的問題，幾天就夠：一個效能問題、一個架構決策、一次技術盡調。凡是講成「全面檢查」的需求，通常表示真正的問題還沒找到，我們會先幫你把它講清楚再報價。',
        },
      },
    ],
  },

  advertising: {
    definition: {
      en: 'Paid and organic channels, run against a number you actually care about.',
      zh: '付費與自然流量渠道，對著一個你真正在意的數字來經營。',
    },
    signals: {
      en: [
        'The traffic report looks healthy and the sales pipeline does not.',
        'An agency sends monthly slides full of impressions and you cannot tell what they bought you.',
        'You are paying for ads that land on a page nobody has looked at in a year.',
      ],
      zh: [
        '流量報表看起來很健康，業績管道卻不是。',
        '代理商每月寄來滿是曝光數的簡報，你看不出這筆錢買到了什麼。',
        '你在付錢投廣告，而它指向一個一年沒人檢查過的頁面。',
      ],
    },
    deliverables: {
      en: [
        'Tracking that survives an audit: events, conversions, and where each one is defined.',
        'Campaigns built inside your own ad accounts, which stay yours.',
        'One dashboard showing spend against the outcome rather than against clicks.',
        'Landing page changes shipped, not merely recommended.',
      ],
      zh: [
        '經得起查核的追蹤設定：事件、轉換，以及每一項定義在哪裡。',
        '建在你自己廣告帳戶裡的活動，帳戶始終屬於你。',
        '一個儀表板，看的是花費對應成果，而不是花費對應點擊。',
        '落地頁的修改實際上線，不只是寫在建議裡。',
      ],
    },
    outOfScope: {
      en: [
        'Buying followers, engagement, or reviews. Anything that inflates a number without moving the business.',
        'Committing to a cost per acquisition before there is data. You get a range and the assumptions behind it instead.',
      ],
      zh: [
        '買粉絲、買互動、買評價。任何只把數字吹大、卻推不動生意的做法。',
        '在還沒有數據之前承諾單次獲客成本。我們會先給你一個區間，以及背後的假設。',
      ],
    },
    needFromYou: {
      en: [
        'Admin access to the ad accounts and analytics, or permission to create them.',
        'Your real numbers: what a customer is worth, and what you can afford to pay for one.',
      ],
      zh: [
        '廣告帳戶與分析工具的管理權限，或是開立它們的授權。',
        '你的真實數字：一位客戶的價值，以及你能承受的獲客成本。',
      ],
    },
    faq: [
      {
        q: { en: 'What is the smallest budget worth spending?', zh: '最少要投多少才值得做？' },
        a: {
          en: 'Below a few thousand a month, paid search rarely gathers enough data to optimise, and the money usually does more on the landing page and on SEO groundwork. We will say so rather than take the retainer.',
          zh: '每月低於幾千元的預算，付費搜尋通常收集不到足夠數據來優化，那筆錢花在落地頁和 SEO 基礎上效果更好。我們會直說，而不是先把費用收下來。',
        },
      },
      {
        q: { en: 'Can you work with the site we have?', zh: '能用我們現有的網站做嗎？' },
        a: {
          en: 'Yes, and we will usually want to change it. An ad that lands on a page which does not answer the promise in the ad is the most expensive mistake in this category. If the page is off limits, you hear where the ceiling is before we start.',
          zh: '可以，而且我們通常會想動它。廣告帶去的頁面若無法回應廣告裡的承諾，是這個領域最貴的錯誤。如果那個頁面不能改，我們會在開始前先告訴你成效的天花板在哪。',
        },
      },
    ],
  },

  'brand-design': {
    definition: {
      en: 'The mark, the type, and the rules that keep them recognisable everywhere they turn up.',
      zh: '標誌、字體，以及讓它們在任何地方出現都仍然可辨認的規則。',
    },
    signals: {
      en: [
        'The logo exists as one PNG that somebody has been resizing for three years.',
        'The deck, the site, and the product each look like a different company.',
        'You are about to print something expensive and nobody can find the right file.',
      ],
      zh: [
        'Logo 只存在於一張 PNG，而有人已經把它縮放了三年。',
        '簡報、網站和產品，看起來像三家不同的公司。',
        '你即將付錢印一批東西，而沒人找得到正確的檔案。',
      ],
    },
    deliverables: {
      en: [
        'The mark in every format and lockup you will actually be asked for, including the one-colour version.',
        'Type, colour, and spacing rules as a short document people will finish reading.',
        'Working files, not only exports, in a structure your team can find things in.',
        'The mark applied to the three or four places it will be seen most.',
      ],
      zh: [
        '標誌的各種格式與組合，涵蓋你實際會被要求的那些，包含單色版。',
        '字體、顏色與間距規則，寫成一份人真的會讀完的短文件。',
        '可編輯的原始檔，不只是輸出檔，並以團隊找得到東西的結構整理。',
        '把標誌套用在它最常被看見的那三、四個地方。',
      ],
    },
    outOfScope: {
      en: [
        'Naming and trademark clearance as a service. We flag an obvious conflict, but the legal search belongs to a lawyer.',
        'Rolling a rebrand across your product on our own. Someone on your side has to own the switchover.',
      ],
      zh: [
        '命名與商標檢索這類獨立服務。明顯的衝突我們會提出，但法律檢索屬於律師的工作。',
        '由我們單方面把品牌改版推上你的整個產品。切換這件事必須有你方的人負責。',
      ],
    },
    needFromYou: {
      en: [
        'Whatever exists today, including the files you are embarrassed by.',
        'Three brands you admire, and one sentence each on why.',
      ],
      zh: [
        '目前手上有的所有東西，包含你覺得難看的那些檔案。',
        '三個你欣賞的品牌，以及各一句話說明為什麼。',
      ],
    },
    faq: [
      {
        q: { en: 'How many logo directions do we see?', zh: '我們會看到幾個 Logo 方向？' },
        a: {
          en: 'Three, developed far enough to judge, rather than thirty thumbnails. Thirty options is a way of handing the decision back to you; three means the discarding has already been done.',
          zh: '三個，而且做到足以判斷的完成度，不是三十張縮圖。三十個選項是把決定丟回給你；三個代表淘汰已經先做完了。',
        },
      },
      {
        q: { en: 'Can we keep our current colour?', zh: '可以保留現在的品牌色嗎？' },
        a: {
          en: 'If it is doing work for you, yes. Recognition you already own is an asset, and discarding it is the most common own goal in a rebrand. If it fails a contrast check we will propose a companion rather than a replacement.',
          zh: '如果它正在替你工作，可以。既有的辨識度是一項資產，把它丟掉是品牌改版最常見的自傷。如果它過不了對比檢查，我們會建議替它加一個搭配色，而不是換掉它。',
        },
      },
    ],
  },
}

/**
 * Asked on every service, so answered once. These sit after the two questions
 * particular to the service, because a visitor who came for consulting wants the
 * consulting answer before the terms of business.
 */
export const COMMON_FAQ: FaqEntry[] = [
  {
    q: { en: 'How do we start?', zh: '怎麼開始？' },
    a: {
      en: 'Send a note, or use the enquiry form on this page. You get a written reply, usually within one business day, and a call only if there is something worth talking through.',
      zh: '寄一封短訊，或用這個頁面上的查詢表單。你通常會在一個工作日內收到書面回覆，只有在真的有事情要談時才會安排通話。',
    },
  },
  {
    q: { en: 'What does it cost?', zh: '費用怎麼算？' },
    a: {
      en: 'It depends on scope, so the honest answer is a written quote rather than a number on a page. After a short call you get scope, milestones, and a timeline in writing, usually within two business days, with no obligation.',
      zh: '取決於範圍，所以誠實的答案是一份書面報價，而不是頁面上的一個數字。經過一次簡短通話後，你通常會在兩個工作日內收到書面的範圍、里程碑與時程，且不附帶任何義務。',
    },
  },
  {
    q: { en: 'Can you work alongside our own team?', zh: '能和我們自己的團隊一起做嗎？' },
    a: {
      en: 'Yes, and it is often the better arrangement. We work inside your repository, your board, and your review process. We would rather leave your team more capable than more dependent.',
      zh: '可以，而且往往是更好的安排。我們在你的倉庫、你的看板、你的 code review 流程裡工作。我們寧願讓你的團隊變得更有能力，而不是更依賴我們。',
    },
  },
  {
    q: { en: 'What if the scope changes halfway?', zh: '做到一半範圍變了怎麼辦？' },
    a: {
      en: 'It usually does. Changes are priced as they come up and approved by you before they are built, so the surprise lands in the schedule rather than in the invoice.',
      zh: '通常都會變。變更會在發生時報價，並在動工前取得你的同意，所以意外會落在時程上，而不是帳單上。',
    },
  },
  {
    q: { en: 'Can you guarantee a performance figure up front?', zh: '你能在開始前保證某個效能數字嗎？' },
    a: {
      en: 'Not before the work starts, and it would be dishonest of anyone to say so. Measured results depend on your hardware, data, and workload, so we commit to a target and to how we will measure it in the written scope. If we beat it, good; if we miss it, you hear it in a review before it has cost you money.',
      zh: '在開始之前沒人能保證，有人這樣說反而是不誠實。量測結果取決於你的硬體、資料與工作負載，所以我們會在書面範圍文件裡寫明目標，以及我們如何量測它。達標更好；若未達標，也會在真正花到你的錢之前，先在檢討會上讓你知情。',
    },
  },
  {
    q: { en: 'Do you take rush jobs or round-the-clock work?', zh: '你們接急單或做全天候工作嗎？' },
    a: {
      en: 'Rush is possible when the calendar allows, and it is quoted on top rather than folded in. Round-the-clock on-call or guaranteed response times are a separate support arrangement, not part of a build project.',
      zh: '時程容許時可以接急單，會另外報價，而不是含在專案內。全天候待命或保證回應時間屬於獨立的支援合約，不包含在建置專案裡。',
    },
  },
]

/**
 * The four stages already named in `t.servicesPage.p1..p4`, given the two things
 * a stage description usually leaves out: what exists when it ends, and what it
 * needs from the client while it runs. Shared across services, because the
 * shape of an engagement does not change with the discipline.
 */
export const STAGE_DETAIL: { output: Bilingual; yours: Bilingual }[] = [
  {
    output: {
      en: 'A written scope: what is in, what is out, and what is still uncertain.',
      zh: '一份書面範圍：包含什麼、不包含什麼，以及還不確定什麼。',
    },
    yours: {
      en: 'An hour with the person who knows how the work is done today.',
      zh: '一小時，來自最清楚目前流程怎麼跑的那位同事。',
    },
  },
  {
    output: {
      en: 'Something you can click, or drawings precise enough to argue with.',
      zh: '一個你能點擊的東西，或精確到足以拿來爭論的設計稿。',
    },
    yours: {
      en: 'One round of honest reactions, from someone able to decide.',
      zh: '一輪誠實的反饋，來自有權做決定的人。',
    },
  },
  {
    output: {
      en: 'A working build every week, on a link you can open, with the changes listed.',
      zh: '每週一個可運行的版本，一個你打得開的連結，並列出改了什麼。',
    },
    yours: {
      en: 'Twenty minutes a week to look at it and say what is wrong.',
      zh: '每週二十分鐘，看一下它，然後說出哪裡不對。',
    },
  },
  {
    output: {
      en: 'It runs in your accounts, monitored, with the notes needed to keep it running.',
      zh: '它跑在你的帳號裡，有監控，並附上維持它運作所需的筆記。',
    },
    yours: {
      en: 'A named owner on your side, so support requests have somewhere to go.',
      zh: '你方一位指定負責人，讓後續的支援請求有地方去。',
    },
  },
]

export function getServiceContent(slug: string): ServiceContent | undefined {
  return SERVICE_CONTENT[slug]
}
