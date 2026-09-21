"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useLeafReveal } from "@/lib/useLeafReveal";
import { ArrowUpRight } from "@phosphor-icons/react";
import Voronoi from "../Voronoi";
import NameMark from "../NameMark";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { entries, type Entry } from "@/content/book";

/**
 * Work. Three lines on the page; everything else is behind a Radix dialog,
 * which brings its own focus trap, escape handling and scroll lock.
 *
 * The Voronoi plate lives here and only here, at low coverage, standing in
 * for the fibre of the stock. One page, one plate.
 */
export default function Work() {
  const root = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<Entry | null>(null);

  const reveal = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // fromTo, never from: a .from() infers its destination from whatever
      // the live computed style says at creation time, and inside a pinned,
      // transformed stage that can resolve to 0, leaving the element
      // invisible for good. Both ends are stated here, and clearProps hands
      // the element back to the stylesheet when it lands.
      gsap.fromTo(
        "[data-row]",
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
    }, root);
    return () => ctx.revert();
  };
  useLeafReveal(1, reveal);

  return (
    <div
      ref={root}
      className="relative h-full w-full overflow-hidden"
      style={{ background: "var(--color-butter)" }}
    >
      <Voronoi cell={210} opacity={0.26} />
      <NameMark tone="var(--color-moss)" />

      {/* Small, in the margin. Not a hero. */}
      <img
        src="/teacup.webp"
        alt=""
        aria-hidden="true"
        width={310}
        height={310}
        className="pointer-events-none absolute right-[6vw] bottom-[9vh] w-[clamp(104px,13vw,178px)] select-none"
        style={{ transform: "rotate(3deg)" }}
      />

      <div className="relative z-10 flex h-full flex-col justify-center px-[7vw] pb-[6vh] sm:px-[6vw]">
        <p className="t-meta mb-12" style={{ color: "var(--color-ember)" }}>
          Selected work
        </p>

        <ul className="w-full">
          {entries.map((e) => (
            <li key={e.title} data-row>
              <button
                type="button"
                onClick={() => setOpen(e)}
                className="group flex w-full cursor-pointer items-baseline justify-between gap-6
                           border-0 border-t bg-transparent py-7 text-left
                           transition-colors duration-200
                           hover:bg-[var(--color-ember)]/12
                           focus-visible:outline-3 focus-visible:outline-[var(--color-ember)]"
                style={{ borderTopColor: "var(--color-moss)", borderTopWidth: 1 }}
              >
                <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <span
                    className="t-lead text-[clamp(1.6rem,4.4vw,3rem)] transition-colors duration-200 group-hover:text-[var(--color-ember)]"
                    style={{ color: "var(--color-bark)" }}
                  >
                    {e.title}
                  </span>
                  <span className="t-meta" style={{ color: "var(--color-moss)" }}>
                    {e.kind}
                  </span>
                </span>
                <span
                  className="t-meta shrink-0"
                  style={{ color: "var(--color-ember)" }}
                >
                  {e.when}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div
          aria-hidden="true"
          style={{ borderTop: "1px solid var(--color-moss)" }}
        />
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          {open && (
            <div className="mx-auto w-full max-w-[46rem] px-[7vw] py-[12vh] sm:px-8">
              <DialogTitle
                className="t-poster text-[clamp(2.2rem,6vw,4rem)]"
                style={{ color: "var(--color-bark)" }}
              >
                {open.title}
              </DialogTitle>
              <DialogDescription
                className="t-meta mt-4"
                style={{ color: "var(--color-ember)" }}
              >
                {open.kind} / {open.when}
              </DialogDescription>

              <div className="mt-12 flex flex-col gap-6">
                {open.detail.map((d, i) => (
                  <p
                    key={i}
                    className="t-body text-[1.02rem]"
                    style={{ color: "var(--color-bark)" }}
                  >
                    {d}
                  </p>
                ))}
              </div>

              <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-2">
                {open.stack.map((s) => (
                  <li
                    key={s}
                    className="t-meta"
                    style={{ color: "var(--color-moss)" }}
                  >
                    {s}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-4">
                {open.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="t-meta inline-flex items-center gap-2 px-5 py-3 transition-colors duration-150"
                    style={{
                      background: "var(--color-bark)",
                      color: "var(--color-butter)",
                    }}
                  >
                    {l.label}
                    <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
