"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { List, X } from "@phosphor-icons/react";
import { BOOK_GOTO, LEAF_ACTIVE } from "@/lib/useLeafReveal";
import { person } from "@/content/book";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

const SECTIONS = ["Intro", "Work", "Education", "Contact"];

/**
 * Ink per leaf, because the nav is fixed and the grounds move underneath it.
 *
 * Nothing in the set reaches 4.5:1 on ember, so the labels cannot simply
 * recolour for the last leaf: butter on ember is 3.78:1, bark on ember 3.07:1,
 * and these labels are 11.5px, far below the large-text exemption. The page
 * already answers this — the resume button on that same leaf is a bark plate —
 * so the nav takes a bark plate there too and reads at 11.6:1 on it.
 */
const INK = [
  { fg: "var(--color-butter)", dim: "var(--color-moss-lit)", plate: "transparent" },
  { fg: "var(--color-bark)", dim: "var(--color-moss)", plate: "transparent" },
  { fg: "var(--color-bark)", dim: "var(--color-moss)", plate: "transparent" },
  { fg: "var(--color-butter)", dim: "var(--color-moss-lit)", plate: "var(--color-bark)" },
];

/**
 * The running head, lifted out of the leaves.
 *
 * It used to be a name printed into the corner of every leaf, which meant it
 * turned away with the page and collided with the row meta on narrow screens.
 * Fixed above the stage it stays put while the pages move under it, which is
 * the whole trick of the thing, and it recolours at each turn's halfway point
 * because that is when the leaf underneath becomes the one being read.
 *
 * It lives outside ScrollSmoother's wrapper on purpose: that wrapper is
 * transformed on every frame, and a fixed child of a transformed ancestor is
 * positioned against the ancestor instead of the viewport, so this would ride
 * up and off the screen.
 */
export default function Nav() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onActive = (e: Event) => setActive((e as CustomEvent<number>).detail);
    window.addEventListener(LEAF_ACTIVE, onActive);
    return () => window.removeEventListener(LEAF_ACTIVE, onActive);
  }, []);

  const goto = useCallback((i: number) => {
    window.dispatchEvent(new CustomEvent<number>(BOOK_GOTO, { detail: i }));
  }, []);

  // Close first, then turn: the panel's exit and a scrubbed page turn running
  // together read as two things happening to the reader at once.
  const jump = useCallback(
    (i: number) => {
      setOpen(false);
      window.setTimeout(() => goto(i), 120);
    },
    [goto],
  );

  const ink = INK[Math.min(active, INK.length - 1)];

  useEffect(() => {
    if (!open || !panelRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-panel-item]",
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.06,
          ease: "power3.out",
          clearProps: "opacity,transform",
        },
      );
    }, panelRef);
    return () => ctx.revert();
  }, [open]);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[60]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between gap-4 px-[7vw] py-[2.4vh] sm:px-[6vw]">
          <button
            type="button"
            onClick={() => goto(0)}
            className="t-meta pointer-events-auto -mx-3 cursor-pointer border-0 bg-transparent px-3 py-2 text-left transition-colors duration-500"
            style={{ color: ink.fg, background: ink.plate }}
          >
            {person.name}
          </button>

          {/* Desktop. Tablet and phone get the panel instead: four items in
              this voice need about 620px of rule before they start colliding
              with the name. */}
          <nav aria-label="Sections" className="pointer-events-auto hidden lg:block">
            <ul
              className="flex items-center gap-1 px-1 transition-colors duration-500"
              style={{ background: ink.plate }}
            >
              {SECTIONS.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => goto(i)}
                    aria-current={i === active ? "true" : undefined}
                    className="t-meta cursor-pointer border-0 bg-transparent px-4 py-3 transition-colors duration-300"
                    style={{ color: i === active ? ink.fg : ink.dim }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="pointer-events-auto -mr-3 flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent px-3 py-2 transition-colors duration-500 lg:hidden"
            style={{ color: ink.fg, background: ink.plate }}
          >
            <List size={22} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose>
          <div
            ref={panelRef}
            className="flex min-h-full flex-col px-[7vw] py-[3vh] sm:px-[6vw]"
            style={{ background: "var(--color-bark)" }}
          >
            <DialogTitle className="sr-only">Menu</DialogTitle>

            <div className="flex items-center justify-between gap-4">
              <p className="t-meta" style={{ color: "var(--color-moss-lit)" }}>
                {person.name}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="-mr-3 flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent px-3 py-2"
                style={{ color: "var(--color-butter)" }}
              >
                <X size={22} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <ul className="flex flex-1 flex-col justify-center gap-2 py-[6vh]">
              {SECTIONS.map((s, i) => (
                <li key={s} data-panel-item>
                  <button
                    type="button"
                    onClick={() => jump(i)}
                    aria-current={i === active ? "true" : undefined}
                    className="t-lead flex w-full cursor-pointer items-baseline gap-5 border-0 bg-transparent py-4 text-left text-[clamp(2.2rem,11vw,3.4rem)]"
                    style={{
                      color:
                        i === active
                          ? "var(--color-ember)"
                          : "var(--color-butter)",
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>

            <p className="t-meta" style={{ color: "var(--color-moss-lit)" }}>
              {person.place}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
