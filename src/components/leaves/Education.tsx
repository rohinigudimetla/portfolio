"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useLeafReveal } from "@/lib/useLeafReveal";
import Voronoi from "../Voronoi";
import Grain from "../Grain";
import { schooling } from "@/content/book";

/**
 * Education, its own leaf rather than a footer strip on the contact page.
 * Two degrees, the year leading, set the way a record sheet reads.
 */
export default function Education() {
  const root = useRef<HTMLDivElement | null>(null);

  const reveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rise]",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
    }, root);
    return () => ctx.revert();
  };
  useLeafReveal(2, reveal);

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--color-butter)" }}
    >
      <Grain />
      <Voronoi cell={190} opacity={0.24} className="z-[1]" />

      <div className="relative z-10 flex h-full flex-col justify-center px-[7vw] pt-[13vh] pb-[7vh] sm:px-[6vw]">
        <p data-rise className="t-meta mb-8 sm:mb-12" style={{ color: "var(--color-ember)" }}>
          Education
        </p>

        <ul className="w-full">
          {schooling.map((s, i) => (
            <li
              key={s.school}
              data-rise
              className="py-7 sm:grid sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-8"
              style={{
                borderTop: "1px solid var(--color-moss)",
                ...(i === schooling.length - 1
                  ? { borderBottom: "1px solid var(--color-moss)" }
                  : {}),
              }}
            >
              {/* Year and place share a line of their own on a phone, then
                  become the outer columns of the record once there is width
                  for three. `contents` dissolves this wrapper at sm so the
                  two spans sit in the grid directly, and each one names its
                  column, since dissolving it also hands the grid their DOM
                  order rather than their reading order. */}
              <div className="mb-3 flex items-baseline justify-between gap-4 sm:contents">
                <span
                  className="t-meta sm:col-start-1 sm:row-start-1"
                  style={{ color: "var(--color-ember)" }}
                >
                  {s.when}
                </span>
                <span
                  className="t-meta text-right sm:col-start-3 sm:row-start-1"
                  style={{ color: "var(--color-moss)" }}
                >
                  {s.where}
                </span>
              </div>

              <div className="min-w-0 sm:col-start-2 sm:row-start-1">
                <span
                  className="t-lead block text-[clamp(1.5rem,6vw,2.4rem)]"
                  style={{ color: "var(--color-bark)" }}
                >
                  {s.school}
                </span>
                <span
                  className="mt-2 block text-[0.98rem] sm:text-[1.08rem]"
                  style={{ color: "var(--color-moss)" }}
                >
                  {s.award}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
