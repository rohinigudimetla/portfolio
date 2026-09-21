"use client";

import { useEffect, useRef } from "react";
import { CSS } from "@/lib/palette";

/**
 * Marbled endpapers, the sheet glued inside a book's cover.
 *
 * Drawn with Paper.js as combed bands: parallel ribbons of colour pulled
 * through each other. The pointer acts as the comb, so the bands part
 * around it and drift back when it leaves. Stroked polylines rather than
 * filled shapes, which keeps the per-frame point count honest.
 */

const BANDS = [
  CSS.forestDeep,
  CSS.forest,
  CSS.forestMist,
  CSS.clay,
  CSS.forestLit,
  CSS.gold,
  CSS.forest,
  CSS.terracotta,
  CSS.forestMist,
  CSS.forestDeep,
  CSS.sage,
  CSS.forestLit,
  CSS.clay,
  CSS.forest,
  CSS.goldPale,
  CSS.forestDeep,
];

type Props = {
  /** How loud the sheet is. The hero can afford more than the footer. */
  intensity?: number;
  className?: string;
};

export default function Endpapers({ intensity = 1, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: -9999, y: -9999, strength: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const paper = (await import("paper")).default;
      if (disposed || !canvasRef.current) return;

      const scope = new paper.PaperScope();
      scope.setup(canvasRef.current);

      const COLS = 46;
      let bandPaths: paper.Path[] = [];
      let w = scope.view.size.width;
      let h = scope.view.size.height;

      // Each band gets its own phase so the sheet never reads as a sine wave.
      const phases = BANDS.map((_, i) => i * 0.83 + (i % 3) * 1.7);
      const amps = BANDS.map((_, i) => 0.55 + ((i * 7) % 5) * 0.22);

      const build = () => {
        bandPaths.forEach((p) => p.remove());
        bandPaths = [];
        w = scope.view.size.width;
        h = scope.view.size.height;

        const gap = h / (BANDS.length - 1);

        BANDS.forEach((color, i) => {
          const segments: paper.Point[] = [];
          for (let c = 0; c < COLS; c++) {
            const x = (c / (COLS - 1)) * w;
            segments.push(new scope.Point(x, i * gap));
          }
          const path = new scope.Path({
            segments,
            strokeColor: color,
            strokeWidth: gap * 1.5,
            strokeCap: "round",
            strokeJoin: "round",
          });
          path.opacity = (i % 4 === 3 ? 0.4 : 0.72) * intensity;
          path.blendMode = i % 5 === 0 ? "multiply" : "normal";
          bandPaths.push(path);
        });
      };

      build();

      const render = (time: number) => {
        const gap = h / (BANDS.length - 1);
        const p = pointer.current;

        bandPaths.forEach((path, i) => {
          const phase = phases[i];
          const amp = amps[i] * gap * 0.62 * intensity;
          const restY = i * gap;

          for (let c = 0; c < COLS; c++) {
            const seg = path.segments[c];
            const x = (c / (COLS - 1)) * w;

            // Two slow waves crossing, which is what combing actually leaves.
            let y =
              restY +
              Math.sin(x * 0.0072 + phase + time * 0.00022) * amp +
              Math.sin(x * 0.0169 - phase * 1.4 + time * 0.00037) * amp * 0.42;

            // The comb: bands bow away from the pointer and close behind it.
            if (p.strength > 0.001) {
              const dx = x - p.x;
              const dy = restY - p.y;
              const d2 = dx * dx + dy * dy;
              const reach = 210;
              if (d2 < reach * reach) {
                const d = Math.sqrt(d2) || 1;
                const push = (1 - d / reach) ** 2 * 62 * p.strength;
                y += (dy / d) * push;
              }
            }

            seg.point.x = x;
            seg.point.y = y;
          }
          path.smooth({ type: "continuous" });
        });
      };

      if (reduce) {
        render(0);
      } else {
        let t = 0;
        scope.view.onFrame = (event: { delta: number }) => {
          t += event.delta * 1000;
          // The comb's influence fades once the pointer stops visiting.
          pointer.current.strength *= 0.94;
          render(t);
        };
      }

      const onPointer = (e: PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointer.current.x = e.clientX - rect.left;
        pointer.current.y = e.clientY - rect.top;
        pointer.current.strength = 1;
      };

      const onResize = () => {
        build();
        render(0);
      };

      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("resize", onResize);

      cleanup = () => {
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("resize", onResize);
        scope.view?.remove();
        scope.project?.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-paper-resize="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
