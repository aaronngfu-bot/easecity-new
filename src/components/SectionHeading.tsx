"use client";

import React from "react";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left" | "right";
  line?: boolean;
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
 *  Scrub so the title emerges in proportion to scroll. */
export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  line = true,
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
        <span className="scrub-kicker flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-signal">
          {line && <span aria-hidden className="scrub-rule h-px w-10 origin-left bg-signal" />}
          <span className="scrub-kicker-label">{badge}</span>
        </span>
      )}

      <h2
        className={`type-section scrub-title flex flex-wrap font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl ${
          align === "center"
            ? "justify-center"
            : align === "right"
              ? "justify-end"
              : "justify-start"
        }`}
      >
        {tokens.map((token, i) => (
          <span
            key={i}
            className="scrub-word inline-block whitespace-pre"
            style={{ ['--i' as string]: i }}
          >
            {token.text + (token.trailingSpace ? " " : "")}
          </span>
        ))}
      </h2>

      {subtitle && (
        <p className="scrub-sub max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
