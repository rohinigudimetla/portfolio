"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hello, note, tools } from "@/content/book";

/**
 * Hello. The ground inverts to paper here, which is what opening a book
 * actually feels like: the dark board gives way to a bright sheet.
 *
 * The portrait plate is a flat forest disc. Drop a square image at
 * /public/rohini.jpg and put it inside that disc; nothing else changes.
 */
export default function Hello() {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.from("[data-rise]", {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--color-paper)" }}
    >
      {/* A flame bar anchoring the left edge, full bleed top to bottom. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[5vw] min-w-[18px]"
        style={{ background: "var(--color-flame)" }}
      />

      <div className="relative z-10 flex h-full items-center px-[12vw] py-[7vh] sm:px-[10vw]">
        <div className="w-full max-w-[52rem]">
          <div
            data-rise
            aria-hidden="true"
            className="mb-10 h-24 w-24 sm:h-28 sm:w-28"
            style={{ background: "var(--color-forest)", borderRadius: "50%" }}
          />

          <p
            data-rise
            className="t-lead text-[clamp(1.9rem,5.4vw,3.6rem)]"
            style={{ color: "var(--color-forest)" }}
          >
            {hello}
          </p>

          <p
            data-rise
            className="t-body mt-8 max-w-[34rem] text-[1.05rem]"
            style={{ color: "var(--color-forest-paper)" }}
          >
            {note}
          </p>

          <ul
            data-rise
            className="mt-14 flex flex-wrap gap-x-6 gap-y-2"
            style={{ color: "var(--color-forest)" }}
          >
            {tools.map((t) => (
              <li key={t} className="t-meta">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
