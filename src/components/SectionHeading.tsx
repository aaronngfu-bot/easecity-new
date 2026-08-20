"use client";

import React from "react";

interface SectionHeadingProps {
  badge?: string;        // 上方小標籤,例如「FEATURES」
  title: string;         // 主標題,例如「核心功能」
  subtitle?: string;     // 副標題說明
  align?: "center" | "left" | "right";
  /** 保留 prop 以相容舊呼叫點；進場動畫由外層 RevealSection/RevealItem 的 scroll scrub 負責 */
  stepDelay?: number;
}

interface Token {
  text: string;
  trailingSpace: boolean;
}

const CJK = new RegExp("[\\u3000-\\u9fff\\uf900-\\ufaff\\uff00-\\uffef]");

/** CJK-aware tokenization. Each continuous run of CJK characters is ONE token
 *  (no per-character splitting — splits were inflating letter-spacing on
 *  Chinese titles and made them read as garbled/English-spaced). Latin words
 *  are grouped per word so a single word never word-breaks mid-token. */
function tokenize(title: string): Token[] {
  const tokens: Token[] = [];
  const parts = title.split(/\s+/).filter(Boolean);
  parts.forEach((word, wi) => {
    const isLastWord = wi === parts.length - 1;
    let buffer = "";
    const flush = (last: boolean) => {
      if (!buffer) return;
      tokens.push({ text: buffer, trailingSpace: last && !isLastWord });
      buffer = "";
    };
    // Walk chars within the word; join same-class chars (CJK vs non-CJK).
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const cjk = CJK.test(ch);
      const bufCJK = buffer ? CJK.test(buffer[0]) : null;
      if (bufCJK !== null && bufCJK !== cjk) {
        flush(false);
      }
      buffer += ch;
    }
    flush(true);
  });
  return tokens;
}

/** Static heading. Entrance motion is owned by the surrounding
 *  RevealSection/RevealItem scroll-scrub so every element on the page
 *  emerges in proportion to scroll, from one system. */
export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
}: SectionHeadingProps) {
  const tokens = tokenize(title);

  const alignClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignClass} gap-4`}>
      {badge && (
        <span className="font-mono text-xs uppercase tracking-[0.28em] text-signal">
          {badge}
        </span>
      )}

      <h2
        className={`flex flex-wrap font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl md:text-5xl ${
          align === "center"
            ? "justify-center"
            : align === "right"
              ? "justify-end"
              : "justify-start"
        }`}
      >
        {tokens.map((token, i) => (
          <span key={i} className="inline-block whitespace-pre">
            {token.text + (token.trailingSpace ? " " : "")}
          </span>
        ))}
      </h2>

      {subtitle && (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
