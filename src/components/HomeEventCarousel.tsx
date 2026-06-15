"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const SLIDE_INTERVAL_MS = 6000;

const IMAGE_SLIDES = [
  {
    id: "books-for-love",
    src: "/carousel/books-for-love.png",
    altKey: "slide1Alt" as const,
  },
  {
    id: "medication-recycling",
    src: "/carousel/medication-recycling.png",
    altKey: "slide2Alt" as const,
  },
] as const;

const SLIDE_COUNT = IMAGE_SLIDES.length + 1;
const HERO_SLIDE_INDEX = SLIDE_COUNT - 1;

export function HomeEventCarousel() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const pauseTimerRef = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setActive(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  const pauseBriefly = useCallback(() => {
    setPaused(true);
    if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = window.setTimeout(() => setPaused(false), SLIDE_INTERVAL_MS * 2);
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDE_COUNT);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  function handleTouchStart(clientX: number) {
    touchStartX.current = clientX;
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const delta = clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta < 0) {
        next();
        pauseBriefly();
      } else {
        prev();
        pauseBriefly();
      }
    }
    touchStartX.current = null;
  }

  function handlePrev() {
    prev();
    pauseBriefly();
  }

  function handleNext() {
    next();
    pauseBriefly();
  }

  function handleDot(index: number) {
    goTo(index);
    pauseBriefly();
  }

  return (
    <section
      className="gradient-mesh relative w-full overflow-hidden border-b border-slate-200/60"
      aria-roledescription="carousel"
      aria-label={t.home.carousel.title}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-brand-cyan/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-orange/15 blur-3xl animate-float stagger-3" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h2 className="font-display mb-5 text-center text-2xl font-bold tracking-tight text-slate-900 sm:mb-6 sm:text-3xl">
          {t.home.carousel.title}
        </h2>

        <div className="relative rounded-2xl border border-slate-200/80 bg-white/60 shadow-sm backdrop-blur-sm">
          <div className="isolate overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${active * 100}%)` }}
              onTouchStart={(e) => handleTouchStart(e.touches[0]?.clientX ?? 0)}
              onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
            >
            {IMAGE_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className="relative min-w-full"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${SLIDE_COUNT}`}
                aria-hidden={index !== active}
              >
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] md:aspect-[21/8]">
                  <Image
                    src={slide.src}
                    alt={t.home.carousel[slide.altKey]}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1152px"
                    className="bg-white object-contain object-center"
                  />
                </div>
              </div>
            ))}

            {/* Slide 3 — Collectiv hero + CTA */}
            <div
              className="relative min-w-full"
              role="group"
              aria-roledescription="slide"
              aria-label={`${HERO_SLIDE_INDEX + 1} / ${SLIDE_COUNT}`}
              aria-hidden={active !== HERO_SLIDE_INDEX}
            >
              <div className="relative flex aspect-[4/3] w-full items-center justify-center px-4 py-10 text-center sm:aspect-[16/7] sm:px-8 sm:py-12 md:aspect-[21/8]">
                <div className="relative mx-auto max-w-3xl">
                  <p className="badge-brand inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider shadow-sm">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-gradient" />
                    {t.home.badge}
                  </p>
                  <h1 className="mt-5 mb-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-6 sm:mb-5 sm:text-4xl md:text-5xl lg:text-6xl">
                    {t.home.titleLine1} <br />
                    <span className="text-brand-gradient">{t.home.titleLine2}</span>
                  </h1>
                  <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-slate-600 sm:mb-10 sm:text-lg md:text-xl">
                    {t.home.subtitle}
                  </p>
                  <Link
                    href="/booking"
                    className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base sm:px-8 sm:py-4 sm:text-lg"
                  >
                    {t.home.cta}{" "}
                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className="carousel-controls absolute inset-0 z-20 flex items-center justify-between px-2 sm:px-4">
            <button
              type="button"
              onClick={handlePrev}
              className="btn-primary carousel-nav-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-lg"
              aria-label={t.home.carousel.prev}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary carousel-nav-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-lg"
              aria-label={t.home.carousel.next}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 sm:bottom-4">
            {Array.from({ length: SLIDE_COUNT }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDot(index)}
                className={`pointer-events-auto h-2.5 rounded-full shadow-sm transition-all ${
                  index === active
                    ? "w-7 bg-brand-cyan-dark ring-2 ring-white/80"
                    : "w-2.5 bg-slate-600/70 ring-1 ring-white/60 hover:bg-slate-700"
                }`}
                aria-label={`${t.home.carousel.goToSlide} ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
