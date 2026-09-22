"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";
import { BOOK_GOTO, LEAF_ACTIVE } from "@/lib/useLeafReveal";

gsap.registerPlugin(Observer, useGSAP);

/**
 * The book.
 *
 * Leaves stack in one fixed stage. A gesture turns exactly one page: the
 * timeline hinges a leaf at its top edge and swings it up and over, revealing
 * the leaf already sitting underneath.
 *
 * WHY THIS IS NOT DRIVEN BY SCROLL POSITION
 *
 * It was, and the arrangement could not be made to behave. A scrubbed
 * timeline ties the turn to a continuous scroll offset, so the reader can
 * leave the page at any fraction of a turn, and snapping it back afterwards
 * means three mechanisms negotiating one number: the scrub following the
 * scrollbar, the snap tween moving the scrollbar, and the smoother easing
 * the whole document a second behind both. Release mid-turn and they take
 * turns settling, which is the several seconds of hanging half-flipped. Send
 * a large wheel delta and the scroll offset crosses two snap points at once,
 * which is the two pages per gesture. Jump from the nav and the jump lands at
 * a scroll offset the other two are still arguing about.
 *
 * A page turn is a discrete event, so it is modelled as one here. Observer
 * reports a gesture, not an offset: one wheel notch, one swipe, one key. The
 * timeline plays from the page it is on to the next and nothing else reads or
 * writes a scroll position. There is no fraction of a turn to be stranded at,
 * no second mechanism to disagree with, and a jump to any leaf is the same
 * tween with a further destination.
 */
