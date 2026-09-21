"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The book.
 *
 * Leaves stack in one pinned stage. Scrolling scrubs a single timeline that
 * hinges each leaf at its top edge and swings it up and over, revealing the
 * leaf already sitting underneath.
 *
 * Each turn owns exactly one timeline unit, so the rest positions land on
 * clean fractions of progress and ScrollTrigger can snap to them. That snap
 * is the point: released mid-turn, the page finishes the turn or falls back,
 * and never sits half over.
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
      const turns = sheets.length - 1;
      if (turns < 1) return;

      gsap.set(sheets, {
        transformOrigin: "50% 0%",
        transformStyle: "preserve-3d",
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.4,
          pin: stageRef.current,
          // The wrapper already supplies the scroll length, so ScrollTrigger
          // must not add its own spacer on top of it. With the default the
          // document comes out twice as long as intended and every snap
          // point lands on the wrong leaf.
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // One snap point per leaf. Nothing is allowed to rest mid-turn.
          snap: {
            snapTo: 1 / turns,
            // Nearest point, not the next one along. ScrollTrigger's
            // directional default pushes past the leaf you just arrived at.
            directional: false,
            duration: { min: 0.25, max: 0.6 },
            delay: 0.05,
            ease: "power2.inOut",
          },
        },
      });

      sheets.forEach((sheet, i) => {
        if (i === turns) return;
        tl.to(sheet, { rotateX: 94, duration: 1, ease: "power1.in" }, i)
          .to(sheet, { y: -55, duration: 1 }, i)
          .to(shades[i], { opacity: 1, duration: 1 }, i)
          // Past the halfway point a leaf must stop taking clicks, or it
          // keeps shadowing the page it just revealed.
          .to(sheet, { pointerEvents: "none", duration: 0.01 }, i + 0.5);
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
            <div
              data-leaf-shade
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-50 opacity-0"
              style={{ background: "var(--color-bark)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
