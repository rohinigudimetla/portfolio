"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The book.
 *
 * Leaves are stacked in one pinned stage. Scrolling scrubs a single GSAP
 * timeline that hinges each leaf at its top edge and swings it up and over,
 * revealing the leaf already sitting underneath.
 *
 * This is ScrollTrigger's own job, so ScrollTrigger does it: one pin, one
 * scrubbed timeline, `start: "top top"`. An earlier version drove the same
 * effect from scroll progress in React state and CSS transforms, which
 * recomputed on the main thread and stuttered under load.
 *
 * Scroll distance is one viewport per leaf. The last leaf never turns.
 */
export default function Book({ leaves }: { leaves: ReactNode[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const total = leaves.length;

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const sheets = gsap.utils.toArray<HTMLElement>("[data-leaf]");
      const shades = gsap.utils.toArray<HTMLElement>("[data-leaf-shade]");

      gsap.set(sheets, { transformOrigin: "50% 0%", transformStyle: "preserve-3d" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          pin: stageRef.current,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      sheets.forEach((sheet, i) => {
        if (i === sheets.length - 1) return;
        // The leaf rests for the first quarter of its slice, then goes over.
        tl.to(sheet, { rotateX: 94, duration: 0.74, ease: "power1.in" }, i + 0.26)
          .to(sheet, { y: -50, duration: 0.74 }, i + 0.26)
          .to(shades[i], { opacity: 1, duration: 0.74 }, i + 0.26)
          // Once a leaf is past the vertical it must stop taking clicks,
          // or it keeps shadowing the page it just revealed. GSAP reverses
          // this on the way back up.
          .to(sheet, { pointerEvents: "none", duration: 0.01 }, i + 0.42);
      });
    },
    { scope: wrapRef, dependencies: [total] },
  );

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: `${total * 100}svh` }}
    >
      <div
        ref={stageRef}
        className="relative h-[100svh] w-full overflow-hidden"
        style={{ perspective: "2000px", perspectiveOrigin: "50% 38%" }}
      >
        {leaves.map((leaf, i) => (
          <div
            key={i}
            data-leaf
            className="absolute inset-0"
            style={{ zIndex: total - i, backfaceVisibility: "hidden" }}
          >
            {leaf}
            {/* The face of the leaf turning away from the light. */}
            <div
              data-leaf-shade
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-50 opacity-0"
              style={{ background: "var(--color-ink)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