export default function Book({ leaves }: { leaves: ReactNode[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const gotoRef = useRef<((i: number) => void) | null>(null);
  const total = leaves.length;
  const [index, setIndex] = useState(0);

  /**
   * Reduced motion gets a plain document instead of a stage: the same leaves,
   * one after another, scrolled normally. Skipping only the animation used to
   * leave four absolutely positioned leaves stacked on one square of screen
   * with the first on top, so the rest were unreachable.
   *
   * null until the client has been asked, so the stage is never built for a
   * reader who is about to be handed the flat document instead.
   */
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

  // Nothing behind the stage scrolls while the book is turning.
  useEffect(() => {
    if (flat || reduced === null) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [flat, reduced]);

  useGSAP(
    () => {
      if (reduced === null) return;

      if (flat) {
        gotoRef.current = (i) => {
          const el = document.querySelectorAll("[data-leaf]")[i];
          el?.scrollIntoView({ behavior: "auto", block: "start" });
          setIndex(i);
          window.dispatchEvent(
            new CustomEvent<number>(LEAF_ACTIVE, { detail: i }),
          );
        };
        return;
      }

      const sheets = gsap.utils.toArray<HTMLElement>("[data-leaf]");
      const shades = gsap.utils.toArray<HTMLElement>("[data-leaf-shade]");
      const turns = sheets.length - 1;
      if (turns < 1) return;

      gsap.set(sheets, {
        transformOrigin: "50% 0%",
        transformStyle: "preserve-3d",
      });

      // One unit of timeline time per turn, so a leaf index is a timeline
      // position and the whole book is addressable by a single number.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      sheets.forEach((sheet, i) => {
        if (i === turns) return;
        tl.to(sheet, { rotateX: 94, duration: 1, ease: "power2.in" }, i)
          .to(sheet, { y: -55, duration: 1 }, i)
          .to(shades[i], { opacity: 1, duration: 1 }, i);
      });

      let at = 0;
      let announced = 0;
      let busy = false;
      let seq = 0;

      const announce = (i: number) => {
        if (i === announced) return;
        announced = i;
        setIndex(i);
        window.dispatchEvent(new CustomEvent<number>(LEAF_ACTIVE, { detail: i }));
      };

      /**
       * force is what separates a nav click from a gesture.
       *
       * A gesture arriving mid-turn is dropped, or a trackpad's tail would
       * queue up turns the reader did not ask for. A nav click is a
       * destination, not a nudge, so it retargets the running tween instead:
       * dropping those was why the nav did nothing whenever the book happened
       * to be moving, and contact — the furthest jump, so the one most often
       * asked for while something else was still settling — appeared not to
       * work at all.
       */
      const turnTo = (target: number, force = false) => {
        const i = gsap.utils.clamp(0, turns, Math.round(target));
        if (busy && !force) return false;
        const from = tl.time();
        // Already there: a gesture onward from the last page, or back from
        // the first. Reported so the caller does not disarm itself waiting
        // for a turn that never starts.
        if (Math.abs(from - i) < 0.001) return false;

        const steps = Math.max(1, Math.abs(i - from));
        const token = ++seq;
        busy = true;
        // The destination counts as where the book is from here on, so the
        // next gesture continues from the page being turned to.
        at = i;

        gsap.to(tl, {
          time: i,
          // One turn is brisk; a jump across the book is longer, but not
          // proportionally, or reaching contact from the first page would
          // take three times as long as anyone waits.
          duration: 0.85 + (steps - 1) * 0.28,
          ease: "power2.inOut",
          overwrite: true,
          // The leaf underneath becomes the one being read at the halfway
          // point of the turn, which is when the nav takes its ink and the
          // incoming page starts its entrance.
          onUpdate: () => announce(Math.round(tl.time())),
          onComplete: () => {
            if (token !== seq) return;
            busy = false;
            announce(i);
            scheduleRearm();
          },
        });
        return true;
      };

      gotoRef.current = (i: number) => turnTo(i, true);

      /**
       * A gesture has to END before the book will take another one.
       *
       * "Is a turn running" is not enough of a guard on its own. A wheel or a
       * trackpad does not deliver one event per gesture, it delivers a stream,
       * and a flick keeps delivering through its momentum for some time after
       * the fingers have left. So a single push would turn one page, and then
       * the tail of that same push — still arriving, now that the tween had
       * finished — would turn another, and sometimes a third. The longer the
       * gesture, the longer the tail, which is exactly the "a tiny bit longer
       * and it does two or three" shape of it.
       *
       * Observer reports the end of a gesture as well as its start, so the
       * book re-arms only when the stream has actually gone quiet AND the turn
       * it started has landed. One push is one page however hard it is thrown.
       */
      /**
       * One push is one page, however hard it is thrown.
       *
       * A wheel or trackpad does not deliver one event per gesture. It
       * delivers a stream, and a flick keeps delivering through its momentum
       * long after the fingers have left, so guarding only on "a turn is
       * running" lets the tail of one push start a second and third turn the
       * moment each turn lands. Observer's own onStop is no help here: for a
       * wheel it fires every couple of hundred milliseconds *during* a
       * continuous stream, not at the end of one, so re-arming on it re-arms
       * mid-flick.
       *
       * The gap between events is the honest signal, so it is measured
       * directly. The book re-arms only once the turn has landed and no
       * input has arrived for a while.
       */
      /**
       * One push is one page, and the book is never dead.
       *
       * A wheel or trackpad delivers a stream, not an event, and a flick keeps
       * delivering through its momentum after the fingers have left. Guarding
       * only on "a turn is running" lets the tail of one push start the next
       * turn the moment the first lands, which turned two and three pages on a
       * long throw. Observer's own onStop is no help: for a wheel it fires
       * every couple of hundred milliseconds *during* a continuous stream
       * rather than at the end of one.
       *
       * Waiting for a gap in the stream fixes the flick and breaks the
       * opposite case, because someone scrolling steadily never produces a
       * gap: the book went dead for as long as they kept scrolling, which of
       * course made them scroll more. So there are three ways back in, and
       * each answers a different input:
       *
       *   A finger has a definite end. Between touchstart and touchend the
       *   book stays shut however long and slow the drag is, and the lift
       *   opens it. No heuristic can beat knowing.
       *
       *   A mouse notch is a separate intent, and it arrives as one event
       *   with a gap in front of it and its full size. Momentum arrives every
       *   frame and fades. An event with both room in front of it and its
       *   stream's full weight behind it is a new push, so it is honoured at
       *   once and a spun wheel keeps turning pages.
       *
       *   Otherwise the stream has to go quiet, with a long stop as a floor
       *   under it so nothing can hold the book shut indefinitely.
       */
      const QUIET_MS = 200;
      /** A gap this long in front of an event means a hand did it again. */
      const DISCRETE_MS = 40;
      /** Momentum fades; a fresh push lands near its stream's peak. */
      const FRESH_RATIO = 0.6;
      /** Nothing keeps the book shut longer than this. */
      const CEILING_MS = 2500;

      let armed = true;
      let lastInput = 0;
      let lastWheel = 0;
      let streamPeak = 0;
      let touching = false;
      let armTimer = 0;

      const openUp = () => {
        if (!busy && !touching) armed = true;
      };

      // Passive, and separate from Observer, purely to read the shape of the
      // stream: when each event landed and how hard.
      const onWheelRaw = (e: WheelEvent) => {
        const now = performance.now();
        const gap = now - lastWheel;
        lastWheel = now;
        lastInput = now;

        const mag = Math.abs(e.deltaY);
        if (gap >= QUIET_MS) streamPeak = mag;
        else streamPeak = Math.max(streamPeak, mag);

        if (gap >= DISCRETE_MS && mag >= streamPeak * FRESH_RATIO) openUp();
      };
      const onTouchStart = () => {
        touching = true;
        lastInput = performance.now();
      };
      const onTouchMove = () => {
        lastInput = performance.now();
      };
      const onTouchEnd = () => {
        touching = false;
        lastInput = performance.now();
      };

      window.addEventListener("wheel", onWheelRaw, { passive: true });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", onTouchEnd, { passive: true });

      const scheduleRearm = () => {
        window.clearTimeout(armTimer);
        const deadline = performance.now() + CEILING_MS;
        const tick = () => {
          if (busy || touching) {
            armTimer = window.setTimeout(tick, 60);
            return;
          }
          const now = performance.now();
          const gap = now - lastInput;
          if (gap >= QUIET_MS || now >= deadline) {
            armed = true;
            return;
          }
          armTimer = window.setTimeout(
            tick,
            Math.min(QUIET_MS - gap, Math.max(deadline - now, 0)) + 10,
          );
        };
        armTimer = window.setTimeout(tick, 40);
      };

      const fire = (dir: number) => {
        if (!armed || busy) return;
        // Disarm only if a turn actually began. At either end of the book
        // there is nothing to turn to, and disarming for a tween that never
        // runs means nothing ever re-arms it: the book would take one gesture
        // at the last page and then refuse every gesture after it, including
        // the ones trying to come back.
        if (turnTo(at + dir)) armed = false;
      };

      // A dialog owns its own scrolling, and the panel over the book is one.
      const inDialog = (e: Event) =>
        !!(e.target as Element | null)?.closest?.('[role="dialog"]');

      const shared = {
        target: window,
        // Nothing scrolls, so every gesture is a page turn and the browser
        // must not also try to act on it.
        preventDefault: true,
        // Taps and clicks still reach the page under the gesture layer.
        allowClicks: true,
        // Below this a trackpad's drift would turn pages on its own.
        tolerance: 12,
        ignoreCheck: inDialog,
      } as const;

      /**
       * Wheel and drag are split because Observer reports them in opposite
       * senses, which is worth stating plainly since it looks like a mistake:
       * turning a wheel away from you scrolls the page down and fires onDown,
       * while dragging a finger up moves the page's content up and fires
       * onUp. Both of those mean "forward" to a reader. Wired to one pair of
       * callbacks, one of the two inputs always runs backwards.
       */
      const wheel = Observer.create({
        ...shared,
        type: "wheel",
        onDown: () => fire(1),
        onUp: () => fire(-1),
      });

      const drag = Observer.create({
        ...shared,
        type: "touch,pointer",
        onUp: () => fire(1),
        onDown: () => fire(-1),
      });

      const onKey = (e: KeyboardEvent) => {
        if (inDialog(e)) return;
        const k = e.key;
        if (k === "ArrowDown" || k === "PageDown" || k === " ") {
          e.preventDefault();
          turnTo(at + 1);
        } else if (k === "ArrowUp" || k === "PageUp") {
          e.preventDefault();
          turnTo(at - 1);
        } else if (k === "Home") {
          e.preventDefault();
          turnTo(0);
        } else if (k === "End") {
          e.preventDefault();
          turnTo(turns);
        }
      };
      window.addEventListener("keydown", onKey);

      return () => {
        gotoRef.current = null;
        wheel.kill();
        drag.kill();
        window.clearTimeout(armTimer);
        window.removeEventListener("wheel", onWheelRaw);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
        window.removeEventListener("touchcancel", onTouchEnd);
        window.removeEventListener("keydown", onKey);
      };
    },
    { scope: rootRef, dependencies: [total, reduced] },
  );

  const stack = leaves.map((leaf, i) => (
    <div
      key={i}
      data-leaf
      // A leaf that is not the one being read is inert: its links and its
      // project buttons used to stay in the tab order while facing away, so
      // a keyboard reader walked through eight controls they could not see
      // before reaching anything on the page in front of them.
      {...(!flat && i !== index ? { inert: true } : {})}
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

  if (flat) return <div ref={rootRef}>{stack}</div>;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 overflow-hidden"
      style={{ perspective: "2000px", perspectiveOrigin: "50% 38%" }}
    >
      {stack}
    </div>
  );
}
