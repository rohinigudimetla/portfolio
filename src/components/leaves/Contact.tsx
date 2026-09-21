"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, DownloadSimple } from "@phosphor-icons/react";
import { person, schooling } from "@/content/book";

/**
 * The last page turns the flame ink loose across the whole sheet. Type goes
 * to press black here, which is the only pairing that holds contrast on it.
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
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      gsap.from("[data-rise]", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%" },
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-y-auto"
      style={{ background: "var(--color-flame)" }}
    >
      <div className="flex min-h-full flex-col justify-between px-[7vw] py-[8vh] sm:px-[6vw]">
        <div>
          <h2
            data-rise
            className="t-poster text-[clamp(2.6rem,9vw,6.5rem)]"
            style={{ color: "var(--color-ink)" }}
          >
            Say hello
          </h2>

          <ul className="mt-14 w-full max-w-[68rem]">
            {links.map((l) => (
              <li key={l.href} data-rise>
                <a
                  href={l.href}
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="group flex items-baseline justify-between gap-6 py-5
                             transition-opacity duration-200 hover:opacity-60"
                  style={{
                    borderTop: "1px solid var(--color-ink)",
                    color: "var(--color-ink)",
                  }}
                >
                  <span className="t-meta">{l.label}</span>
                  <span className="flex items-baseline gap-2 text-[1.05rem] font-medium">
                    {l.value}
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <a
            data-rise
            href={person.resume}
            download=""
            className="t-meta mt-10 inline-flex items-center gap-3 px-6 py-4 transition-colors duration-150 hover:opacity-85"
            style={{ background: "var(--color-ink)", color: "var(--color-flame)" }}
          >
            <DownloadSimple size={16} weight="bold" aria-hidden="true" />
            Resume, PDF
          </a>
        </div>

        <div
          data-rise
          className="mt-16 flex flex-wrap gap-x-12 gap-y-4"
          style={{ color: "var(--color-ink)" }}
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
