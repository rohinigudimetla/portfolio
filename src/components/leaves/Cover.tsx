"use client";

import { motion, useReducedMotion } from "motion/react";
import Ink from "../Ink";
import Bloom from "../Bloom";
import { CSS } from "@/lib/palette";
import { person } from "@/content/book";

/**
 * The closed book, lying on the table.
 *
 * The cover board lifts a few degrees from its lower edge every so often
 * and settles back, which is the same gesture the reader is about to make
 * and the only invitation the page needs. A block of page edges shows along
 * the fore edge so the thing has thickness.
 */
export default function Cover() {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: CSS.char }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 44%, rgba(90,112,88,0.5) 0%, rgba(122,78,63,0.16) 40%, rgba(43,60,45,0.12) 62%, transparent 78%)",
        }}
      />
      <Bloom />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
        style={{
          width: "min(30rem, 74vw)",
          aspectRatio: "0.74",
          perspective: "1400px",
        }}
      >
        {/* The page block, showing along the fore edge and the tail. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-[7px] translate-y-[7px]"
          style={{
            background:
              "repeating-linear-gradient(to bottom, #EEEBD3 0px, #EEEBD3 1px, #C9C6B2 1px, #C9C6B2 3px)",
            opacity: 0.5,
            boxShadow: "0 30px 70px -18px rgba(0,0,0,0.8)",
          }}
        />

        {/* The cover board, which lifts and settles until somebody turns it. */}
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: "50% 0%", transformStyle: "preserve-3d" }}
          animate={reduce ? {} : { rotateX: [0, -7, 0] }}
          transition={{
            duration: 3.8,
            repeat: Infinity,
            ease: [0.42, 0, 0.4, 1],
            repeatDelay: 1.4,
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              background:
                "linear-gradient(124deg, #8A5949 0%, #7A4E3F 40%, #63402F 78%, #563729 100%)",
              boxShadow:
                "0 34px 80px -20px rgba(0,0,0,0.78), inset 0 1px 0 rgba(238,235,211,0.14)",
            }}
          >
            {/* Lamplight across the boards. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 74% 54% at 26% 10%, rgba(232,201,136,0.2) 0%, transparent 64%)",
              }}
            />
            {/* Cloth spine down the hinge. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-[14%]"
              style={{
                background:
                  "linear-gradient(to right, #243327 0%, #2F4131 62%, #3A4C39 90%, rgba(27,33,28,0.2) 100%)",
                boxShadow: "inset -3px 0 9px rgba(0,0,0,0.45)",
              }}
            />

            <div className="relative flex h-full flex-col justify-between py-[12%] pr-[11%] pl-[22%]">
              <div>
                <h1
                  className="t-display text-[clamp(1.55rem,3.6vw,2.15rem)]"
                  style={{ color: CSS.cream }}
                >
                  {person.name}
                </h1>
                <div className="relative mt-4 h-3 w-[80%]">
                  <Ink
                    variant="underline"
                    color={CSS.gold}
                    seed={88}
                    strokeWidth={1.2}
                    pad={0}
                  />
                </div>
                <p
                  className="mt-5 text-[0.7rem] tracking-[0.22em] uppercase"
                  style={{ color: CSS.goldPale, opacity: 0.82 }}
                >
                  {person.role}
                </p>
              </div>

              <p className="t-hand text-[1.05rem]" style={{ color: CSS.roseDust }}>
                {person.place}
              </p>
            </div>
          </div>

          {/* The shadow the lifting board throws back onto the pages. */}
          {!reduce && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/2"
              style={{
                background:
                  "linear-gradient(to top, rgba(11,15,12,0.55) 0%, transparent 100%)",
              }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: [0.42, 0, 0.4, 1],
                repeatDelay: 1.4,
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
