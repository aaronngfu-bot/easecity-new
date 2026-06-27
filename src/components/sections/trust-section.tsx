"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bug,
  Camera,
  Link2,
  MonitorCheck,
  MousePointer2,
  ScreenShare,
} from "lucide-react";
import PixelTransition from "@/components/ui/PixelTransition";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/LanguageContext";

const SIGNAL_COLOR = "#00e5cc";

const SIGNAL_PIXEL_COLORS_DARK = [
  { color: "#0c2926", weight: 45 },
  { color: "#103833", weight: 30 },
  { color: "#14524a", weight: 18 },
  { color: "#00a896", weight: 5 },
  { color: "#00e5cc", weight: 2 },
];
const SIGNAL_PIXEL_COLORS_LIGHT = [
  { color: "#cdeae6", weight: 45 },
  { color: "#a9ddd6", weight: 30 },
  { color: "#7fcfc4", weight: 18 },
  { color: "#27b9a8", weight: 5 },
  { color: "#00b29f", weight: 2 },
];

function useIsDark() {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

interface Point {
  title: string;
  description: string;
  icon: ReactNode;
}

function useCoarsePointer() {
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const update = () =>
      setIsCoarsePointer(mediaQuery.matches || navigator.maxTouchPoints > 0 || window.innerWidth < 768);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isCoarsePointer;
}

function PanelContent({
  label,
  badge,
  title,
  points,
  variant,
  ctaLabel,
}: {
  label: string;
  badge: string;
  title: string;
  points: Point[];
  variant: "before" | "after";
  /** After 狀態先顯示嘅細 CTA link */
  ctaLabel?: string;
}) {
  const isAfter = variant === "after";

  return (
    <div className="flex h-full flex-col justify-center bg-card p-6 text-card-foreground sm:p-8 md:p-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span
          className={`font-display text-lg font-bold tracking-[0.04em] transition-colors duration-500 sm:text-xl md:text-2xl ${
            isAfter ? "text-signal" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <span
          className={`rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] transition-colors duration-500 ${
            isAfter
              ? "border-signal/30 bg-signal/10 text-signal"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {badge}
        </span>
      </div>

      <h3
        className={`mb-6 font-display text-3xl font-bold tracking-[-0.035em] transition-colors duration-500 sm:text-4xl md:text-6xl ${
          isAfter ? "text-card-foreground" : "text-card-foreground/70 dark:text-card-foreground/65"
        }`}
      >
        {title}
      </h3>

      <div className="grid gap-4 md:gap-5">
        {points.map((point) => (
          <div
            key={point.title}
            className={`flex gap-4 rounded-xl border p-4 transition-colors duration-500 md:p-5 ${
              isAfter ? "border-signal/20 bg-signal/10" : "border-border bg-muted/40"
            }`}
          >
            <div
              className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-500 ${
                isAfter
                  ? "bg-signal/10 text-signal"
                  : "bg-black/[0.06] text-black/45 dark:bg-white/[0.06] dark:text-white/45"
              }`}
            >
              {point.icon}
            </div>
            <div>
              <p
                className={`text-base font-semibold transition-colors duration-500 md:text-xl ${
                  isAfter ? "" : "text-card-foreground/75 dark:text-card-foreground/70"
                }`}
              >
                {point.title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground dark:text-white/60 md:text-base">
                {point.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isAfter && ctaLabel && (
        <Link
          href="/ec-share"
          className="group/cta pointer-events-auto mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-signal transition-colors hover:text-signal-light"
        >
          {ctaLabel}
          <span aria-hidden className="transition-transform group-hover/cta:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </div>
  );
}

export function TrustSection() {
  const isCoarsePointer = useCoarsePointer();
  const reduce = !!useReducedMotion();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const trust = t.homePage.trust;
  /* 入場 fade 完成前卡片忽略 hover，避免入場同 pixel 動畫疊埋一齊出現 */
  const [cardReady, setCardReady] = useState(false);
  /* pixel 過場 active 狀態 → 外框「由暗轉亮」transition */
  const [activePanel, setActivePanel] = useState(false);
  const pixelColors = isDark ? SIGNAL_PIXEL_COLORS_DARK : SIGNAL_PIXEL_COLORS_LIGHT;

  const beforePoints: Point[] = [
    {
      title: trust.b1Title,
      description: trust.b1Desc,
      icon: <MousePointer2 className="h-6 w-6" aria-hidden="true" />,
    },
    {
      title: trust.b2Title,
      description: trust.b2Desc,
      icon: <Bug className="h-6 w-6" aria-hidden="true" />,
    },
    {
      title: trust.b3Title,
      description: trust.b3Desc,
      icon: <Camera className="h-6 w-6" aria-hidden="true" />,
    },
  ];

  const afterPoints: Point[] = [
    {
      title: trust.a1Title,
      description: trust.a1Desc,
      icon: <MonitorCheck className="h-6 w-6" aria-hidden="true" />,
    },
    {
      title: trust.a2Title,
      description: trust.a2Desc,
      icon: <ScreenShare className="h-6 w-6" aria-hidden="true" />,
    },
    {
      title: trust.a3Title,
      description: trust.a3Desc,
      icon: <Link2 className="h-6 w-6" aria-hidden="true" />,
    },
  ];

  return (
    <section className="relative overflow-x-clip px-4 py-24 md:px-6 md:py-32">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {/* 順序 stagger：badge(0s) → 標題(0.12s) → 副標(0.24s) → hint(0.36s) → 卡片(0.48s) */}
          <SectionHeading
            badge="TEAM SIGNAL"
            title={trust.heading}
            subtitle={trust.sub}
            stepDelay={0.12}
          />
          <motion.p
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.36 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-signal"
          >
            <MousePointer2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden md:inline">{trust.hintDesktop}</span>
            <span className="md:hidden">{trust.hintMobile}</span>
          </motion.p>
        </div>

        {/* trust-card wrapper：卡本身 overflow-hidden 會裁走 inset:-1px 嘅描邊，所以流光掛喺呢層 */}
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: reduce ? 0 : 0.48, ease: "easeOut" }}
          onAnimationComplete={() => setCardReady(true)}
          className={`trust-card rounded-2xl ${cardReady ? "" : "pointer-events-none"}`}
        >
          <PixelTransition
            firstContent={
              <PanelContent
                label={trust.beforeLabel}
                badge="BEFORE"
                title={trust.beforeTitle}
                points={beforePoints}
                variant="before"
              />
            }
            secondContent={
              <PanelContent
                label={trust.afterLabel}
                badge="EC-SHARE"
                title={trust.afterTitle}
                points={afterPoints}
                variant="after"
                ctaLabel={trust.ctaLink}
              />
            }
            gridSize={24}
            pixelColors={pixelColors}
            animationStepDuration={0.4}
            aspectRatio="0"
            once={isCoarsePointer}
            onActiveChange={setActivePanel}
            className={`min-h-[680px] rounded-2xl border transition-[border-color,box-shadow] duration-500 md:min-h-[600px] ${
              activePanel
                ? "border-signal-deep/40 shadow-[0_0_44px_rgba(0,143,130,0.16)] dark:border-signal/45 dark:shadow-[0_0_44px_rgba(0,229,204,0.16),0_30px_100px_rgba(0,0,0,0.42)]"
                : "border-black/10 shadow-card dark:border-white/[0.12] dark:shadow-[0_30px_100px_rgba(0,0,0,0.42)]"
            }`}
          />
        </motion.div>
      </div>
    </section>
  );
}
