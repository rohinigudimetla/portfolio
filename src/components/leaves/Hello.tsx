"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useLeafReveal } from "@/lib/useLeafReveal";
import Voronoi from "../Voronoi";
import Grain from "../Grain";
import NameMark from "../NameMark";
import { hello, note, tools, person } from "@/content/book";

/**
 * First leaf. Dark olive ground, the one sentence, and a teacup set small
 * in the margin the way a picture book tips a spot illustration beside the
 * text rather than across it.
 */
export default function Hello() {
  const root = useRef<HTMLDivElement | null>(null);

  const reveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // fromTo, never from. See the note in Contact.
      gsap.fromTo(
        "[data-rise]",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.09,
          delay: 0.15,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
      gsap.fromTo(
        "[data-spot]",
        { opacity: 0, y: 26, rotate: -10 },
        {
          opacity: 1,
          y: 0,
          rotate: -4,
          duration: 1.1,
          delay: 0.35,
          ease: "power3.out",
        },
      );
    }, root);
    return () => ctx.revert();
  };
  useLeafReveal(0, reveal);

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--color-bark)" }}
    >
      <Grain />
      <Voronoi cell={200} opacity={0.34} className="z-[1]" />
      <NameMark tone="var(--color-moss-lit)" />

      <div className="relative z-10 flex h-full flex-col justify-center px-[7vw] py-[12vh] sm:px-[6vw]">
        <div className="max-w-[54rem]">
          <p
            data-rise
            className="t-lead text-[clamp(2rem,5.6vw,4rem)]"
            style={{ color: "var(--color-butter)" }}
          >
            {hello}
          </p>

          <p
            data-rise
            className="t-body mt-8 max-w-[30rem] text-[1.05rem]"
            style={{ color: "var(--color-moss-lit)" }}
          >
            {note}
          </p>
        </div>

        {/* Set in the margin, deliberately small. */}
        <img
          data-spot
          src="/laptop.webp"
          alt=""
          width={360}
          height={329}
          aria-hidden="true"
          className="pointer-events-none absolute right-[7vw] bottom-[22vh] w-[clamp(130px,17vw,240px)] select-none"
          style={{ transform: "rotate(-4deg)" }}
        />

        <ul
          data-rise
          className="absolute right-[7vw] bottom-[8vh] left-[7vw] flex flex-wrap gap-x-6 gap-y-2 sm:left-[6vw]"
          style={{ color: "var(--color-moss-lit)" }}
        >
          {tools.map((t) => (
            <li key={t} className="t-meta">
              {t}
            </li>
          ))}
        </ul>
      </div>

      <p
        className="t-meta absolute bottom-[8vh] right-[7vw] z-20 hidden lg:block"
        style={{ color: "var(--color-ember)" }}
      >
        {person.place}
      </p>
    </div>
  );
}
