"use client";

import React, { useEffect, useRef, ReactNode } from "react";

interface BentoItemProps {
  className?: string;
  children: ReactNode;
}

const BentoItem: React.FC<BentoItemProps> = ({ className = "", children }) => {
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      item.style.setProperty("--mouse-x", `${x}px`);
      item.style.setProperty("--mouse-y", `${y}px`);
    };

    item.addEventListener("mousemove", handleMouseMove);
    return () => item.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={itemRef} className={`bento-item ${className}`}>
      {children}
    </div>
  );
};

interface BentoFeature {
  title: string;
  description: string;
  className?: string;
  visual?: ReactNode;
}

interface CyberneticBentoGridProps {
  heading?: string;
  features?: BentoFeature[];
}

const iconClassName = "w-12 h-12 text-white";

const MultiDeviceVisual = () => (
  <div className="relative h-48 overflow-hidden rounded-lg border border-white/5 bg-gradient-to-br from-sky-900/40 to-purple-900/40">
    <div className="absolute left-1/2 top-1/2 grid h-16 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-sky-300/25 bg-black/55 shadow-[0_0_40px_rgba(56,189,248,0.18)]">
      <svg className="h-8 w-8 text-sky-300/70" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5.75A2.75 2.75 0 0 1 5.75 3h7.5A2.75 2.75 0 0 1 16 5.75v6.5A2.75 2.75 0 0 1 13.25 15h-7.5A2.75 2.75 0 0 1 3 12.25v-6.5Zm2.75-.25a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-7.5Z" />
      </svg>
    </div>
    {[
      ["left-[12%] top-[18%]", "A"],
      ["right-[12%] top-[18%]", "B"],
      ["left-[18%] bottom-[16%]", "C"],
      ["right-[18%] bottom-[16%]", "D"],
    ].map(([position, label]) => (
      <div
        key={label}
        className={`absolute ${position} grid h-12 w-8 place-items-center rounded-md border border-white/10 bg-black/50 text-[10px] font-semibold text-sky-200`}
      >
        {label}
      </div>
    ))}
    <div className="absolute inset-x-[24%] top-1/2 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
    <div className="absolute inset-y-[24%] left-1/2 w-px bg-gradient-to-b from-transparent via-sky-300/60 to-transparent" />
  </div>
);

const MiniWave = () => (
  <div className="mt-2 flex h-12 items-end gap-1 opacity-60">
    {[18, 28, 20, 34, 26, 40, 24, 30].map((height, index) => (
      <span
        key={index}
        className="w-2 rounded-full bg-cyan-300/60"
        style={{ height }}
      />
    ))}
  </div>
);

const MiniDots = () => (
  <div className="mt-2 grid h-12 grid-cols-8 gap-1 opacity-60">
    {Array.from({ length: 24 }).map((_, index) => (
      <span key={index} className="h-1.5 w-1.5 rounded-full bg-emerald-300/60" />
    ))}
  </div>
);

const defaultFeatures: BentoFeature[] = [
  {
    title: "多裝置同步",
    description:
      "在單一 Windows 桌面同時鏡像多部 Android 裝置，QA 可以一次比較不同狀態，不再逐台切換。",
    className: "col-span-2 row-span-2",
    visual: <MultiDeviceVisual />,
  },
  {
    title: "即時鏡像",
    description:
      "低延遲畫面串流讓手機狀態即時反映，客服與測試人員能同步看到問題現場。",
    visual: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-7.07 17.07A10 10 0 0 0 22 12h-2.5a7.5 7.5 0 1 1-2.2-5.3L15 9h7V2l-2.93 2.93A9.97 9.97 0 0 0 12 2Zm1.25 5h-2.5v6.05l4.45 2.67 1.3-2.13-3.25-1.94V7Z" />
      </svg>
    ),
  },
  {
    title: "聚焦控制",
    description:
      "Grid 模式快速監看多台裝置，Focus 模式放大單一手機，方便重現 bug 與錄製證據。",
    visual: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h6v6H4V3Zm10 0h6v6h-6V3ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Zm-2-4a1 1 0 0 1 1-1h1V9a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" />
      </svg>
    ),
  },
  {
    title: "截圖錄影",
    description:
      "內建截圖與螢幕錄影流程，把測試證據直接沉澱成可交付資料，減少手動整理。",
    className: "row-span-2",
    visual: <MiniWave />,
  },
  {
    title: "團隊分享",
    description:
      "Business 工作流支援分享觀看者與操作權限，讓 QA、客服與客戶在同一畫面協作。",
    className: "col-span-2",
    visual: <MiniDots />,
  },
  {
    title: "License 管理",
    description:
      "以帳戶、訂閱與 license JWT 管理功能權限，支援試用、離線寬限與企業級擴展。",
    visual: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 4 5.4v6.1c0 5.05 3.4 9.75 8 10.5 4.6-.75 8-5.45 8-10.5V5.4L12 2Zm3.5 9.2-4.15 4.15a1.2 1.2 0 0 1-1.7 0L8 13.7 9.7 12l.8.8 3.3-3.3 1.7 1.7Z" />
      </svg>
    ),
  },
];

export default function CyberneticBentoGrid({
  heading = "核心功能",
  features = defaultFeatures,
}: CyberneticBentoGridProps) {
  return (
    <>
      <style suppressHydrationWarning>{`
        .cbg-main-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 1rem;
          background-color: #0a0a0a;
          background-image:
            radial-gradient(at 20% 30%, hsla(212, 80%, 30%, 0.3) 0px, transparent 50%),
            radial-gradient(at 80% 70%, hsla(280, 80%, 30%, 0.3) 0px, transparent 50%);
          color: #fff;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: minmax(180px, auto);
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
          .bento-grid .col-span-2 { grid-column: span 2 / span 2; }
        }
        .bento-item {
          position: relative;
          padding: 1.5rem;
          border-radius: 1rem;
          background-color: rgba(23, 23, 23, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
          transition: border-color 0.3s ease;
        }
        .bento-item::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border-radius: inherit;
          background: radial-gradient(
            400px circle at var(--mouse-x) var(--mouse-y),
            rgba(56, 189, 248, 0.15),
            transparent 40%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .bento-item:hover::before { opacity: 1; }
        .bento-item:hover { border-color: rgba(56, 189, 248, 0.3); }
        .col-span-2 { grid-column: span 2 / span 2; }
        .row-span-2 { grid-row: span 2 / span 2; }
      `}</style>

      <div className="cbg-main-container">
        <div className="w-full max-w-6xl z-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
            {heading}
          </h1>
          <div className="bento-grid">
            {features.map((f, i) => (
              <BentoItem key={i} className={f.className || ""}>
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <h2 className={`${i === 0 ? "text-2xl" : "text-xl"} font-bold text-white`}>
                      {f.title}
                    </h2>
                    <p className={`mt-2 text-gray-400 ${i === 0 ? "" : "text-sm"}`}>
                      {f.description}
                    </p>
                  </div>
                  {f.visual && <div className="mt-4">{f.visual}</div>}
                </div>
              </BentoItem>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
