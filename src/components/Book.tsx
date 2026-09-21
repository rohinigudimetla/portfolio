"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/**
 * The book.
 *
 * Every leaf is stacked in the same place and pinned to the viewport. As the
 * reader scrolls, the top leaf hinges at its upper edge and swings up and
 * toward them, the way a page lifts when you turn it from the bottom. The
 * leaf beneath is already sitting there, so the turn reveals rather than
 * slides.
 *
 * Scroll distance is one viewport per leaf. The last leaf never turns,
 * because there is nothing behind it.
 */

type LeafProps = {
  index: number;
  total: number;
  progress: MotionValue<number>;
  children: ReactNode;
};

function Leaf({ index, total, progress, children }: LeafProps) {
  const span = 1 / total;
  const start = index * span;
  // The leaf rests for the first part of its span, then turns.
  const lift = start + span * 0.26;
  const end = start + span * 0.94;
  const isLast = index === total - 1;

  const rotateX = useTransform(progress, [lift, end], [0, 96], {
    clamp: true,
  });
  // The sheet rises a little as it goes, so the hinge does not look nailed on.
  const y = useTransform(progress, [lift, end], [0, -40], { clamp: true });
  // Its underside falls into shadow as it comes over.
  const shade = useTransform(progress, [lift, end], [0, 0.5], { clamp: true });
  // A crease of light runs along the lifting edge.
  const crease = useTransform(
    progress,
    [lift, lift + (end - lift) * 0.45, end],
    [0, 0.5, 0],
    { clamp: true },
  );
  // Once it is past a few degrees it stops taking clicks.
  const pointerEvents = useTransform(rotateX, (r) =>
    r > 4 ? "none" : "auto",
  ) as unknown as MotionValue<"none" | "auto">;

  if (isLast) {
    return (
      <div
        className="absolute inset-0"
        style={{ zIndex: total - index }}
      >
        <div className="absolute inset-2 overflow-hidden sm:inset-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex: total - index,
        rotateX,
        y,
        transformOrigin: "50% 0%",
        transformStyle: "preserve-3d",
        pointerEvents,
        backfaceVisibility: "hidden",
      }}
    >
      <div
        className="absolute inset-2 overflow-hidden sm:inset-4"
        style={{
          background: "var(--color-forest)",
          boxShadow:
            "0 18px 50px -12px rgba(11, 15, 12, 0.72), 0 2px 0 0 rgba(238, 235, 211, 0.04)",
        }}
      >
        {children}

        {/* The page going into shadow as it comes over the reader. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            opacity: shade,
            background:
              "linear-gradient(to top, rgba(11,15,12,0.88) 0%, rgba(11,15,12,0.26) 52%, rgba(11,15,12,0) 92%)",
          }}
        />
        {/* Light catching the edge that is lifting. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40"
          style={{
            opacity: crease,
            background:
              "linear-gradient(to top, rgba(232,201,136,0.5) 0%, rgba(232,201,136,0.12) 40%, transparent 100%)",
          }}
        />
      </div>
    </motion.div>
  );
}

export default function Book({ leaves }: { leaves: ReactNode[] }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // Turning pages is motion. Without it the leaves are simply sections.
  if (reduce) {
    return (
      <div>
        {leaves.map((leaf, i) => (
          <section key={i} className="relative min-h-[100dvh]">
            {leaf}
          </section>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: `${leaves.length * 100}dvh` }}
    >
      <div
        className="sticky top-0 h-[100dvh] w-full overflow-hidden"
        style={{ perspective: "1900px", perspectiveOrigin: "50% 42%" }}
      >
        {leaves.map((leaf, i) => (
          <Leaf
            key={i}
            index={i}
            total={leaves.length}
            progress={scrollYProgress}
          >
            {leaf}
          </Leaf>
        ))}
      </div>
    </div>
  );
}
