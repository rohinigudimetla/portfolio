"use client";

import { useEffect, useRef } from "react";
import { CSS } from "@/lib/palette";

/**
 * The leaf.
 *
 * When a section arrives, a sheet of paper sweeps across it once: a soft
 * shadow travelling ahead of a bright crease, the way the underside of a
 * page catches light as it goes over. Paper.js draws the curl as a bowed
 * quad with a gradient running along the fold, so the crease bends rather
 * than sliding as a flat band.
 *
 * It fires once per section, on entry, and then gets out of the way.
 */
export default function PageTurn({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const paper = (await import("paper")).default;
      if (disposed || !canvasRef.current) return;

      const scope = new paper.PaperScope();
      scope.setup(canvasRef.current);

      const w = () => scope.view.size.width;
      const h = () => scope.view.size.height;

      const leaf = new scope.Path();
      leaf.closed = true;
      leaf.visible = false;

      const drawAt = (t: number) => {
        const W = w();
        const H = h();

        // The fold travels left to right, overshooting both edges so the
        // sheet is never seen to begin or end inside the section.
        const foldX = -W * 0.35 + t * (W * 1.7);
        // Paper flexes most at the middle of the journey.
        const bow = Math.sin(t * Math.PI) * W * 0.06;
        const width = W * 0.34;

        leaf.removeSegments();
        leaf.add(new scope.Point(foldX - width, -2));
        leaf.add(new scope.Point(foldX, -2));
        // The trailing edge bows, which is the whole tell of a real page.
        leaf.add(
          new scope.Segment(
            new scope.Point(foldX + bow * 0.5, H / 2),
            new scope.Point(0, -H * 0.3),
            new scope.Point(0, H * 0.3),
          ),
        );
        leaf.add(new scope.Point(foldX, H + 2));
        leaf.add(new scope.Point(foldX - width, H + 2));

        leaf.fillColor = new scope.Color({
          gradient: {
            stops: [
              [new scope.Color(CSS.char).set({ alpha: 0 }), 0],
              [new scope.Color(CSS.char).set({ alpha: 0.42 }), 0.55],
              [new scope.Color(CSS.forestLit).set({ alpha: 0.5 }), 0.88],
              [new scope.Color(CSS.goldPale).set({ alpha: 0.28 }), 1],
            ],
          },
          origin: new scope.Point(foldX - width, H / 2),
          destination: new scope.Point(foldX + bow, H / 2),
        } as unknown as paper.Color);
      };

      let raf = 0;
      const run = () => {
        const DURATION = 900;
        const started = performance.now();
        leaf.visible = true;

        const step = (now: number) => {
          const t = Math.min((now - started) / DURATION, 1);
          // Starts quickly as the page is released, settles as it lands.
          const eased = 1 - Math.pow(1 - t, 2.6);
          drawAt(eased);
          scope.view.update();
          if (t < 1) {
            raf = requestAnimationFrame(step);
          } else {
            leaf.visible = false;
            scope.view.update();
          }
        };
        raf = requestAnimationFrame(step);
      };

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              run();
              io.disconnect();
            }
          });
        },
        { threshold: 0.22 },
      );
      io.observe(host);

      cleanup = () => {
        io.disconnect();
        cancelAnimationFrame(raf);
        scope.view?.remove();
        scope.project?.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        data-paper-resize="true"
        className="h-full w-full"
      />
    </div>
  );
}
