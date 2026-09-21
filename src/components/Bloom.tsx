"use client";

import { useEffect, useRef } from "react";
import { CSS, type Tone } from "@/lib/palette";
import { onWash, type WashEvent } from "@/lib/wash";

/**
 * Watercolour blooms, drawn inside a single page.
 *
 * Each leaf is an opaque sheet that stacks and rotates, so a page creates
 * its own stacking context and a single shared canvas cannot sit between
 * every page's background and its text. This layer therefore lives inside
 * the leaf, under its content, and ignores any spill whose coordinates fall
 * outside its own box. Plain 2D canvas: a handful of tinted blobs per page
 * does not need a renderer.
 */

type Blot = {
  x: number;
  y: number;
  tone: Tone;
  reach: number;
  strength: number;
  born: number;
  life: number;
  rotation: number;
  variant: number;
};

/** One irregular blot, mottled and edge-darkened the way a wash dries. */
function makeBlob(size: number, seed: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  let s = (seed || 1) >>> 0;
  const rnd = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };

  const cx = size / 2;
  const cy = size / 2;
  const base = size * 0.33;
  const phase = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const amp = [0.14 + rnd() * 0.08, 0.08 + rnd() * 0.05, 0.04];

  const trace = (scale: number, ox: number, oy: number) => {
    ctx.beginPath();
    for (let i = 0; i <= 88; i++) {
      const a = (i / 88) * Math.PI * 2;
      const r =
        base *
        scale *
        (1 +
          amp[0] * Math.sin(a * 2 + phase[0]) +
          amp[1] * Math.sin(a * 3 + phase[1]) +
          amp[2] * Math.sin(a * 5 + phase[2]));
      const x = cx + ox + Math.cos(a) * r;
      const y = cy + oy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 1.2);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.55, "rgba(255,255,255,0.7)");
  g.addColorStop(0.87, "rgba(255,255,255,0.3)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  trace(1.16, 0, 0);
  ctx.clip();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  ctx.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.07 + rnd() * 0.08;
    ctx.fillStyle = "#fff";
    trace(0.45 + rnd() * 0.6, (rnd() - 0.5) * base * 0.7, (rnd() - 0.5) * base * 0.7);
    ctx.fill();
  }
  ctx.strokeStyle = "#fff";
  for (let i = 0; i < 3; i++) {
    ctx.globalAlpha = 0.24 - i * 0.07;
    ctx.lineWidth = 2.4 + i * 1.6;
    trace(1.01 + i * 0.045, 0, 0);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  return c;
}

/** Pre-tint a blob, because 2D canvas has no tint at draw time. */
function tintBlob(blob: HTMLCanvasElement, color: string) {
  const c = document.createElement("canvas");
  c.width = blob.width;
  c.height = blob.height;
  const ctx = c.getContext("2d");
  if (!ctx) return c;
  ctx.drawImage(blob, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

export default function Bloom({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const blobs = [0x2545f2b1, 0x77aa31cd, 0x5bd31907].map((s) => makeBlob(256, s));
    const tinted = new Map<string, HTMLCanvasElement>();
    const tintFor = (v: number, tone: Tone) => {
      const key = `${v}:${tone}`;
      let t = tinted.get(key);
      if (!t) {
        t = tintBlob(blobs[v], CSS[tone] ?? CSS.terracotta);
        tinted.set(key, t);
      }
      return t;
    };

    let blots: Blot[] = [];
    let raf = 0;
    let running = false;
    let pick = 0;

    const size = () => {
      const r = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
    };
    size();

    const frame = () => {
      const now = performance.now();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      blots = blots.filter((b) => now - b.born < b.life);
      for (const b of blots) {
        const t = (now - b.born) / b.life;
        const spread = 1 - Math.pow(1 - t, 3);
        const wet = t < 0.13 ? t / 0.13 : Math.pow(1 - (t - 0.13) / 0.87, 1.5);
        const img = tintFor(b.variant, b.tone);
        const d = (b.reach * (0.5 + spread * 1.5)) * b.strength;
        ctx.save();
        ctx.globalAlpha = wet * 0.55;
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rotation);
        ctx.drawImage(img, -d / 2, -d / 2, d, d);
        ctx.restore();
      }

      if (blots.length) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const off = onWash((e: WashEvent) => {
      const r = host.getBoundingClientRect();
      // Spills belong to whichever page they landed on.
      if (
        r.width < 2 ||
        e.x < r.left - 60 ||
        e.x > r.right + 60 ||
        e.y < r.top - 60 ||
        e.y > r.bottom + 60
      ) {
        return;
      }
      if (blots.length > 10) return;
      blots.push({
        x: e.x - r.left,
        y: e.y - r.top,
        tone: e.tone,
        reach: Math.max(e.w, e.h * 2, 110),
        strength: e.strength,
        born: performance.now(),
        life: 1500 + Math.random() * 500,
        rotation: Math.random() * Math.PI * 2,
        variant: pick++ % blobs.length,
      });
      if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    });

    const ro = new ResizeObserver(size);
    ro.observe(host);

    return () => {
      off();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
