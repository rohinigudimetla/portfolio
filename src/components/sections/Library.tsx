"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import Ink from "../Ink";
import PageTurn from "../PageTurn";
import { library } from "@/content/book";
import { CSS } from "@/lib/palette";
import { spillFromElement } from "@/lib/wash";

/**
 * One entry in the project's own record.
 *
 * Each sits at a slightly different indent, the way a hand drifts down a
 * page, and the mark beside it is re-inked when the entry is touched.
 */
function Entry({
  mark,
  text,
  index,
}: {
  mark: string;
  text: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seed, setSeed] = useState(() => 60 + index * 53);

  // A small, irregular indent so the column never reads as a grid.
  const indent = [0, 1.1, 0.5, 1.6, 0.7, 1.3][index % 6];

  return (
    <motion.div
      ref={ref}
      onPointerEnter={() => {
        setSeed((s) => (s + 211) % 983);
        spillFromElement(ref.current, "terracotta", 0.55);
      }}
      className="relative max-w-[34rem]"
      style={{ marginLeft: `${indent}rem` }}
    >
      <div className="flex items-baseline gap-4">
        <div className="relative h-4 w-4 shrink-0 translate-y-[-1px]">
          <Ink
            variant="tick"
            color={CSS.terracotta}
            seed={seed}
            strokeWidth={1.5}
            wobble={2.3}
            pad={1}
          />
        </div>
        <h3
          className="t-hand text-[1.32rem]"
          style={{ color: CSS.gold }}
        >
          {mark}
        </h3>
      </div>
      <p
        className="t-body mt-2 pl-8 text-[1rem]"
        style={{ color: CSS.creamDim }}
      >
        {text}
      </p>
    </motion.div>
  );
}

export default function Library() {
  const reduce = useReducedMotion();
  const liveRef = useRef<HTMLAnchorElement | null>(null);

  return (
    <section id="library" className="relative py-28 sm:py-36">
      <PageTurn />

      {/* A warmer pool of light, so the longest section reads as its own leaf. */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 52% at 30% 20%, color-mix(in oklab, #3e543f 55%, transparent), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-[40rem]">
          <h2
            className="t-heading text-[clamp(2rem,4.6vw,3.1rem)]"
            style={{ color: CSS.cream }}
          >
            {library.name}
          </h2>

          <div className="relative mt-4 h-4 w-[min(22rem,70%)]">
            <Ink variant="underline" color={CSS.gold} seed={777} strokeWidth={1.4} />
          </div>

          <p
            className="t-body mt-8 text-[1.08rem]"
            style={{ color: CSS.cream }}
          >
            {library.lead}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            {library.stack.map((s) => (
              <span key={s} className="text-[0.87rem]" style={{ color: CSS.sage }}>
                {s}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            {library.links.map((l, i) => (
              <a
                key={l.href}
                ref={i === 0 ? liveRef : undefined}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                onPointerEnter={() =>
                  i === 0 && spillFromElement(liveRef.current, "gold", 0.6)
                }
                className="inline-flex items-center gap-1.5 text-[0.95rem] no-underline
                           transition-colors duration-200 hover:text-[var(--color-gold-pale)]"
                style={{ color: CSS.terracotta }}
              >
                {l.label}
                <ArrowUpRight size={15} weight="regular" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-20 grid gap-x-14 gap-y-12 lg:grid-cols-2">
          {library.entries.map((entry, i) => (
            <motion.div
              key={entry.mark}
              initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(3px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.7,
                delay: (i % 3) * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Entry mark={entry.mark} text={entry.text} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
