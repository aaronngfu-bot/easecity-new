"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface SectionHeadingProps {
  badge?: string;        // 上方小標籤,例如「FEATURES」
  title: string;         // 主標題,例如「核心功能」
  subtitle?: string;     // 副標題說明
  align?: "center" | "left";
  /** 順序 stagger 模式：badge → title → subtitle 每段相隔呢個秒數；不設則維持原有節奏 */
  stepDelay?: number;
}

interface Token {
  text: string;
  trailingSpace: boolean;
}

const CJK_RUN = /[\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]|[^\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]+/g;

/**
 * CJK-aware tokenization：中文逐字成 token（可自由換行），
 * 拉丁文整個單詞一個 token（避免單詞中間斷行）。
 */
function tokenize(title: string): Token[] {
  const tokens: Token[] = [];
  const words = title.split(" ");
  words.forEach((word, wi) => {
    if (!word) return;
    const runs = word.match(CJK_RUN) ?? [word];
    runs.forEach((run, ri) => {
      tokens.push({
        text: run,
        trailingSpace: ri === runs.length - 1 && wi < words.length - 1,
      });
    });
  });
  return tokens;
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  stepDelay,
}: SectionHeadingProps) {
  const reduce = !!useReducedMotion();
  const tokens = tokenize(title);

  const titleBase = stepDelay ?? 0;
  const subtitleDelay =
    stepDelay !== undefined
      ? stepDelay * 2
      : Math.min(tokens.length * 0.05, 0.7) + 0.1;

  const alignClass =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass} gap-4`}>
      {/* mono eyebrow — 與 TrustSection / CTA 區一致的標籤語言 */}
      {badge && (
        <motion.span
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="font-mono text-xs uppercase tracking-[0.28em] text-signal"
        >
          {badge}
        </motion.span>
      )}

      {/* 主標題:逐字淡入 + 上移 */}
      <h2
        className={`flex flex-wrap font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl md:text-5xl ${
          align === "center" ? "justify-center" : "justify-start"
        }`}
      >
        {tokens.map((token, i) => (
          <motion.span
            key={i}
            initial={{
              opacity: 0,
              y: reduce ? 0 : 24,
              filter: reduce ? "blur(0px)" : "blur(8px)",
            }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: reduce ? 0 : titleBase + Math.min(i * 0.05, 0.7),
              ease: "easeOut",
            }}
            className="inline-block whitespace-pre"
          >
            {token.text + (token.trailingSpace ? " " : "")}
          </motion.span>
        ))}
      </h2>

      {/* 副標題 */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: reduce ? 0 : subtitleDelay }}
          className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
