export interface LegalSection {
  title: string
  subsections?: {
    title: string
    body: string[]
  }[]
  body?: string[]
}

export interface LegalTerms {
  lastUpdated: string
  intro: string[]
  sections: LegalSection[]
}

export const termsContent: Record<'en' | 'zh', LegalTerms> = {
  en: {
    lastUpdated: 'April 10, 2026',
    intro: [
      'Please read these Terms of Service ("Terms") carefully before using the easecity platform. By creating an account or using our services, you agree to be bound by these Terms. If you do not agree, do not access or use our services.',
    ],
    sections: [
      {
        title: '1. Acceptance of Terms',
        body: [
          'These Terms constitute a legally binding agreement between you (or the entity you represent, "Customer") and easecity ("easecity", "we", "us") governing access to and use of the easecity stream control infrastructure platform, related APIs, dashboards, and any associated services (collectively, the "Services").',
          'If you are accepting these Terms on behalf of a company or other legal entity, you represent that you have the authority to bind that entity to these Terms.',
        ],
      },
      {
        title: '2. Eligibility',
        body: [
          'You must be at least 18 years old to use our Services. By using the Services, you represent and warrant that:',
          'You are at least 18 years of age.',
          'You have the legal capacity to enter into a binding agreement.',
          'Your use of the Services does not violate any applicable laws or regulations.',
        ],
      },
      {
        title: '3. Accounts',
        body: [
          'To access most features of the Services, you must register for an account. You agree to:',
          'Provide accurate, current, and complete information during registration.',
          'Maintain the security of your password and accept responsibility for all activity that occurs under your account.',
          'Notify us immediately at hello@easecity.hk of any unauthorised use of your account.',
          'Not share your account credentials with any third party.',
          'We reserve the right to suspend or terminate accounts that we reasonably believe are being used fraudulently, abusively, or in violation of these Terms.',
        ],
      },
      {
        title: '4. Subscription Plans & Billing',
        subsections: [
          {
            title: '4.1 Plans',
            body: [
              'We offer several subscription tiers (Trial, Pro, Business, Enterprise) as described on our Pricing page. Features, device limits, and SLA commitments vary by plan.',
            ],
          },
          {
            title: '4.2 Free Trial',
            body: [
              'We may offer a free trial period. No payment is required during the trial (a valid payment method is required to start it). At the end of the trial, your subscription will automatically convert to the paid plan you selected unless you cancel before the trial ends. Cancellation during the trial period results in immediate deactivation.',
            ],
          },
          {
            title: '4.3 Billing Cycle & Payment',
            body: [
              'Subscriptions are billed on a monthly or annual basis, as selected at checkout. Payment is processed by Stripe. By subscribing, you authorise us to charge your payment method on a recurring basis until you cancel. All fees are in the currency displayed at checkout and are exclusive of applicable taxes.',
            ],
          },
          {
            title: '4.4 Cancellation',
            body: [
              'You may cancel your subscription at any time through your account\'s billing settings. Cancellation takes effect at the end of the current billing period — you will retain full access until that date. We do not provide prorated refunds for the remaining unused portion of a billing period, except where required by law.',
            ],
          },
          {
            title: '4.5 Price Changes',
            body: [
              'We reserve the right to modify pricing at any time. We will provide at least 30 days\' advance notice of any price increase via email. Continued use of the Services after the effective date constitutes acceptance of the new pricing.',
            ],
          },
          {
            title: '4.6 Overdue Payments',
            body: [
              'If payment fails, we may suspend your access to the Services. We will notify you by email and provide a reasonable cure period before any suspension.',
            ],
          },
        ],
      },
      {
        title: '5. Acceptable Use',
        body: [
          'You agree not to use the Services to:',
          'Violate any applicable local, national, or international law or regulation.',
          'Transmit any unlawful, harmful, defamatory, infringing, or objectionable content.',
          'Attempt to gain unauthorised access to any part of the Services or related systems.',
          'Reverse engineer, decompile, or disassemble any portion of the Services.',
          'Use automated scripts or bots to access the Services in a way that adversely affects performance for other users.',
          'Resell or sublicense the Services without our prior written consent.',
          'Use the Services to build a competing product or service.',
          'We reserve the right to investigate suspected violations and may suspend or terminate your account without notice if we determine a serious violation has occurred.',
        ],
      },
      {
        title: '6. Intellectual Property',
        body: [
          'The Services, including all software, designs, trademarks, logos, documentation, and content provided by easecity, are owned by or licensed to easecity and are protected by copyright, trademark, and other intellectual property laws.',
          'We grant you a limited, non-exclusive, non-transferable, revocable licence to access and use the Services solely in accordance with these Terms. Nothing in these Terms transfers any ownership of our intellectual property to you.',
          'You retain ownership of any data or content you upload to the Services ("Customer Data"). By using the Services, you grant us a limited licence to process and store Customer Data solely to provide the Services to you.',
        ],
      },
      {
        title: '7. Service Availability & SLA',
        body: [
          'We strive to maintain the uptime commitments stated in your subscription plan. Planned maintenance windows will be communicated in advance where possible. SLA credits, where applicable to Business or Enterprise plans, are the Customer\'s sole remedy for downtime events.',
          'We do not guarantee that the Services will be available without interruption or error. Scheduled maintenance, force majeure events, or third-party infrastructure failures may cause temporary unavailability.',
        ],
      },
      {
        title: '8. Confidentiality',
        body: [
          'Each party may have access to confidential information of the other party. Both parties agree to keep such information confidential, use it only for the purposes of the agreement, and protect it with at least the same degree of care used for their own confidential information (but no less than reasonable care).',
        ],
      },
      {
        title: '9. Disclaimer of Warranties',
        body: [
          'THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
          'WE DO NOT WARRANT THAT THE SERVICES WILL MEET YOUR REQUIREMENTS, BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT DEFECTS WILL BE CORRECTED.',
        ],
      },
      {
        title: '10. Limitation of Liability',
        body: [
          'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL EASECITY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, BUSINESS, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF THE SERVICES.',
          'OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID TO EASECITY IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.',
          'Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you.',
        ],
      },
      {
        title: '11. Indemnification',
        body: [
          'You agree to defend, indemnify, and hold harmless easecity and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or in any way connected with: (a) your access to or use of the Services; (b) your violation of these Terms; or (c) your infringement of any third-party right.',
        ],
      },
      {
        title: '12. Termination',
        body: [
          'Either party may terminate these Terms: (a) upon 30 days\' written notice for any reason; or (b) immediately if the other party materially breaches these Terms and fails to cure the breach within 14 days of written notice.',
          'Upon termination, your right to access the Services will cease. We will retain your data for a period of 30 days after termination, after which it may be permanently deleted. Sections that by their nature should survive termination (including Sections 6, 9, 10, 11, and 13) shall survive.',
        ],
      },
      {
        title: '13. Governing Law & Dispute Resolution',
        body: [
          'These Terms are governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region, without regard to its conflict of law provisions.',
          'Any dispute arising out of or relating to these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, the dispute shall be submitted to the exclusive jurisdiction of the courts of Hong Kong.',
        ],
      },
      {
        title: '14. Modifications to Terms',
        body: [
          'We reserve the right to modify these Terms at any time. We will notify you of material changes by updating the "Last updated" date and, where warranted, by email. Your continued use of the Services after the effective date of revised Terms constitutes acceptance. If you do not agree to the revised Terms, you must stop using the Services.',
        ],
      },
      {
        title: '15. General Provisions',
        body: [
          'Entire Agreement. These Terms (together with our Privacy Policy and any order forms) constitute the entire agreement between you and easecity regarding the Services and supersede all prior agreements.',
          'Severability. If any provision of these Terms is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.',
          'Waiver. Our failure to enforce any right or provision of these Terms will not constitute a waiver of that right or provision.',
          'Assignment. You may not assign or transfer your rights under these Terms without our prior written consent. We may assign our rights and obligations without restriction.',
          'Language. These Terms are provided in English. Any translated version is provided for convenience only; the English version shall prevail in the event of any conflict.',
        ],
      },
      {
        title: '16. Contact Us',
        body: [
          'If you have any questions about these Terms, please contact us:',
          'easecity',
          'Hong Kong Special Administrative Region',
          'hello@easecity.hk',
        ],
      },
    ],
  },
  zh: {
    lastUpdated: '2026 年 4 月 10 日',
    intro: [
      '在使用 easecity 平台前，請仔細閱讀本服務條款（「條款」）。一旦建立帳戶或使用我們的服務，即表示您同意受本條款約束。如您不同意，請勿存取或使用我們的服務。',
    ],
    sections: [
      {
        title: '1. 條款的接受',
        body: [
          '本條款構成您（或您所代表的實體，「客戶」）與 easecity（「easecity」、「我們」）之間具有法律約束力的協議，規範對 easecity 串流控制基礎設施平台、相關 API、儀表板及任何相關服務（合稱「服務」）的存取與使用。',
          '如果您代表公司或其他法律實體接受本條款，即表示您聲明您有權使該實體受本條款約束。',
        ],
      },
      {
        title: '2. 資格',
        body: [
          '您必須年滿 18 歲方可使用我們的服務。使用服務即表示您聲明並保證：',
          '您已年滿 18 歲。',
          '您具備締結具約束力協議的法律行為能力。',
          '您對服務的使用不會違反任何適用的法律或法規。',
        ],
      },
      {
        title: '3. 帳戶',
        body: [
          '若要存取服務的大部分功能，您必須註冊帳戶。您同意：',
          '在註冊期間提供準確、最新且完整的資訊。',
          '維護您密碼的安全，並對帳戶下發生的所有活動承擔責任。',
          '如發現任何未經授權使用您帳戶的情況，請立即透過 hello@easecity.hk 通知我們。',
          '不與任何第三方分享您的帳戶憑證。',
          '我們保留暫停或終止任何我們合理認為以欺詐、濫用方式使用或違反本條款的帳戶之權利。',
        ],
      },
      {
        title: '4. 訂閱方案與帳單',
        subsections: [
          {
            title: '4.1 方案',
            body: [
              '我們提供數種訂閱等級（試用版、專業版、商業版、企業版），如我們的定價頁面所述。功能、裝置限制及 SLA 承諾因方案而異。',
            ],
          },
          {
            title: '4.2 免費試用',
            body: [
              '我們可能提供免費試用期。試用期間無需付款（開始試用需先提供有效的付款方式）。試用結束時，除非您在試用結束前取消，否則您的訂閱將自動轉換為您所選擇的付費方案並扣款。在試用期間取消會導致立即停用。',
            ],
          },
          {
            title: '4.3 帳單週期與付款',
            body: [
              '訂閱按月或按年計費，依結帳時所選而定。付款由 Stripe 處理。訂閱即表示您授權我們在您取消前按週期向您的付款方式請款。所有費用均以結帳時顯示的貨幣計價，且不含適用的稅費。',
            ],
          },
          {
            title: '4.4 取消',
            body: [
              '您可隨時透過帳戶的帳單設定取消訂閱。取消將於目前帳單週期結束時生效——在此之前您仍可享有完整存取權限。對於帳單週期內尚未使用的剩餘部分，我們不提供比例退費，法律另有規定者除外。',
            ],
          },
          {
            title: '4.5 價格變更',
            body: [
              '我們保留隨時修改定價的權利。我們將透過電子郵件就任何價格上調提供至少 30 天的提前通知。在生效日期後繼續使用服務，即構成接受新定價。',
            ],
          },
          {
            title: '4.6 逾期付款',
            body: [
              '如付款失敗，我們可能暫停您對服務的存取權限。我們會以電子郵件通知您，並在暫停前提供合理的補救期間。',
            ],
          },
        ],
      },
      {
        title: '5. 可接受使用',
        body: [
          '您同意不將服務用於以下目的：',
          '違反任何適用的本地、國家或國際法律或法規。',
          '傳輸任何非法、有害、誹謗、侵權或令人反感之內容。',
          '試圖未經授權存取服務的任何部分或相關系統。',
          '對服務的任何部分進行逆向工程、反編譯或反組譯。',
          '以對其他使用者效能產生不利影響之方式，使用自動化腳本或機器人存取服務。',
          '未經我們事先書面同意，轉售或再授權服務。',
          '使用服務建構競爭性產品或服務。',
          '我們保留調查可疑違規行為的權利，並可能在認定發生嚴重違規時，在不另行通知的情況下暫停或終止您的帳戶。',
        ],
      },
      {
        title: '6. 智慧財產權',
        body: [
          '服務（包括 easecity 所提供之所有軟體、設計、商標、標誌、文件及內容）歸 easecity 所有或由 easecity 取得授權，並受著作權、商標及其他智慧財產權法律保護。',
          '我們授予您一項有限、非專屬、不可轉讓、可撤銷之授權，僅得依據本條款存取及使用服務。本條款中之任何內容均未將我方智慧財產權之任何所有權移轉予您。',
          '您保留您上傳至服務之任何資料或內容（「客戶資料」）的所有權。使用服務即表示您授予我們一項有限授權，僅為向您提供服務而處理並儲存客戶資料。',
        ],
      },
      {
        title: '7. 服務可用性與 SLA',
        body: [
          '我們致力於維持您訂閱方案中所載的運作時間承諾。計畫性維護時段將在可行情況下提前告知。SLA 回饋（如適用於商業版或企業版方案）是用戶對停機事件的唯一救濟措施。',
          '我們不保證服務將不中斷或無錯誤地提供。排定維護、不可抗力事件或第三方基礎設施故障可能導致暫時無法使用。',
        ],
      },
      {
        title: '8. 保密義務',
        body: [
          '當事人任一方均可能接觸到另一方的保密資訊。雙方同意對此類資訊予以保密，僅將其用於本協議之目的，並以處理自身保密資訊時至少同等之注意程度（但不低於合理注意程度）加以保護。',
        ],
      },
      {
        title: '9. 保證之免責聲明',
        body: [
          '服務係以「依現狀」及「依可用狀態」提供，不含任何明示或默示之保證，包括但不限於可銷售性、特定用途之適用性或未侵權之保證。',
          '我們不保證服務將符合您的要求、不中斷、即時、安全或無錯誤，亦不保證缺陷將被修正。',
        ],
      },
      {
        title: '10. 責任限制',
        body: [
          '在法律允許的最大範圍內，easecity 在任何情況下均不對因本條款或您使用服務所生或與其相關的任何間接、附帶、特殊、衍生性或懲罰性損害，或因利潤、收入、資料、業務或商譽之損失負責。',
          '我們就因本條款所生或與本條款相關之所有索賠對您的累計總責任，不得超過引發該索賠事件發生前十二（12）個月內您向 easecity 支付之金額。',
          '某些司法管轄區不允許排除特定保證或限制責任，因此上述部分限制可能不適用於您。',
        ],
      },
      {
        title: '11. 賠償',
        body: [
          '您同意就下列事項所生或以任何方式與其相關之任何索賠、責任、損害、損失及費用（包括合理的法律費用）為 easecity 及其高階主管、董事、員工與代理人辯護、進行賠償並使其免受損害：(a) 您存取或使用服務；(b) 您違反本條款；或 (c) 您侵害任何第三方之權利。',
        ],
      },
      {
        title: '12. 終止',
        body: [
          '任一方均得終止本條款：(a) 以任何理由提前 30 天書面通知；或 (b) 若另一方實質違反本條款，且在書面通知後 14 天內未能補正違約情形，則可立即終止。',
          '終止後，您存取服務的權利將告停止。我們會在終止後保留您的資料 30 天，之後該資料可能被永久刪除。依性質應於終止後繼續存續之條款（包括第 6、9、10、11 及 13 條）應繼續存續。',
        ],
      },
      {
        title: '13. 適用法律與爭議解決',
        body: [
          '本條款受香港特別行政區之法律管轄並依其解釋，不適用其法律衝突規定。',
          '因本條款所生或與本條款相關之任何爭議，應首先嘗試透過善意協商解決。如於 30 天內未能解決，該爭議應提交香港法院專屬管轄。',
        ],
      },
      {
        title: '14. 條款之修改',
        body: [
          '我們保留隨時修改本條款的權利。我們將透過更新「最後更新」日期，並於適當時以電子郵件方式，通知您重大變更。在修訂條款之生效日期後繼續使用服務，即構成接受。如您不同意修訂後之條款，即必須停止使用服務。',
        ],
      },
      {
        title: '15. 一般規定',
        body: [
          '完整協議。本條款（連同我們的隱私權政策及任何訂購單）構成您與 easecity 之間關於服務之完整協議，並取代所有先前之協議。',
          '可分性。如本條款之任何規定被認定無效或不可執行，其餘規定仍維持完全效力。',
          '棄權。我們未能執行本條款之任何權利或規定，不構成對該權利或規定之放棄。',
          '轉讓。未經我們事先書面同意，您不得轉讓或移轉您於本條款下之權利。我們得不受限制地轉讓我們之權利與義務。',
          '語言。本條款以英文提供。任何翻譯版本僅供參考；如有任何衝突，應以英文版本為準。',
        ],
      },
      {
        title: '16. 聯絡我們',
        body: [
          '如您對本條款有任何疑問，請聯絡我們：',
          'easecity',
          '香港特別行政區',
          'hello@easecity.hk',
        ],
      },
    ],
  },
}