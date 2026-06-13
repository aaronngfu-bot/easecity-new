"use client";

import React from "react";
import { motion } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import {
  Check,
  Link2,
  MonitorSmartphone,
  MousePointer2,
  Users,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import { useLanguage } from "@/context/LanguageContext";

/* ── Mini-visual 1：多裝置即時鏡像（三部手機 + 同步掃描線） ── */
function MirrorVisual() {
  return (
    <div className="ambient-motion relative flex h-full w-full items-center justify-center gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-lg border border-signal/25 bg-gradient-to-b from-signal/15 to-accent-purple/10 dark:from-signal/10 dark:to-accent-purple/10 ${
            i === 1 ? "h-32 w-[4.5rem]" : "mt-4 h-28 w-16"
          }`}
        >
          {/* notch */}
          <span className="absolute left-1/2 top-1.5 h-0.5 w-5 -translate-x-1/2 rounded-full bg-foreground/20" />
          {/* mirrored content blocks */}
          <span className="absolute left-2 right-2 top-5 h-1.5 rounded-sm bg-foreground/15" />
          <span className="absolute left-2 right-5 top-9 h-1.5 rounded-sm bg-foreground/10" />
          <span className="absolute left-2 right-3 top-[3.25rem] h-6 rounded-sm bg-signal/20" />
          {/* sweeping sync scanline — staggered per device */}
          <span
            className="absolute left-0 right-0 h-[18%]"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(0,229,204,0.35), transparent)",
              animation: "visualScan 3.2s ease-in-out infinite",
              animationDelay: `${i * 0.35}s`,
            }}
          />
          {/* live dot */}
          <span className="breathe absolute bottom-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-signal" />
        </div>
      ))}
    </div>
  );
}

/* ── Mini-visual 2：一鍵邀請（游標滑向連結 pill 並點擊 → ✓） ── */
function InviteVisual() {
  return (
    <div className="ambient-motion relative flex h-full w-full items-center justify-center">
      <div className="relative">
        <div className="flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-4 py-2.5 font-mono text-xs tracking-wide text-signal shadow-glow-signal-sm">
          <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          ec-share.link/x7K2
        </div>
        {/* copied check — pops right after the cursor tap */}
        <span
          className="absolute -right-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-signal text-[#03100f] opacity-0"
          style={{ animation: "popCheck 4.5s ease-in-out infinite" }}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
        </span>
        {/* tap ripple */}
        <span
          className="absolute -right-1 -top-1 h-7 w-7 rounded-full border border-signal/60 opacity-0"
          style={{ animation: "pingSoft 4.5s ease-out infinite", animationDelay: "2.8s" }}
        />
        {/* gliding cursor */}
        <span
          className="absolute -bottom-5 -right-7 text-foreground/70"
          style={{ animation: "cursorGlide 4.5s ease-in-out infinite" }}
        >
          <MousePointer2 className="h-4 w-4 fill-current" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

/* ── Mini-visual 3：多人同步觀看（共享畫面 + 圍觀 avatars + 漣漪） ── */
function ViewersVisual() {
  const avatars = [
    { label: "QA", pos: "left-6 top-6", delay: "0s" },
    { label: "PM", pos: "right-7 top-10", delay: "0.8s" },
    { label: "CS", pos: "bottom-5 left-12", delay: "1.6s" },
  ];

  return (
    <div className="ambient-motion relative flex h-full w-full items-center justify-center">
      {/* shared screen */}
      <div className="relative h-24 w-36 overflow-hidden rounded-lg border border-signal/25 bg-gradient-to-br from-signal/15 to-accent-purple/10">
        <span className="absolute left-2 right-8 top-2.5 h-1.5 rounded-sm bg-foreground/15" />
        <span className="absolute left-2 right-12 top-6 h-1.5 rounded-sm bg-foreground/10" />
        <span className="absolute bottom-2.5 left-2 h-7 w-12 rounded-sm bg-signal/20" />
        <span className="breathe absolute bottom-2.5 right-2 h-1.5 w-1.5 rounded-full bg-signal" />
      </div>
      {/* sync ripples emanating from the shared screen */}
      {[0, 1].map((i) => (
        <span
          key={i}
          className="absolute h-28 w-40 rounded-xl border border-signal/30"
          style={{
            animation: "pingSoft 3.6s ease-out infinite",
            animationDelay: `${i * 1.8}s`,
          }}
        />
      ))}
      {/* viewers */}
      {avatars.map((a) => (
        <span
          key={a.label}
          className={`absolute ${a.pos} flex h-8 w-8 items-center justify-center rounded-full border border-signal/30 bg-card font-mono text-[9px] font-semibold tracking-wide text-signal shadow-card`}
          style={{ animation: "driftFloat 4s ease-in-out infinite", animationDelay: a.delay }}
        >
          {a.label}
        </span>
      ))}
      <span className="absolute bottom-4 right-5 flex h-6 items-center rounded-full border border-border bg-card px-2 font-mono text-[9px] text-muted-foreground">
        +2
      </span>
    </div>
  );
}

export function CoreFeatures() {
  const { t } = useLanguage();
  const features = t.homePage.features;

  const cards = [
    {
      icon: MonitorSmartphone,
      title: features.f1Title,
      desc: features.f1Desc,
      visual: <MirrorVisual />,
    },
    {
      icon: Link2,
      title: features.f2Title,
      desc: features.f2Desc,
      visual: <InviteVisual />,
    },
    {
      icon: Users,
      title: features.f3Title,
      desc: features.f3Desc,
      visual: <ViewersVisual />,
    },
  ];

  return (
    <section className="w-full px-4 py-24 sm:px-6 md:py-32 lg:px-8">
      <div className="mb-8">
        <SectionHeading
          badge="FEATURES"
          title={features.title}
          subtitle={features.subtitle}
        />
      </div>

      <div className="mx-auto grid max-w-[88rem] grid-cols-1 gap-8 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: index * 0.1, ease: "easeOut" }}
            >
              <CardContainer className="inter-var w-full" containerClassName="py-6">
                <CardBody className="bg-card text-card-foreground relative group/card border-border w-full h-auto rounded-2xl p-8 border transition-shadow duration-300 shadow-[0_0_0_1px_rgba(0,229,204,0.12),0_0_18px_rgba(0,229,204,0.07)] hover:shadow-[0_0_0_1px_rgba(0,229,204,0.32),0_0_32px_rgba(0,229,204,0.16)]">
                  <CardItem translateZ="100" className="w-full mb-5">
                    <div className="relative h-64 w-full overflow-hidden rounded-xl border border-signal/15 bg-gradient-to-br from-signal/[0.06] via-transparent to-accent-purple/[0.06]">
                      <div className="absolute inset-0 bg-dot-grid opacity-50" aria-hidden="true" />
                      {card.visual}
                    </div>
                  </CardItem>

                  <CardItem
                    translateZ="50"
                    className="flex items-center gap-3 text-2xl font-bold text-card-foreground"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
                      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    {card.title}
                  </CardItem>

                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-muted-foreground text-base mt-3 leading-relaxed"
                  >
                    {card.desc}
                  </CardItem>
                </CardBody>
              </CardContainer>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default CoreFeatures;
