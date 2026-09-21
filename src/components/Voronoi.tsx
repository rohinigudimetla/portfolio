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

      const el = canvasRef.current;

      /**
       * Paper's data-paper-resize never picked up the laid-out size here, so
       * the view kept the canvas element default of 300x150 while CSS
       * stretched it across the leaf: cells far too large, strokes blurred by
       * the upscale, and a pointer whose CSS-pixel coordinates addressed a
       * different space entirely.
       *
       * Sizing it once was not enough either. These canvases live inside a
       * pinned, 3D-transformed stage, and on first paint the box can measure
       * zero, which left the diagram empty with nothing to trigger a redraw.
       * The view is therefore synced from the element and retried until the
       * element actually has a size.
       */
      const scope = new paper.PaperScope();
      scope.setup(el);

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
      const cellPath = (ring: [number, number][], i: number) => {
        // d3 returns a closed ring: the last point repeats the first. Feeding
        // that duplicate into the smoothing gives a zero-length edge, whose
        // handles collapse and leave a cusp, which is what turned these
        // cells into tall bulbs.
        const poly =
          ring.length > 1 &&
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, -1)
            : ring;
        if (poly.length < 3) return null;

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
        const min = path.length / 90;
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
        const px = pointer.current.x;
        const py = pointer.current.y;
        const live = pointer.current.on;

        // Sites near the cursor are pushed aside, so the honeycomb opens
        // around it rather than merely gaining one more cell.
        const REACH = 260;
        const sites: [number, number][] = hive.map(([x, y]) => {
          if (!live) return [x, y];
          const dx = x - px;
          const dy = y - py;
          const d = Math.hypot(dx, dy) || 1;
          if (d > REACH) return [x, y];
          const push = (1 - d / REACH) ** 2 * 96;
          return [x + (dx / d) * push, y + (dy / d) * push];
        });
        const cursorIndex = live ? sites.push([px, py]) - 1 : -1;

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
          if (!p) continue;
          if (i === cursorIndex) {
            // The cell under the cursor is inked, so the response is legible.
            p.strokeColor = new scope.Color(accent);
            p.strokeWidth = 2;
            p.opacity = 1;
          }
          group.addChild(p);
        }
        scope.view.update();
      };

      buildHive();
      render();

      // Window-level, so nothing painted on top can swallow the hover.
      let pending = 0;
      const onPointer = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        if (r.width < 2) return;
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        pointer.current = {
          x,
          y,
          on: x > -80 && y > -80 && x < r.width + 80 && y < r.height + 80,
        };
        // pointermove outruns the frame rate; one redraw per frame is plenty.
        if (pending) return;
        pending = requestAnimationFrame(() => {
          pending = 0;
          render();
        });
      };

      let raf = 0;
      const sync = () => {
        const r = el.getBoundingClientRect();
        const nw = Math.round(r.width);
        const nh = Math.round(r.height);
        if (nw < 2 || nh < 2) {
          // Not laid out yet. Try again on the next frame rather than
          // leaving an empty diagram behind.
          raf = requestAnimationFrame(sync);
          return;
        }
        if (nw === scope.view.size.width && nh === scope.view.size.height) return;
        scope.view.viewSize = new scope.Size(nw, nh);
        buildHive();
        render();
      };

      const ro = new ResizeObserver(sync);
      ro.observe(el);
      sync();

      window.addEventListener("pointermove", onPointer, { passive: true });

      cleanup = () => {
        ro.disconnect();
        cancelAnimationFrame(raf);
        cancelAnimationFrame(pending);
        window.removeEventListener("pointermove", onPointer);
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
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      style={{ opacity }}
    />
  );
}
