"use client";

import { useEffect, useRef } from "react";

export interface PerspectiveMarqueeProps {
  items?: string[];
  fontSize?: number;
  fontWeight?: number;
  pixelsPerFrame?: number;
  rotateY?: number;
  rotateX?: number;
  perspective?: number;
  speed?: number;
  /** 文字顏色由 className 控制（currentColor），方便做 theme-aware */
  className?: string;
}

const FONT_FAMILY =
  "var(--font-display), var(--font-body), -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei', sans-serif";

const DEFAULT_ITEMS = ["智能", "串流", "控制", "部署", "擴展", "工程", "基建", "整合"];

/**
 * 3D 透視跑馬燈背景。動畫直接寫 DOM style（ref-based），
 * 唔會每幀觸發 React re-render；中心點按容器實際寬度計算。
 */
export function PerspectiveMarquee({
  items = DEFAULT_ITEMS,
  fontSize = 96,
  fontWeight = 700,
  pixelsPerFrame = 1.2,
  rotateY = -28,
  rotateX = 8,
  perspective = 1200,
  speed = 1,
  className,
}: PerspectiveMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const itemPadding = fontSize * 0.9;

  const rendered = [...items, ...items, ...items];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let frame = 0;
    let center = (containerRef.current?.offsetWidth ?? 1280) / 2;
    let setWidth = 0;
    let itemCenters: number[] = [];

    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setWidth = track.scrollWidth / 3;
      itemCenters = itemRefs.current.map((el) =>
        el ? el.offsetLeft + el.offsetWidth / 2 : 0,
      );
    };

    measure();
    document.fonts?.ready.then(measure);

    const onResize = () => {
      center = (containerRef.current?.offsetWidth ?? 1280) / 2;
    };
    window.addEventListener("resize", onResize, { passive: true });

    const tick = () => {
      if (setWidth > 0) {
        frame += speed;
        const offset = -((frame * pixelsPerFrame) % setWidth);
        const track = trackRef.current;
        if (track) track.style.transform = `translateX(${offset}px)`;
        itemRefs.current.forEach((el, i) => {
          if (!el) return;
          const itemCenter = itemCenters[i] + offset;
          const norm = (itemCenter - center) / Math.max(center, 1);
          const distance = Math.min(1, Math.abs(norm));
          el.style.filter = `blur(${(distance * 6).toFixed(2)}px)`;
          el.style.opacity = (1 - distance * 0.4).toFixed(3);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [items, pixelsPerFrame, speed, fontSize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        perspective: `${perspective}px`,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={trackRef}
          style={{
            display: "flex",
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
        >
          {rendered.map((item, i) => (
            <span
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              style={{
                display: "inline-block",
                fontFamily: FONT_FAMILY,
                fontSize,
                fontWeight,
                color: "currentColor",
                letterSpacing: "0.05em",
                paddingRight: itemPadding,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* edge fades — theme-aware */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#f7fafa_0%,transparent_18%,transparent_82%,#f7fafa_100%)] dark:bg-[linear-gradient(90deg,#050505_0%,transparent_18%,transparent_82%,#050505_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f7fafa_0%,transparent_25%,transparent_75%,#f7fafa_100%)] dark:bg-[linear-gradient(180deg,#050505_0%,transparent_25%,transparent_75%,#050505_100%)]" />
    </div>
  );
}
