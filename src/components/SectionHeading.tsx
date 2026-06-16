"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMotionEnabled } from "@/lib/motion-context";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  stepDelay?: number;
}

interface Token {
  text: string;
  trailingSpace: boolean;
}

const CJK_RUN = /[\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]|[^\u3000-\u9fff\uf900-\ufaff\uff00-\uffef]+/g;

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
  const { motionEnabled } = useMotionEnabled();
  const reduce = !motionEnabled;
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
