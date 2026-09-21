"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { person } from "@/content/book";

/**
 * Cover. Forest ground, one flame plate, the name in paper.
 *
 * The signature device is misregistration: the flame plate of the name sits
 * a few pixels off the paper plate, then pulls into register on load, the
 * way a second colour settles when a press is trued up. One device, used
 * here and nowhere else on the site.
 */
export default function Cover() {
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from("[data-plate-flame]", { xPercent: -3, yPercent: 4, duration: 1.1 }, 0)
        .from("[data-misreg]", { x: 14, y: -9, duration: 1.3 }, 0)
        .from("[data-name]", { opacity: 0, duration: 0.8 }, 0.1)
        .from("[data-meta]", { opacity: 0, y: 12, duration: 0.7, stagger: 0.08 }, 0.45);
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--color-forest)" }}
    >
      {/* The flame plate: one flat shape, no gradient, bleeding off two edges. */}
      <div
        data-plate-flame
        aria-hidden="true"
        className="absolute"
        style={{
          background: "var(--color-flame)",
          width: "min(74svh, 62vw)",
          height: "min(74svh, 62vw)",
          borderRadius: "50%",
          right: "-10vw",
          bottom: "-16svh",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-[7vw] sm:p-[5vw]">
        <p data-meta className="t-meta" style={{ color: "var(--color-flame)" }}>
          Portfolio
        </p>

        <div className="relative">
          {/* Second plate, out of register behind the first. */}
          <h1
            data-misreg
            aria-hidden="true"
            className="t-poster plate-shift text-[clamp(3rem,12vw,9.5rem)]"
            style={{ color: "var(--color-flame)", mixBlendMode: "screen" }}
          >
            {person.name}
          </h1>
          <h1
            data-name
            className="t-poster relative text-[clamp(3rem,12vw,9.5rem)]"
            style={{ color: "var(--color-paper)" }}
          >
            {person.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <p data-meta className="t-meta" style={{ color: "var(--color-paper)" }}>
            {person.role}
          </p>
          <p data-meta className="t-meta" style={{ color: "var(--color-paper)" }}>
            {person.place}
          </p>
        </div>
      </div>
    </div>
  );
}
