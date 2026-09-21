"use client";

import { useEffect, useRef } from "react";

/**
 * Voronoi, following the Paper.js example's geometry.
 *
 * The sites are a bee-hive grid loosened with jitter, one cell roughly every
 * 200px, so the mesh is an irregular honeycomb rather than random scatter.
 * Each cell is drawn through the midpoints of its edges with handles set to
 * half the edge vector, which is what rounds the hard Voronoi polygon into
 * an organic shape, then scaled to 0.95 so the cells sit apart with a gap
 * between them.
 *
 * One extra site tracks the pointer, so a cell forms under the cursor and
 * the honeycomb opens around it. That listener is on the window, not the
 * canvas, so it keeps responding no matter which page element is in front.
 *
 * d3-delaunay supplies the diagram; the original used rhill's Voronoi.
 */

type Props = {
  /** Target cell size in px. The example uses 200. */
  cell?: number;
  opacity?: number;
  stroke?: string;
  accent?: string;
  className?: string;
};

export default function Voronoi({
  cell = 200,
  opacity = 0.3,
  stroke = "#6f6f52",
  accent = "#c94c38",
  className = "",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef<{ x: number; y: number; on: boolean }>({
    x: 0,
    y: 0,
    on: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

      const MARGIN = 20;
      let w = scope.view.size.width;
      let h = scope.view.size.height;
      let hive: [number, number][] = [];

      /** The example's generateBeeHivePoints, loose. */
      const buildHive = () => {
        w = scope.view.size.width;
        h = scope.view.size.height;
        const cols = Math.max(2, Math.round(w / cell));
        const rows = Math.max(2, Math.round(h / cell));
        const cw = w / cols;
        const ch = h / rows;
        const pts: [number, number][] = [];
        // Deterministic jitter, so the sheet does not reshuffle on resize.
        let s = 0x2545f2b1;
        const rnd = () => {
          s ^= s << 13;
          s ^= s >>> 17;
          s ^= s << 5;
          return ((s >>> 0) % 100000) / 100000;
        };
        for (let i = -1; i < cols + 1; i++) {
          for (let j = -1; j < rows + 1; j++) {
            let x = i * cw + cw / 2;
            let y = j * ch + ch / 2;
            if (j % 2) x += cw / 2;
            x += (cw / 4) * rnd() - cw / 4;
            y += (ch / 4) * rnd() - ch / 4;
            pts.push([x, y]);
          }
        }
        hive = pts;
      };

      /**
       * The example's createPath: ride the edge midpoints with handles of
       * half the edge vector. That is what makes a hard cell read as a soft
       * one.
       */
      const cellPath = (poly: [number, number][], i: number) => {
        const path = new scope.Path({ closed: true });
        for (let k = 0; k < poly.length; k++) {
          const p = new scope.Point(poly[k][0], poly[k][1]);
          const n = new scope.Point(
            poly[(k + 1) % poly.length][0],
            poly[(k + 1) % poly.length][1],
          );
          const v = n.subtract(p).divide(2);
          path.add(
            new scope.Segment(p.add(v), v.multiply(-1), v),
          );
        }

        // removeSmallBits: drop segments that barely travel.
        const min = path.length / 50;
        for (let k = path.segments.length - 1; k >= 0; k--) {
          const seg = path.segments[k];
          const next = seg.next;
          if (!next) continue;
          if (seg.point.getDistance(next.point.add(next.handleIn)) < min) {
            seg.remove();
          }
        }
        if (path.segments.length < 3) {
          path.remove();
          return null;
        }

        path.scale(0.95);
        path.strokeColor = new scope.Color(i % 7 === 0 ? accent : stroke);
        path.strokeWidth = i % 5 === 0 ? 1.5 : 1;
        path.strokeJoin = "round";
        path.opacity = i % 7 === 0 ? 0.65 : 1;
        return path;
      };

      const group = new scope.Group();

      const render = () => {
        const sites = hive.slice();
        if (pointer.current.on) sites.push([pointer.current.x, pointer.current.y]);

        const voronoi = Delaunay.from(sites).voronoi([
          MARGIN,
          MARGIN,
          Math.max(MARGIN + 1, w - MARGIN),
          Math.max(MARGIN + 1, h - MARGIN),
        ]);

        group.removeChildren();
        for (let i = 0; i < sites.length; i++) {
          const poly = voronoi.cellPolygon(i) as [number, number][] | null;
          if (!poly || poly.length < 3) continue;
          const p = cellPath(poly, i);
          if (p) group.addChild(p);
        }
        scope.view.update();
      };

      buildHive();
      render();

      // Window-level, so nothing painted on top can swallow the hover.
      const onPointer = (e: PointerEvent) => {
        const r = canvasRef.current?.getBoundingClientRect();
        if (!r || r.width < 2) return;
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        pointer.current = {
          x,
          y,
          on: x > -80 && y > -80 && x < r.width + 80 && y < r.height + 80,
        };
        render();
      };

      const onResize = () => {
        buildHive();
        render();
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
  }, [cell, stroke, accent]);

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
