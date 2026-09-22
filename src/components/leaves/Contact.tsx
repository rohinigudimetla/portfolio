"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useLeafReveal } from "@/lib/useLeafReveal";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react";
import Grain from "../Grain";
import { person } from "@/content/book";

/**
 * Last leaf. Cream on the ember field, no plate.
 *
 * Cream on ember is 3.7:1, which clears WCAG's large-text rule but not the
 * body-text one, so everything set on the colour is large and bold enough
 * to qualify. Nothing small sits on the colour.
 */
export default function Contact() {
  const root = useRef<HTMLDivElement | null>(null);

  const links = [
    { value: person.email, href: `mailto:${person.email}` },
    { value: person.phone, href: person.phoneHref },
    { value: "linkedin.com/in/rohinigudimetla", href: person.linkedin },
    { value: "github.com/rohinigudimetla", href: person.github },
  ];

  const reveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // fromTo, never from: a .from() infers its destination from whatever
      // the live computed style says at creation time, and inside a pinned,
      // transformed stage that can resolve to 0, leaving the element
      // invisible for good. Both ends are stated here, and clearProps hands
      // the element back to the stylesheet when it lands.
      gsap.fromTo(
        "[data-rise]",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.07,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
    }, root);
    return () => ctx.revert();
  };
  useLeafReveal(3, reveal);

  return (
    <div
      ref={root}
      className="relative flex h-full w-full flex-col overflow-y-auto"
      style={{ background: "var(--color-ember)" }}
    >
      <Grain opacity={0.3} />

      <div className="flex flex-1 flex-col justify-center px-[7vw] pt-[14vh] pb-[9vh] sm:px-[6vw] sm:py-[12vh]">
        <h2
          data-rise
          className="t-poster text-[clamp(2.8rem,9.5vw,7rem)]"
          style={{ color: "var(--color-butter)" }}
        >
          Say hello
        </h2>

        <ul className="mt-8 w-full max-w-[52rem] sm:mt-12">
          {links.map((l, i) => (
            <li key={l.href} data-rise>
              <a
                href={l.href}
                {...(l.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className="flex items-center justify-between gap-4 py-4 transition-opacity duration-200 hover:opacity-70 sm:gap-6 sm:py-5"
                style={{
                  borderTop:
                    i === 0 ? "none" : "1px solid color-mix(in srgb, #fce7bc 45%, transparent)",
                  color: "var(--color-butter)",
                }}
              >
                {/* Cream on ember is 3.78:1, which only clears AA as large
                    text, so these never drop below 1.2rem bold. A phone has
                    no room for the longest of them at that size, so they
                    wrap mid-token rather than shrink out of compliance. */}
                <span className="min-w-0 text-[clamp(1.2rem,4.6vw,1.95rem)] font-bold tracking-[-0.02em] [overflow-wrap:anywhere]">
                  {l.value}
                </span>
                <ArrowUpRight size={20} weight="bold" aria-hidden="true" className="shrink-0" />
              </a>
            </li>
          ))}
        </ul>

        <a
          data-rise
          href={person.resume}
          download=""
          className="t-meta mt-10 inline-flex w-fit sm:mt-12 items-center gap-3 px-7 py-4 transition-opacity duration-150 hover:opacity-85"
          style={{ background: "var(--color-bark)", color: "var(--color-butter)" }}
        >
          <DownloadSimple size={16} weight="bold" aria-hidden="true" />
          Resume, PDF
        </a>
      </div>

    </div>
  );
}
