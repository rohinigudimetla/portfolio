"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { useState } from "react";
import Voronoi from "../Voronoi";
import Bloom from "../Bloom";
import Ink from "../Ink";
import { CSS } from "@/lib/palette";
import { entries } from "@/content/book";
import { spillFromElement } from "@/lib/wash";

/**
 * Work, folded.
 *
 * The page carries three lines. Everything anyone actually wants to read is
 * behind them, and arrives only when an entry is opened. That keeps the page
 * quiet without throwing away the detail that makes the work worth reading.
 */
/** A torn note pinned to the page. Tilted, soft edged, hand lettered. */
function Scrap({
  text,
  className = "",
  tilt = 0,
  seed = 1,
}: {
  text: string;
  className?: string;
  tilt?: number;
  seed?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 px-5 py-3 ${className}`}
      style={{
        transform: `rotate(${tilt}deg)`,
        background:
          "linear-gradient(150deg, rgba(238,235,211,0.07) 0%, rgba(238,235,211,0.035) 100%)",
        boxShadow: "0 8px 22px -10px rgba(0,0,0,0.55)",
      }}
    >
      <Ink variant="frame" color={CSS.sage} seed={seed} strokeWidth={0.9} wobble={3} opacity={0.4} pad={2} />
      <span className="t-hand relative z-10 text-[1.1rem]" style={{ color: CSS.creamDim }}>
        {text}
      </span>
    </div>
  );
}

export default function Work() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(null);
  const entry = open === null ? null : entries[open];

  return (
    <div className="relative h-full w-full">
      <Voronoi cells={52} opacity={0.11} />
      <Bloom />

      <div className="relative z-10 flex h-full w-full items-center px-7 sm:px-14">
        <div className="w-full max-w-[46rem] lg:ml-[6%]">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="t-hand text-[1.4rem]"
            style={{ color: CSS.gold }}
          >
            things I have built
          </motion.h2>

          <div className="mt-10 flex flex-col">
            {entries.map((e, i) => (
              <motion.button
                key={e.title}
                type="button"
                onClick={() => setOpen(i)}
                onPointerEnter={(ev) =>
                  spillFromElement(ev.currentTarget as HTMLElement, "terracotta", 0.5)
                }
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.75,
                  delay: 0.08 + i * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative cursor-pointer border-0 bg-transparent px-0 py-6 text-left"
              >
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <span
                    className="t-display text-[clamp(1.5rem,3.6vw,2.2rem)] transition-colors duration-300 group-hover:text-[var(--color-gold-pale)]"
                    style={{ color: CSS.cream }}
                  >
                    {e.title}
                  </span>
                  <span
                    className="text-[0.82rem] tracking-[0.13em] uppercase"
                    style={{ color: CSS.sage }}
                  >
                    {e.kind}
                  </span>
                  <span className="t-hand text-[1.15rem]" style={{ color: CSS.terracotta }}>
                    {e.when}
                  </span>
                  <span
                    className="t-hand ml-auto text-[1.1rem] opacity-40 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                    style={{ color: CSS.goldPale }}
                  >
                    read it
                  </span>
                </div>

                {/* The rule inks itself in as the row is approached. */}
                <div className="relative mt-3 h-3 w-full opacity-45 transition-opacity duration-400 group-hover:opacity-100">
                  <Ink
                    variant="underline"
                    color={CSS.sage}
                    seed={140 + i * 61}
                    strokeWidth={1}
                    pad={0}
                  />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes pinned in the margin. Both are facts, not decoration. */}
      <Scrap
        text="16 decision records"
        className="right-[7%] bottom-[24%] hidden lg:block"
        tilt={-4.5}
        seed={301}
      />
      <Scrap
        text="76% coverage on auth"
        className="right-[15%] top-[21%] hidden lg:block"
        tilt={3.2}
        seed={457}
      />

      {/* The detail, which exists only once somebody asks for it. */}
      <AnimatePresence>
        {entry && (
          <motion.div
            key="detail"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-30 overflow-y-auto"
            style={{
              background:
                "linear-gradient(to bottom, #2B3C2D 0%, #283829 60%, #232B24 100%)",
            }}
          >
            <div className="mx-auto w-full max-w-[44rem] px-7 py-16 sm:px-14 sm:py-20">
              <div className="flex items-start justify-between gap-8">
                <div>
                  <h3
                    className="t-display text-[clamp(1.7rem,4vw,2.4rem)]"
                    style={{ color: CSS.cream }}
                  >
                    {entry.title}
                  </h3>
                  <p
                    className="mt-2 text-[0.82rem] tracking-[0.13em] uppercase"
                    style={{ color: CSS.sage }}
                  >
                    {entry.kind}, {entry.when}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  aria-label="Close"
                  className="shrink-0 cursor-pointer border-0 bg-transparent p-2 transition-transform duration-200 hover:rotate-90"
                  style={{ color: CSS.terracotta }}
                >
                  <X size={22} weight="regular" />
                </button>
              </div>

              <div className="relative mt-6 mb-10 h-4 w-32">
                <Ink variant="underline" color={CSS.gold} seed={509} strokeWidth={1.3} pad={0} />
              </div>

              <div className="flex flex-col gap-5">
                {entry.detail.map((d, di) => (
                  <p
                    key={di}
                    className="t-body text-[1rem]"
                    style={{ color: CSS.creamDim }}
                  >
                    {d}
                  </p>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2">
                {entry.stack.map((s) => (
                  <span key={s} className="text-[0.84rem]" style={{ color: CSS.sage }}>
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-7">
                {entry.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 text-[0.95rem] no-underline transition-colors duration-200 hover:text-[var(--color-gold-pale)]"
                    style={{ color: CSS.terracotta }}
                  >
                    {l.label}
                    <ArrowUpRight size={15} weight="regular" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
