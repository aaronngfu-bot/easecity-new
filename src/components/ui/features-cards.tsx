"use client";

import type React from "react";
import { Warp } from "@paper-design/shaders-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeaturesCardsProps {
  heading?: string;
  subheading?: string;
  features?: Feature[];
}

const iconClassName = "w-12 h-12 text-white";

const defaultFeatures: Feature[] = [
  {
    title: "多裝置同步",
    description:
      "在單一 Windows 桌面同時鏡像多部 Android 裝置，QA 可以一次比較不同狀態，不再逐台切換。",
    icon: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5.75A2.75 2.75 0 0 1 5.75 3h7.5A2.75 2.75 0 0 1 16 5.75v6.5A2.75 2.75 0 0 1 13.25 15h-7.5A2.75 2.75 0 0 1 3 12.25v-6.5Zm2.75-.25a.25.25 0 0 0-.25.25v6.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-7.5ZM18 8.75A2.75 2.75 0 0 1 20.75 6h.5A1.75 1.75 0 0 1 23 7.75v8.5A2.75 2.75 0 0 1 20.25 19h-8.5A1.75 1.75 0 0 1 10 17.25V17h10.25a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25H18v.75Z" />
      </svg>
    ),
  },
  {
    title: "即時鏡像",
    description:
      "低延遲畫面串流讓手機狀態即時反映，客服與測試人員能同步看到問題現場。",
    icon: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-7.07 17.07A10 10 0 0 0 22 12h-2.5a7.5 7.5 0 1 1-2.2-5.3L15 9h7V2l-2.93 2.93A9.97 9.97 0 0 0 12 2Zm1.25 5h-2.5v6.05l4.45 2.67 1.3-2.13-3.25-1.94V7Z" />
      </svg>
    ),
  },
  {
    title: "聚焦控制",
    description:
      "Grid 模式快速監看多台裝置，Focus 模式放大單一手機，方便重現 bug 與錄製證據。",
    icon: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h6v6H4V3Zm10 0h6v6h-6V3ZM4 15h6v6H4v-6Zm10 0h6v6h-6v-6Zm-2-4a1 1 0 0 1 1-1h1V9a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" />
      </svg>
    ),
  },
  {
    title: "截圖錄影",
    description:
      "內建截圖與螢幕錄影流程，把測試證據直接沉澱成可交付資料，減少手動整理。",
    icon: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v2.5l2.7-1.8A1.5 1.5 0 0 1 22 7.45v9.1a1.5 1.5 0 0 1-2.3 1.25L17 16v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5Zm4 2.5A1.5 1.5 0 1 0 8 10.5a1.5 1.5 0 0 0 0-3Zm2 8.5 2.15-2.7a1 1 0 0 1 1.55 0L15.6 16H10Z" />
      </svg>
    ),
  },
  {
    title: "團隊分享",
    description:
      "Business 工作流支援分享觀看者與操作權限，讓 QA、客服與客戶在同一畫面協作。",
    icon: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8.5 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 20a6 6 0 0 1 12 0v1H2v-1Zm12.5 1h7.5v-1a5.5 5.5 0 0 0-6.8-5.34A7.93 7.93 0 0 1 14.5 21Z" />
      </svg>
    ),
  },
  {
    title: "License 管理",
    description:
      "以帳戶、訂閱與 license JWT 管理功能權限，支援試用、離線寬限與企業級擴展。",
    icon: (
      <svg className={iconClassName} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2 4 5.4v6.1c0 5.05 3.4 9.75 8 10.5 4.6-.75 8-5.45 8-10.5V5.4L12 2Zm3.5 9.2-4.15 4.15a1.2 1.2 0 0 1-1.7 0L8 13.7 9.7 12l.8.8 3.3-3.3 1.7 1.7Z" />
      </svg>
    ),
  },
];

const SHADER_CONFIGS = [
  {
    proportion: 0.3,
    softness: 0.8,
    distortion: 0.15,
    swirl: 0.6,
    swirlIterations: 8,
    shape: "checks" as const,
    shapeScale: 0.08,
    colors: ["hsl(280, 100%, 30%)", "hsl(320, 100%, 60%)", "hsl(340, 90%, 40%)", "hsl(300, 100%, 70%)"],
  },
  {
    proportion: 0.4,
    softness: 1.2,
    distortion: 0.2,
    swirl: 0.9,
    swirlIterations: 12,
    shape: "stripes" as const,
    shapeScale: 0.12,
    colors: ["hsl(200, 100%, 25%)", "hsl(180, 100%, 65%)", "hsl(160, 90%, 35%)", "hsl(190, 100%, 75%)"],
  },
  {
    proportion: 0.35,
    softness: 0.9,
    distortion: 0.18,
    swirl: 0.7,
    swirlIterations: 10,
    shape: "checks" as const,
    shapeScale: 0.1,
    colors: ["hsl(120, 100%, 25%)", "hsl(140, 100%, 60%)", "hsl(100, 90%, 30%)", "hsl(130, 100%, 70%)"],
  },
  {
    proportion: 0.45,
    softness: 1.1,
    distortion: 0.22,
    swirl: 0.8,
    swirlIterations: 15,
    shape: "stripes" as const,
    shapeScale: 0.09,
    colors: ["hsl(30, 100%, 35%)", "hsl(50, 100%, 65%)", "hsl(40, 90%, 40%)", "hsl(45, 100%, 75%)"],
  },
  {
    proportion: 0.38,
    softness: 0.95,
    distortion: 0.16,
    swirl: 0.85,
    swirlIterations: 11,
    shape: "checks" as const,
    shapeScale: 0.11,
    colors: ["hsl(250, 100%, 30%)", "hsl(270, 100%, 65%)", "hsl(260, 90%, 35%)", "hsl(265, 100%, 70%)"],
  },
  {
    proportion: 0.42,
    softness: 1.0,
    distortion: 0.19,
    swirl: 0.75,
    swirlIterations: 9,
    shape: "stripes" as const,
    shapeScale: 0.13,
    colors: ["hsl(330, 100%, 30%)", "hsl(350, 100%, 60%)", "hsl(340, 90%, 35%)", "hsl(345, 100%, 75%)"],
  },
];

export default function FeaturesCards({
  heading = "為何選擇 EC-Share",
  subheading = "從多裝置鏡像、焦點控制到授權管理，將 Android 裝置工作流收斂到一個可靠桌面控制台。",
  features = defaultFeatures,
}: FeaturesCardsProps) {
  const getShaderConfig = (index: number) => SHADER_CONFIGS[index % SHADER_CONFIGS.length];

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-6">
            {heading}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const shaderConfig = getShaderConfig(index);
            return (
              <div key={index} className="relative h-80">
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <Warp
                    style={{ height: "100%", width: "100%" }}
                    proportion={shaderConfig.proportion}
                    softness={shaderConfig.softness}
                    distortion={shaderConfig.distortion}
                    swirl={shaderConfig.swirl}
                    swirlIterations={shaderConfig.swirlIterations}
                    shape={shaderConfig.shape}
                    shapeScale={shaderConfig.shapeScale}
                    scale={1}
                    rotation={0}
                    speed={0.8}
                    colors={shaderConfig.colors}
                  />
                </div>

                <div className="relative z-10 p-8 rounded-3xl h-full flex flex-col bg-black/80 border border-white/20 dark:border-white/10">
                  <div className="mb-6 filter drop-shadow-lg">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                  <p className="leading-relaxed flex-grow text-gray-100 font-medium">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-gray-200">
                    <span className="mr-2">了解更多</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
