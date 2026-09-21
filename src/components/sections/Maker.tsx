"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import Ink from "../Ink";
import PageTurn from "../PageTurn";
import { opening, workbench } from "@/content/book";
import { CSS } from "@/lib/palette";
import { spillFromElement } from "@/lib/wash";

/** A tool on the bench. Touching it wets the paper underneath. */
function Tool({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  return (
    <span
      ref={ref}
      onPointerEnter={() => spillFromElement(ref.current, "gold", 0.4)}
      className="cursor-default text-[0.95rem] leading-[1.9] transition-colors duration-300"
      style={{ color: CSS.cream }}
    >
      {label}
    </span>
  );
}

export default function Maker() {
  const reduce = useReducedMotion();

  return (
    <section id="maker" className="relative py-28 sm:py-36">
      <PageTurn />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]">
          {/* Prose. One drop cap, at the true opening of the page. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              className="t-body dropcap max-w-[38rem] text-[1.12rem]"
              style={{ color: CSS.cream }}
            >
              {opening.lead}
            </p>
            {opening.body.map((para, i) => (
              <p
                key={i}
                className="t-body mt-6 max-w-[38rem] text-[1.02rem]"
                style={{ color: CSS.creamDim }}
              >
                {para}
              </p>
            ))}

            <p
              className="t-hand mt-9 text-[1.35rem]"
              style={{ color: CSS.gold, transform: "rotate(-1.4deg)" }}
            >
              {opening.margin}
            </p>
          </motion.div>

          {/* The bench. Grouped clusters rather than one long ruled list. */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:pt-3"
          >
            <h2
              className="t-heading text-[1.6rem]"
              style={{ color: CSS.cream }}
            >
              On the bench
            </h2>

            <div className="mt-7 flex flex-col gap-6">
              {workbench.map((group, gi) => (
                <div key={group.heading} className="relative">
                  {/* The rule sits beside the label rather than under it,
                      which keeps each group to three lines. */}
                  <div className="flex items-center gap-3">
                    <h3
                      className="t-hand shrink-0 text-[1.22rem]"
                      style={{ color: CSS.terracotta }}
                    >
                      {group.heading}
                    </h3>
                    <div className="relative h-2 w-16 shrink-0">
                      <Ink
                        variant="underline"
                        color={CSS.clay}
                        seed={200 + gi * 31}
                        strokeWidth={1}
                        wobble={2.4}
                        pad={0}
                      />
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0">
                    {group.items.map((item) => (
                      <Tool key={item} label={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
