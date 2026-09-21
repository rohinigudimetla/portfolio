"use client";

import { DownloadSimple } from "@phosphor-icons/react";
import { person } from "@/content/book";
import { CSS } from "@/lib/palette";
import { spillFromElement } from "@/lib/wash";
import { useRef } from "react";

/**
 * One line, always. The resume stays one gesture away at any scroll
 * position, which is the whole reason this bar exists.
 */
export default function Nav() {
  const resumeRef = useRef<HTMLAnchorElement | null>(null);

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 h-16 backdrop-blur-[2px]"
      style={{
        background:
          "linear-gradient(to bottom, color-mix(in oklab, #1b211c 62%, transparent), transparent)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <a
          href="#top"
          className="t-heading text-[0.97rem] no-underline"
          style={{ color: CSS.cream }}
        >
          Rohini Gudimetla
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          <a
            href="#work"
            className="hidden text-[0.9rem] no-underline transition-colors duration-200 sm:inline hover:text-[var(--color-gold-pale)]"
            style={{ color: CSS.sage }}
          >
            Work
          </a>
          <a
            href="#library"
            className="hidden text-[0.9rem] no-underline transition-colors duration-200 sm:inline hover:text-[var(--color-gold-pale)]"
            style={{ color: CSS.sage }}
          >
            Pocket Library
          </a>
          <a
            href="#hello"
            className="hidden text-[0.9rem] no-underline transition-colors duration-200 sm:inline hover:text-[var(--color-gold-pale)]"
            style={{ color: CSS.sage }}
          >
            Contact
          </a>
          <a
            ref={resumeRef}
            href={person.resume}
            download=""
            onPointerEnter={() => spillFromElement(resumeRef.current, "gold", 0.6)}
            onFocus={() => spillFromElement(resumeRef.current, "gold", 0.6)}
            className="inline-flex items-center gap-2 whitespace-nowrap text-[0.9rem] no-underline
                       transition-transform duration-200 active:translate-y-px"
            style={{ color: CSS.goldPale }}
          >
            <DownloadSimple size={17} weight="regular" aria-hidden="true" />
            Resume
          </a>
        </div>
      </nav>
    </header>
  );
}
