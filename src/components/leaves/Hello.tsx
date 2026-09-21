"use client";

import { motion, useReducedMotion } from "motion/react";
import Voronoi from "../Voronoi";
import Bloom from "../Bloom";
import Ink from "../Ink";
import { CSS } from "@/lib/palette";
import { hello, note, person } from "@/content/book";

/**
 * First page. One sentence, a lot of paper around it.
 *
 * The portrait slot is deliberately empty: drop a square image at
 * /public/rohini.jpg and it appears with no other change.
 */
export default function Hello() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: {
            duration: 0.9,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <div className="relative h-full w-full">
      <Voronoi cells={40} opacity={0.14} />
      <Bloom />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div className="w-full max-w-[44rem]">
          {/* Portrait slot. Drop a square image at /public/rohini.jpg and
              swap the initials for it; nothing else needs to change. */}
          <motion.div {...rise(0)} className="mb-12 flex justify-center">
            <div className="relative h-28 w-28 sm:h-32 sm:w-32">
              <div
                className="absolute inset-0 flex items-center justify-center rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 34% 26%, #4A5F4C 0%, #33452F 58%, #26352A 100%)",
                  boxShadow:
                    "0 12px 34px -10px rgba(0,0,0,0.62), inset 0 1px 0 rgba(238,235,211,0.1)",
                }}
              >
                <span
                  className="t-hand text-[2rem]"
                  style={{ color: CSS.goldPale, opacity: 0.9 }}
                >
                  RG
                </span>
              </div>
              {/* A ring drawn round it by hand, the way a photo gets circled. */}
              <div className="absolute -inset-2">
                <Ink
                  variant="ring"
                  color={CSS.gold}
                  seed={53}
                  strokeWidth={1}
                  wobble={2.2}
                  opacity={0.38}
                  pad={2}
                />
              </div>
            </div>
          </motion.div>

          <motion.p
            {...rise(0.12)}
            className="t-display text-center text-[clamp(1.85rem,5.2vw,3.15rem)]"
            style={{ color: CSS.cream, lineHeight: 1.22 }}
          >
            {hello}
          </motion.p>

          <motion.div
            {...rise(0.24)}
            className="mx-auto mt-8 h-4 w-[min(13rem,42%)]"
          >
            <div className="relative h-full w-full">
              <Ink
                variant="underline"
                color={CSS.terracotta}
                seed={231}
                strokeWidth={1.4}
              />
            </div>
          </motion.div>

          <motion.p
            {...rise(0.34)}
            className="t-hand mt-8 text-center text-[1.35rem]"
            style={{ color: CSS.gold }}
          >
            {note}
          </motion.p>

          <motion.p
            {...rise(0.44)}
            className="mt-14 text-center text-[0.78rem] tracking-[0.18em] uppercase"
            style={{ color: CSS.sage, opacity: 0.75 }}
          >
            {person.place}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
