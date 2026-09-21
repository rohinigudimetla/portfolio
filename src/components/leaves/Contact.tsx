"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react";
import NameMark from "../NameMark";
import { person, schooling } from "@/content/book";

/**
 * Last leaf. The ember field takes the whole sheet, and the contact list
 * sits in a bark plate on top of it.
 *
 * The plate is not decoration. Ember is a mid tone: nothing in the palette
 * reaches 4.5:1 against it, so body-size text cannot sit on it directly.
 * Only the display line, which is large enough for the 3:1 rule, does.
 */
export default function Contact() {
  const root = useRef<HTMLDivElement | null>(null);

  const links = [
    { label: "Email", value: person.email, href: `mailto:${person.email}` },
    { label: "Phone", value: person.phone, href: person.phoneHref },
    { label: "LinkedIn", value: "in/rohinigudimetla", href: person.linkedin },
    { label: "GitHub", value: "rohinigudimetla", href: person.github },
  ];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-rise]", {
        opacity: 0,
        y: 22,
        duration: 0.85,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%" },
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-y-auto"
      style={{ background: "var(--color-ember)" }}
    >
      <NameMark tone="var(--color-bark)" />

      <div className="flex min-h-full flex-col justify-center px-[6vw] py-[12vh]">
        <h2
          data-rise
          className="t-poster mb-10 text-[clamp(2.6rem,9vw,6.5rem)]"
          style={{ color: "var(--color-bark)" }}
        >
          Say hello
        </h2>

        <div
          data-rise
          className="w-full max-w-[62rem] px-[6vw] py-[5vh] sm:px-12"
          style={{ background: "var(--color-bark)" }}
        >
          <ul className="w-full">
            {links.map((l, i) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5 transition-colors duration-200 hover:text-[var(--color-ember)]"
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--color-moss)",
                    color: "var(--color-butter)",
                  }}
                >
                  <span className="t-meta" style={{ color: "var(--color-moss-lit)" }}>
                    {l.label}
                  </span>
                  <span className="flex items-baseline gap-2 text-[1.05rem] font-medium">
                    {l.value}
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <a
            href={person.resume}
            download=""
            className="t-meta mt-9 inline-flex items-center gap-3 px-6 py-4 transition-opacity duration-150 hover:opacity-85"
            style={{ background: "var(--color-ember)", color: "var(--color-butter)" }}
          >
            <DownloadSimple size={16} weight="bold" aria-hidden="true" />
            Resume, PDF
          </a>
        </div>

        <div
          data-rise
          className="mt-10 flex flex-wrap gap-x-10 gap-y-3"
          style={{ color: "var(--color-bark)" }}
        >
          {schooling.map((s) => (
            <p key={s.school} className="t-meta">
              {s.when} / {s.school} / {s.award}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
