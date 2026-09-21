"use client";

import { motion, useReducedMotion } from "motion/react";
import Endpapers from "../Endpapers";
import Ink from "../Ink";
import InkButton from "../InkButton";
import { CSS } from "@/lib/palette";

/**
 * The inside front cover. Marbled endpapers behind, the name set into the
 * quiet left of the sheet, and the two things a recruiter came for within
 * reach without scrolling.
 */
export default function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] items-center overflow-hidden"
    >
      {/* Endpapers: the marbled sheet pasted inside a book's cover. */}
      <div className="absolute inset-0 z-0 opacity-[0.55]">
        <Endpapers intensity={1} />
      </div>
      {/* The sheet is dimmed toward the type so the name never fights it. */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(100deg, #334736 8%, color-mix(in oklab, #334736 78%, transparent) 42%, transparent 78%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 pb-16 sm:px-8">
        <div className="max-w-[46rem]">
          <motion.h1
            {...rise(0.05)}
            className="t-display text-[clamp(2.9rem,8.2vw,5.6rem)]"
            style={{ color: CSS.cream }}
          >
            Rohini Gudimetla
          </motion.h1>

          <motion.div {...rise(0.16)} className="relative mt-5 h-5 w-[min(30rem,80%)]">
            <Ink variant="underline" color={CSS.terracotta} seed={311} strokeWidth={1.7} />
          </motion.div>

          <motion.p
            {...rise(0.26)}
            className="t-body mt-7 max-w-[34rem] text-[1.06rem] sm:text-[1.14rem]"
            style={{ color: CSS.creamDim }}
          >
            Full stack developer in Boston, building on Spring Boot and React,
            and writing down why each decision went that way.
          </motion.p>

          <motion.div {...rise(0.38)} className="mt-11 flex flex-wrap items-center gap-4">
            <InkButton href="#library" weight="primary" tone="terracotta">
              Read the work
            </InkButton>
            <InkButton href="/rohini-gudimetla-resume.pdf" tone="gold" download>
              Download resume
            </InkButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
