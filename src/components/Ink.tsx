"use client";

import { useEffect, useRef, useState } from "react";
import { CSS } from "@/lib/palette";

type Variant = "frame" | "underline" | "rule" | "bracket" | "blob" | "tick";

type InkProps = {
  variant?: Variant;
  color?: string;
  /** Rough.js roughness. Low is a steady hand, high is a cold morning. */
  wobble?: number;
  strokeWidth?: number;
  /** Fixed seed keeps the same line across re-renders and resizes. */
  seed?: number;
  fill?: string;
  className?: string;
  opacity?: number;
  /** Inset from the host box so the overshoot at corners stays visible. */
  pad?: number;
};

/**
 * A pen-and-ink stroke sized to whatever it is placed inside.
 * Absolutely positioned, never intercepts a pointer, redraws on resize.
 */
export default function Ink({
  variant = "frame",
  color = CSS.sage,
  wobble = 1.9,
  strokeWidth = 1.15,
  seed = 42,
  fill,
  className = "",
  opacity = 1,
  pad = 4,
}: InkProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) =>
        Math.abs(prev.w - width) < 1 && Math.abs(prev.h - height) < 1
          ? prev
          : { w: width, h: height },
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || box.w < 2 || box.h < 2) return;

    let cancelled = false;
    (async () => {
      const rough = (await import("roughjs")).default;
      if (cancelled || !svgRef.current) return;

      const target = svgRef.current;
      while (target.firstChild) target.removeChild(target.firstChild);

      const rc = rough.svg(target);
      const w = box.w;
      const h = box.h;
      const p = pad;

      const base = {
        stroke: color,
        strokeWidth,
        roughness: wobble,
        bowing: 2.1,
        seed,
      } as const;

      const nodes: SVGGElement[] = [];

      if (variant === "frame") {
        // Corners wander a little, the way a ruled box never quite is one.
        const j = (n: number) => ((((seed * (n + 7)) % 13) / 13) - 0.5) * 5.5;
        const d = [
          `M ${p + j(1)} ${p + j(2)}`,
          `L ${w - p + j(3)} ${p + j(4)}`,
          `L ${w - p + j(5)} ${h - p + j(6)}`,
          `L ${p + j(7)} ${h - p + j(8)}`,
          `Z`,
        ].join(" ");
        nodes.push(
          rc.path(d, {
            ...base,
            fill,
            fillStyle: "solid",
          }) as SVGGElement,
        );
        // A second, lighter pass, offset: the ink went round twice.
        nodes.push(
          rc.path(d, {
            ...base,
            seed: seed + 91,
            roughness: wobble * 1.35,
            strokeWidth: strokeWidth * 0.55,
          }) as SVGGElement,
        );
      }

      if (variant === "underline") {
        // One pass, low bowing. Two bowed strokes meeting at both ends read
        // as a closed lens rather than as a line drawn by a hand.
        const y = h / 2;
        nodes.push(
          rc.line(p, y, w - p, y + 1.2, {
            ...base,
            roughness: Math.min(wobble * 0.55, 1.1),
            bowing: 0.7,
            disableMultiStroke: true,
          }) as SVGGElement,
        );
        // A short lift-off tick, the way a pen leaves the paper.
        nodes.push(
          rc.line(w - p - w * 0.16, y + 3.4, w - p - w * 0.02, y + 2.6, {
            ...base,
            seed: seed + 17,
            strokeWidth: strokeWidth * 0.5,
            roughness: 0.8,
            bowing: 0.6,
            disableMultiStroke: true,
          }) as SVGGElement,
        );
      }

      if (variant === "rule") {
        // A divider with a knot in the middle, the way chapters part.
        const y = h / 2;
        const mid = w / 2;
        nodes.push(
          rc.line(p, y, mid - 18, y + 1, {
            ...base,
            roughness: Math.min(wobble * 0.6, 1.2),
            bowing: 0.8,
            disableMultiStroke: true,
          }) as SVGGElement,
        );
        nodes.push(
          rc.line(mid + 18, y + 1, w - p, y, {
            ...base,
            seed: seed + 5,
            roughness: Math.min(wobble * 0.6, 1.2),
            bowing: 0.8,
            disableMultiStroke: true,
          }) as SVGGElement,
        );
        nodes.push(
          rc.circle(mid, y, 9, {
            ...base,
            fill: color,
            fillStyle: "solid",
            fillWeight: 1,
            roughness: 1.1,
            bowing: 1,
          }) as SVGGElement,
        );
      }

      if (variant === "bracket") {
        const arm = Math.min(w, h) * 0.32;
        const corner = (x: number, y: number, dx: number, dy: number, s: number) => {
          nodes.push(
            rc.line(x, y, x + dx * arm, y, { ...base, seed: seed + s }) as SVGGElement,
          );
          nodes.push(
            rc.line(x, y, x, y + dy * arm, {
              ...base,
              seed: seed + s + 3,
            }) as SVGGElement,
          );
        };
        corner(p, p, 1, 1, 0);
        corner(w - p, p, -1, 1, 11);
        corner(p, h - p, 1, -1, 22);
        corner(w - p, h - p, -1, -1, 33);
      }

      if (variant === "blob") {
        nodes.push(
          rc.ellipse(w / 2, h / 2, w - p * 2, h - p * 2, {
            ...base,
            fill: fill ?? color,
            fillStyle: "zigzag",
            hachureGap: 4.5,
            fillWeight: 1.1,
            roughness: wobble * 1.2,
          }) as SVGGElement,
        );
      }

      if (variant === "tick") {
        // The little hand-inked mark that sits beside a list item.
        nodes.push(
          rc.line(p, h * 0.55, w * 0.42, h - p, {
            ...base,
            roughness: wobble * 1.2,
          }) as SVGGElement,
        );
        nodes.push(
          rc.line(w * 0.42, h - p, w - p, p, {
            ...base,
            seed: seed + 13,
            roughness: wobble * 1.2,
          }) as SVGGElement,
        );
      }

      nodes.forEach((n) => target.appendChild(n));
    })();

    return () => {
      cancelled = true;
    };
  }, [box.w, box.h, variant, color, wobble, strokeWidth, seed, fill, pad]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ opacity }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${Math.max(box.w, 1)} ${Math.max(box.h, 1)}`}
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
      />
    </div>
  );
}
