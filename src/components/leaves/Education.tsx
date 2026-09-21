"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useLeafReveal } from "@/lib/useLeafReveal";
import Voronoi from "../Voronoi";
import NameMark from "../NameMark";
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
      style={{ background: "var(--color-bark)" }}
    >
      <Voronoi cell={205} opacity={0.3} />
      <NameMark tone="var(--color-moss-lit)" />

      <div className="relative z-10 flex h-full flex-col justify-center px-[7vw] sm:px-[6vw]">
        <p data-rise className="t-meta mb-12" style={{ color: "var(--color-ember)" }}>
          Education
        </p>

        <ul className="w-full">
          {schooling.map((s, i) => (
            <li
              key={s.school}
              data-rise
              className="flex flex-wrap items-baseline gap-x-8 gap-y-2 py-8"
              style={{
                borderTop: "1px solid var(--color-moss)",
                ...(i === schooling.length - 1
                  ? { borderBottom: "1px solid var(--color-moss)" }
                  : {}),
              }}
            >
              <span
                className="t-meta w-16 shrink-0"
                style={{ color: "var(--color-ember)" }}
              >
                {s.when}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="t-lead block text-[clamp(1.4rem,3.6vw,2.4rem)]"
                  style={{ color: "var(--color-butter)" }}
                >
                  {s.school}
                </span>
                <span
                  className="mt-2 block text-[0.98rem]"
                  style={{ color: "var(--color-moss-lit)" }}
                >
                  {s.award}
                </span>
              </span>
              <span
                className="t-meta shrink-0"
                style={{ color: "var(--color-moss-lit)" }}
              >
                {s.where}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
