"use client";

import { useEffect, useRef } from "react";

/**
 * Voronoi cells, after the Paper.js example.
 *
 * Here they stand in for the cell structure of handmade paper, so they are
 * drawn at very low contrast and left to drift. The seeds wander on slow
 * independent orbits and the diagram is rebuilt each frame; d3-delaunay
 * handles the geometry and Paper.js does the drawing.
 *
 * A pointer passing over pushes the nearest seeds aside, which makes the
 * sheet feel like a surface rather than a backdrop.
 */

type Props = {
  /** Seed count. Fewer, larger cells read better behind text. */
  cells?: number;
  opacity?: number;
  className?: string;
};

export default function Voronoi({
  cells = 46,
  opacity = 0.16,
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [{ default: paper }, { Delaunay }] = await Promise.all([
        import("paper"),
        import("d3-delaunay"),
      ]);
      if (disposed || !canvasRef.current) return;

      const scope = new paper.PaperScope();
      scope.setup(canvasRef.current);

      let w = scope.view.size.width;
      let h = scope.view.size.height;

      // Seeds, each with its own drift so the mesh never pulses in step.
      const seeds = Array.from({ length: cells }, (_, i) => {
        const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) + 1) / 2) % 1;
        return {
          hx: r(1),
          hy: r(2),
          phase: r(3) * Math.PI * 2,
          speed: 0.08 + r(4) * 0.16,
          radius: 0.012 + r(5) * 0.03,
          ox: 0,
          oy: 0,
        };
      });

      const group = new scope.Group();
      const stroke = new scope.Color("#7e8a70");
      const warm = new scope.Color("#e3655b");

      const draw = (time: number) => {
        const pts: [number, number][] = seeds.map((s) => {
          const t = time * 0.001 * s.speed + s.phase;
          let x = (s.hx + Math.cos(t) * s.radius) * w;
          let y = (s.hy + Math.sin(t * 1.3) * s.radius) * h;

          // Seeds drift away from the pointer, so cells open around it.
          const dx = x - pointer.current.x;
          const dy = y - pointer.current.y;
          const d2 = dx * dx + dy * dy;
          const reach = 190;
          if (d2 < reach * reach) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / reach) ** 2 * 58;
            x += (dx / d) * push;
            y += (dy / d) * push;
          }
          return [x, y];
        });

        const delaunay = Delaunay.from(pts);
        const voronoi = delaunay.voronoi([0, 0, w, h]);

        group.removeChildren();
        for (let i = 0; i < pts.length; i++) {
          const poly = voronoi.cellPolygon(i);
          if (!poly) continue;
          const path = new scope.Path({ closed: true });
          for (const [px, py] of poly) path.add(new scope.Point(px, py));
          // Cell walls, not a wireframe: thin, soft, mostly sage with the
          // occasional warm one so the mesh is not one flat tone.
          path.strokeColor = i % 7 === 0 ? warm : stroke;
          path.strokeWidth = i % 5 === 0 ? 0.9 : 0.55;
          path.opacity = i % 7 === 0 ? 0.5 : 0.85;
          group.addChild(path);
        }
      };

      if (reduce) {
        draw(0);
      } else {
        let t = 0;
        scope.view.onFrame = (event: { delta: number }) => {
          t += event.delta * 1000;
          draw(t);
        };
      }

      const onPointer = (e: PointerEvent) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointer.current.x = e.clientX - rect.left;
        pointer.current.y = e.clientY - rect.top;
      };

      const onResize = () => {
        w = scope.view.size.width;
        h = scope.view.size.height;
        draw(0);
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
  }, [cells]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-paper-resize="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}
