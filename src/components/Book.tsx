"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import { BOOK_GOTO, LEAF_ACTIVE } from "@/lib/useLeafReveal";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, useGSAP);

/**
 * The book.
 *
 * Leaves stack in one pinned stage. Scrolling scrubs a single timeline that
 * hinges each leaf at its top edge and swings it up and over, revealing the
 * leaf already sitting underneath.
 *
 * Each turn owns exactly one timeline unit, so the rest positions land on
 * clean fractions of progress and ScrollTrigger can snap to them. That snap
 * is the point: released mid-turn, the page finishes the turn or falls back,
 * and never sits half over.
 *
 * The seam between wheel and paper is ScrollSmoother's. A wheel or trackpad
 * delivers scroll in coarse jumps, so a 1:1 scrub turns the page in the same
 * coarse jumps; the smoother interpolates the scroll position itself, which
 * means the turn is driven by a continuous value and every leaf, shade and
 * rotation on the timeline inherits that continuity for free. It is the same
 * mechanism behind the scroll-driven sites this was drawn from, and it is
 * part of GSAP rather than a hand-rolled lerp on top of the scrollbar.
 */
export default function Book({ leaves }: { leaves: ReactNode[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const gotoRef = useRef<((i: number) => void) | null>(null);
  const total = leaves.length;

  /**
   * Reduced motion gets a plain document instead of a stage.
   *
   * Turning this off used to mean skipping the timeline and nothing else,
   * which left four absolutely-positioned leaves stacked on the same square
   * of screen with the first one on top. Work, education and contact were
   * unreachable for anyone who asked the browser to stop animating. They are
   * laid out one after another here instead, which is what the setting is
   * asking for: the same content, without the motion.
   */
  // null until the client has been asked. The stage is built only once the
  // answer is in, so the smoother is never created for a reader who is about
  // to be handed the flat document instead.
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const flat = reduced === true;

  useEffect(() => {
    const onGoto = (e: Event) =>
      gotoRef.current?.((e as CustomEvent<number>).detail);
    window.addEventListener(BOOK_GOTO, onGoto);
    return () => window.removeEventListener(BOOK_GOTO, onGoto);
  }, []);

  useGSAP(
    () => {
      if (reduced === null) return;

      if (flat) {
        // Nav still drives the page, it just moves the window instead of a
        // timeline.
        gotoRef.current = (i) => {
          const el = document.querySelectorAll("[data-leaf]")[i];
          el?.scrollIntoView({ behavior: "auto", block: "start" });
          window.dispatchEvent(
            new CustomEvent<number>(LEAF_ACTIVE, { detail: i }),
          );
        };
        return;
      }

      /**
       * Elements, never selector strings.
       *
       * useGSAP scopes every selector string it is given to the scope
       * element, and these two are ancestors of it, so the strings matched
       * nothing. ScrollSmoother does not complain about that: it quietly
       * builds a wrapper of its own around the body's children instead. The
       * page then had a live wrapper with no styles on it and a smoothed one
       * nobody could see, and re-parenting React's own nodes made React throw
       * removeChild the moment the tree changed underneath it.
       */
      const wrapper = document.querySelector<HTMLElement>("#smooth-wrapper");
      const content = document.querySelector<HTMLElement>("#smooth-content");
      if (!wrapper || !content) return;

      const smoother = ScrollSmoother.create({
        wrapper,
        content,
        // Seconds the content takes to catch up to the real scroll position.
        smooth: 1,
        // Touch already has momentum of its own, and doubling it makes a
        // phone feel like it is dragging.
        smoothTouch: false,
        // Wheel and touch go through GSAP's own handler, which keeps the
        // pinned stage from tearing on mobile and on trackpads that emit
        // large deltas.
        normalizeScroll: true,
        // A phone hiding or showing its address bar changes the viewport
        // height. Without this every one of those counts as a resize and
        // re-measures the pin mid-scroll.
        ignoreMobileResize: true,
      });

      const sheets = gsap.utils.toArray<HTMLElement>("[data-leaf]");
      const shades = gsap.utils.toArray<HTMLElement>("[data-leaf-shade]");
      const turns = sheets.length - 1;
      if (turns < 1) return;
      let active = 0;

      gsap.set(sheets, {
        transformOrigin: "50% 0%",
        transformStyle: "preserve-3d",
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top top",
          end: "bottom bottom",
          // true is 1:1 with the scroll position. The smoothing belongs to
          // ScrollSmoother; a numeric scrub here would add a second lag on
          // top of it and the turn would trail the reader twice over.
          scrub: true,
          pin: stageRef.current,
          // The wrapper already supplies the scroll length, so ScrollTrigger
          // must not add its own spacer on top of it. With the default the
          // document comes out twice as long as intended and every snap
          // point lands on the wrong leaf.
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * turns);
            if (idx !== active) {
              active = idx;
              window.dispatchEvent(
                new CustomEvent<number>(LEAF_ACTIVE, { detail: idx }),
              );
            }
          },
          // One snap point per leaf. Nothing is allowed to rest mid-turn.
          snap: {
            snapTo: 1 / turns,
            // Nearest point, not the next one along. ScrollTrigger's
            // directional default pushes past the leaf you just arrived at.
            directional: false,
            duration: { min: 0.12, max: 0.3 },
            delay: 0.02,
            ease: "power2.out",
          },
        },
      });

      sheets.forEach((sheet, i) => {
        if (i === turns) return;
        tl.to(sheet, { rotateX: 94, duration: 1, ease: "power2.in" }, i)
          .to(sheet, { y: -55, duration: 1 }, i)
          .to(shades[i], { opacity: 1, duration: 1 }, i)
          // Past the halfway point a leaf must stop taking clicks, or it
          // keeps shadowing the page it just revealed.
          .to(sheet, { pointerEvents: "none", duration: 0.01 }, i + 0.5);
      });

      /**
       * Measured at call time from the document, not from the trigger.
       *
       * Reading st.start/st.end was right on a desktop and wrong on a phone:
       * the first jump after load used measurements ScrollTrigger had not
       * settled yet and overshot to the end of the book, while every later
       * jump landed correctly. The book is the whole document, so the leaf
       * stride is simply the scrollable range split between the turns, and
       * that is true whether or not anything has refreshed.
       */
      gotoRef.current = (i) => {
        const y = ScrollTrigger.maxScroll(window) * (i / turns);
        // The smoother is inert on touch by design (smoothTouch: false), and
        // its scrollTo does not move the page in that state.
        if (smoother.smooth()) smoother.scrollTo(y, true);
        else
          gsap.to(window, {
            scrollTo: { y, autoKill: false },
            duration: 0.75,
            ease: "power2.inOut",
            overwrite: true,
          });
      };

      return () => {
        gotoRef.current = null;
        smoother.kill();
      };
    },
    { scope: wrapRef, dependencies: [total, reduced] },
  );

  const stack = leaves.map((leaf, i) => (
    <div
      key={i}
      data-leaf
      // In flow the leaf has no stage to fill, so it is given the height the
      // stage used to hand it; flex-1 on the leaf root inside stops `h-full`
      // resolving against an auto-height parent and collapsing to its text.
      className={
        flat
          ? "relative flex min-h-[100svh] flex-col [&>div]:flex-1"
          : "absolute inset-0"
      }
      style={{
        zIndex: total - i,
        ...(flat
          ? {}
          : {
              backfaceVisibility: "hidden" as const,
              willChange: "transform",
              contain: "paint" as const,
            }),
      }}
    >
      {leaf}
      {!flat && (
        <div
          data-leaf-shade
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50 opacity-0"
          style={{ background: "var(--color-bark)" }}
        />
      )}
    </div>
  ));

  if (flat) return <div ref={wrapRef}>{stack}</div>;

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: `${total * 100}svh` }}
    >
      <div
        ref={stageRef}
        className="relative h-[100svh] w-full overflow-hidden"
        style={{ perspective: "2000px", perspectiveOrigin: "50% 38%" }}
      >
        {stack}
      </div>
    </div>
  );
}
