'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useLanguage } from '@/context/LanguageContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MotionToggle } from '@/components/MotionToggle';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref = undefined,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#eaffff',
  pillColor = '#071012',
  hoveredPillTextColor = '#03100f',
  pillTextColor = undefined,
  onMobileMenuClick = undefined,
  initialLoadAnimation = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const resolvedActiveHref = activeHref ?? pathname;
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease,
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease,
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center',
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          },
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = href =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  const getItemLabel = item => item.labelKey ? t.nav[item.labelKey] ?? item.label : item.label;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    const menu = mobileMenuRef.current;
    const hamburger = hamburgerRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.2, ease });
      gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.2, ease });
    }

    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, y: 10 });
    }
  };

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary">
        {isRouterLink(items?.[0]?.href) ? (
          <Link
            className="pill-logo"
            href={items[0].href}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            role="menuitem"
            ref={el => {
              logoRef.current = el;
            }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </Link>
        ) : (
          <a
            className="pill-logo"
            href={items?.[0]?.href || '#'}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={el => {
              logoRef.current = el;
            }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </a>
        )}

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => {
              const itemLabel = getItemLabel(item);

              return (
                <li key={item.href || `item-${i}`} role="none">
                  {isRouterLink(item.href) ? (
                    <Link
                      role="menuitem"
                      href={item.href}
                      className={`pill${resolvedActiveHref === item.href ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel || itemLabel}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      <span
                        className="hover-circle"
                        aria-hidden="true"
                        ref={el => {
                          circleRefs.current[i] = el;
                        }}
                      />
                      <span className="label-stack">
                        <span className="pill-label">{itemLabel}</span>
                        <span className="pill-label-hover" aria-hidden="true">
                          {itemLabel}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <a
                      role="menuitem"
                      href={item.href}
                      className={`pill${resolvedActiveHref === item.href ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel || itemLabel}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                    >
                      <span
                        className="hover-circle"
                        aria-hidden="true"
                        ref={el => {
                          circleRefs.current[i] = el;
                        }}
                      />
                      <span className="label-stack">
                        <span className="pill-label">{itemLabel}</span>
                        <span className="pill-label-hover" aria-hidden="true">
                          {itemLabel}
                        </span>
                      </span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="pill-language-toggle desktop-only" aria-label="Language switcher">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={language === 'en' ? 'is-active' : ''}
            aria-label="Switch to English"
          >
            EN
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={language === 'zh' ? 'is-active' : ''}
            aria-label="切換至中文"
          >
            繁中
          </button>
        </div>

        <ThemeToggle className="desktop-only" />
        <MotionToggle className="desktop-only" />

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="pill-sign-in desktop-only bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <div className="relative z-10 flex items-center space-x-2 rounded-full bg-zinc-950 px-4 py-0.5 ring-1 ring-white/10">
            <span>Sign in</span>
            <svg
              fill="none"
              height="16"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.75 8.75L14.25 12L10.75 15.25"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
        </button>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef}>
        <ul className="mobile-menu-list">
          <li>
            <div className="mobile-language-toggle" aria-label="Language switcher">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'is-active' : ''}
                aria-label="Switch to English"
              >
                EN
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => setLanguage('zh')}
                className={language === 'zh' ? 'is-active' : ''}
                aria-label="切換至中文"
              >
                繁中
              </button>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-2 py-1">
              <ThemeToggle />
              <span className="text-sm text-text-muted">主題切換</span>
            </div>
          </li>
          {items.map((item, i) => {
            const itemLabel = getItemLabel(item);

            return (
              <li key={item.href || `mobile-item-${i}`}>
                {isRouterLink(item.href) ? (
                  <Link
                    href={item.href}
                    className={`mobile-menu-link${resolvedActiveHref === item.href ? ' is-active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {itemLabel}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`mobile-menu-link${resolvedActiveHref === item.href ? ' is-active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    {itemLabel}
                  </a>
                )}
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="mobile-menu-link w-full text-left"
              onClick={() => {
                router.push('/login');
                closeMobileMenu();
              }}
            >
              Sign in
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
