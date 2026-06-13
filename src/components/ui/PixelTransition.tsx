"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import "./PixelTransition.css";

interface PixelColor {
  color: string;
  weight?: number;
}

interface PixelTransitionProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  gridSize?: number;
  pixelColor?: string;
  pixelColors?: PixelColor[];
  animationStepDuration?: number;
  pixelFadeDuration?: number;
  once?: boolean;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
  /** 通知父層 active 狀態切換（俾外框做「由暗轉亮」transition） */
  onActiveChange?: (active: boolean) => void;
}

function pickWeightedColor(palette: PixelColor[]): string {
  const total = palette.reduce((sum, item) => sum + (item.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const item of palette) {
    r -= item.weight ?? 1;
    if (r <= 0) return item.color;
  }
  return palette[palette.length - 1].color;
}

export default function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = "currentColor",
  pixelColors,
  animationStepDuration = 0.3,
  pixelFadeDuration = 0.12,
  once = false,
  aspectRatio = "100%",
  className = "",
  style = {},
  onActiveChange,
}: PixelTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const delayedCallRef = useRef<gsap.core.Tween | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches,
    );
  }, []);

  useEffect(() => {
    const pixelGridEl = pixelGridRef.current;
    if (!pixelGridEl) return;

    pixelGridEl.innerHTML = "";

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pixel = document.createElement("div");
        pixel.classList.add("pixelated-image-card__pixel");
        pixel.style.backgroundColor =
          pixelColors && pixelColors.length > 0
            ? pickWeightedColor(pixelColors)
            : pixelColor;

        const size = 100 / gridSize;
        /* +1px 令相鄰格仔互相重疊，杜絕百分比 subpixel 四捨五入產生嘅
         * 髮絲縫；最右/最底多出嘅 1px 由卡片 overflow:hidden 裁走。 */
        pixel.style.width = `calc(${size}% + 1px)`;
        pixel.style.height = `calc(${size}% + 1px)`;
        pixel.style.left = `${col * size}%`;
        pixel.style.top = `${row * size}%`;
        pixelGridEl.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor, pixelColors]);

  useEffect(() => {
    return () => {
      if (delayedCallRef.current) {
        delayedCallRef.current.kill();
      }
    };
  }, []);

  const animatePixels = (activate: boolean) => {
    setIsActive(activate);
    onActiveChange?.(activate);

    const pixelGridEl = pixelGridRef.current;
    const activeEl = activeRef.current;
    if (!pixelGridEl || !activeEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      if (delayedCallRef.current) delayedCallRef.current.kill();
      gsap.killTweensOf(activeEl);
      if (activate) {
        activeEl.style.display = "block";
        activeEl.style.pointerEvents = "none";
        gsap.fromTo(activeEl, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      } else {
        gsap.to(activeEl, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            activeEl.style.display = "none";
            activeEl.style.opacity = "";
            activeEl.style.pointerEvents = "";
          },
        });
      }
      return;
    }

    const pixels = pixelGridEl.querySelectorAll<HTMLDivElement>(
      ".pixelated-image-card__pixel",
    );
    if (!pixels.length) return;

    gsap.killTweensOf(pixels);
    if (delayedCallRef.current) {
      delayedCallRef.current.kill();
    }

    gsap.set(pixels, { opacity: 0 });

    const totalPixels = pixels.length;
    const staggerDuration = animationStepDuration / totalPixels;
    const coveredAt = animationStepDuration + pixelFadeDuration;

    gsap.to(pixels, {
      opacity: 1,
      duration: pixelFadeDuration,
      ease: "power1.out",
      stagger: {
        each: staggerDuration,
        from: "random",
      },
    });

    delayedCallRef.current = gsap.delayedCall(coveredAt, () => {
      activeEl.style.display = activate ? "block" : "none";
      activeEl.style.pointerEvents = activate ? "none" : "";
    });

    gsap.to(pixels, {
      opacity: 0,
      duration: pixelFadeDuration,
      ease: "power1.in",
      delay: coveredAt,
      stagger: {
        each: staggerDuration,
        from: "random",
      },
    });
  };

  const handleEnter = () => {
    if (!isActive) animatePixels(true);
  };

  const handleLeave = () => {
    if (isActive && !once) animatePixels(false);
  };

  const handleClick = () => {
    if (!isActive) animatePixels(true);
    else if (isActive && !once) animatePixels(false);
  };

  return (
    <div
      ref={containerRef}
      className={`pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={isTouchDevice ? handleClick : undefined}
      onFocus={handleEnter}
      onBlur={handleLeave}
      tabIndex={0}
    >
      <div style={{ paddingTop: aspectRatio }} />
      <div className="pixelated-image-card__default" aria-hidden={isActive}>
        {firstContent}
      </div>
      <div className="pixelated-image-card__active" ref={activeRef} aria-hidden={!isActive}>
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelGridRef} />
    </div>
  );
}
