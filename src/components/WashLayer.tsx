"use client";

import { useEffect, useRef } from "react";
import { INK, type Tone } from "@/lib/palette";
import { onWash, type WashEvent } from "@/lib/wash";

/* ------------------------------------------------------------------ *
 * Procedural paper.
 * Two noise fields, one lifting and one darkening, tiled across the
 * viewport. Static on purpose: paper grain that moves reads as film.
 * ------------------------------------------------------------------ */
function makeGrainCanvas(size: number, seed: number, coarse: boolean) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const img = ctx.createImageData(size, size);
  let s = seed >>> 0;
  const rnd = () => {
    // xorshift, so the tile is the same every mount
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };

  for (let i = 0; i < size * size; i++) {
    // Two scales of speckle: fine tooth plus the odd heavier fleck.
    let v = rnd();
    if (coarse) v = v * 0.55 + (rnd() > 0.982 ? 0.45 : 0);
    const level = Math.round(v * 255);
    const o = i * 4;
    img.data[o] = level;
    img.data[o + 1] = level;
    img.data[o + 2] = level;
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // Long fibres, the way pulp lies down in handmade sheets.
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = "#ffffff";
  for (let i = 0; i < size / 3; i++) {
    const y = rnd() * size;
    const len = 18 + rnd() * 70;
    const x = rnd() * size;
    ctx.lineWidth = rnd() * 0.9 + 0.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y + (rnd() - 0.5) * 3, x + len, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return c;
}

/* ------------------------------------------------------------------ *
 * A single blot of watercolour.
 * Irregular rim, mottled middle, pigment gathering at the edge the way
 * it does when a wash dries. Drawn once, tinted per use.
 * ------------------------------------------------------------------ */
function makeWashCanvas(size: number, seed: number) {
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
  const base = size * 0.34;

  // The blot's outline: a circle knocked out of round by a few harmonics.
  const phase = [rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28];
  const amp = [0.13 + rnd() * 0.07, 0.07 + rnd() * 0.05, 0.04, 0.025];
  const radiusAt = (a: number) =>
    base *
    (1 +
      amp[0] * Math.sin(a * 2 + phase[0]) +
      amp[1] * Math.sin(a * 3 + phase[1]) +
      amp[2] * Math.sin(a * 5 + phase[2]) +
      amp[3] * Math.sin(a * 8 + phase[3]));

  const traceBlot = (scale: number, ox: number, oy: number) => {
    ctx.beginPath();
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r = radiusAt(a) * scale;
      const x = cx + ox + Math.cos(a) * r;
      const y = cy + oy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  // Body of the wash: soft in the middle, gone by the rim.
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 1.22);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.72)");
  grad.addColorStop(0.86, "rgba(255,255,255,0.34)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.save();
  traceBlot(1.18, 0, 0);
  ctx.clip();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Mottling: overlapping ghosts of the same shape, offset a little.
  ctx.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 7; i++) {
    ctx.globalAlpha = 0.07 + rnd() * 0.08;
    ctx.fillStyle = "#ffffff";
    traceBlot(0.42 + rnd() * 0.62, (rnd() - 0.5) * base * 0.7, (rnd() - 0.5) * base * 0.7);
    ctx.fill();
  }

  // Edge-darkening: pigment creeping outward and settling on the rim.
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = "#ffffff";
  for (let i = 0; i < 3; i++) {
    ctx.lineWidth = 2.4 + i * 1.6;
    ctx.globalAlpha = 0.26 - i * 0.07;
    traceBlot(1.02 + i * 0.045, 0, 0);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  return c;
}

/* ------------------------------------------------------------------ */

type Blot = {
  damp: import("pixi.js").Sprite;
  pigment: import("pixi.js").Sprite;
  age: number;
  life: number;
  target: number;
  spin: number;
};

export default function WashLayer() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const PIXI = await import("pixi.js");
      if (disposed || !hostRef.current) return;

      const app = new PIXI.Application();
      await app.init({
        backgroundAlpha: 0,
        resizeTo: window,
        antialias: false,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        preference: "webgl",
      });
      if (disposed) {
        app.destroy(true, { children: true });
        return;
      }

      const view = app.canvas as HTMLCanvasElement;
      view.style.position = "fixed";
      view.style.inset = "0";
      view.style.width = "100%";
      view.style.height = "100%";
      view.style.pointerEvents = "none";
      hostRef.current.appendChild(view);

      /* ---- the sheet itself ---- */
      const toothTex = PIXI.Texture.from(makeGrainCanvas(256, 0x9e3779b9, false));
      const fleckTex = PIXI.Texture.from(makeGrainCanvas(512, 0x1f123bb5, true));

      const lift = new PIXI.TilingSprite({
        texture: toothTex,
        width: app.screen.width,
        height: app.screen.height,
      });
      lift.blendMode = "screen";
      lift.alpha = 0.075;
      app.stage.addChild(lift);

      const shade = new PIXI.TilingSprite({
        texture: fleckTex,
        width: app.screen.width,
        height: app.screen.height,
      });
      shade.blendMode = "multiply";
      shade.alpha = 0.3;
      shade.tileScale.set(1.35);
      app.stage.addChild(shade);

      /* ---- old stains, set down once and left alone ---- */
      const washTextures = [0x2545f2b1, 0x77aa31cd, 0x5bd31907, 0x13c9e2af].map(
        (seed) => PIXI.Texture.from(makeWashCanvas(256, seed)),
      );

      const foxing = new PIXI.Container();
      foxing.blendMode = "multiply";
      app.stage.addChild(foxing);

      const placeFoxing = () => {
        foxing.removeChildren();
        const spots = 7;
        for (let i = 0; i < spots; i++) {
          const sp = new PIXI.Sprite(washTextures[i % washTextures.length]);
          sp.anchor.set(0.5);
          sp.x = (0.08 + 0.84 * ((i * 0.37) % 1)) * app.screen.width;
          sp.y = (0.1 + 0.8 * ((i * 0.61) % 1)) * app.screen.height;
          sp.scale.set(2.2 + (i % 3) * 1.4);
          sp.rotation = i * 1.11;
          sp.tint = i % 2 === 0 ? INK.clay : INK.forestDeep;
          sp.alpha = 0.06 + (i % 3) * 0.015;
          foxing.addChild(sp);
        }
      };
      placeFoxing();

      /* ---- live blots ---- */
      const blotLayer = new PIXI.Container();
      app.stage.addChild(blotLayer);
      const blots: Blot[] = [];
      let pick = 0;

      const bloom = (e: WashEvent) => {
        if (blots.length > 14) return;
        const tex = washTextures[pick++ % washTextures.length];
        const reach = Math.max(e.w, e.h * 2.1, 90);

        // The paper darkens where it is wet, under the colour.
        const damp = new PIXI.Sprite(tex);
        damp.anchor.set(0.5);
        damp.blendMode = "multiply";
        damp.tint = INK.char;
        damp.x = e.x;
        damp.y = e.y;
        damp.alpha = 0;
        damp.rotation = Math.random() * Math.PI * 2;

        const pigment = new PIXI.Sprite(tex);
        pigment.anchor.set(0.5);
        pigment.tint = INK[e.tone as Tone] ?? INK.terracotta;
        pigment.x = e.x;
        pigment.y = e.y;
        pigment.alpha = 0;
        pigment.rotation = damp.rotation + 0.4;

        blotLayer.addChild(damp, pigment);
        blots.push({
          damp,
          pigment,
          age: 0,
          life: 1500 + Math.random() * 500,
          target: (reach / 256) * (1.15 + Math.random() * 0.35) * e.strength,
          spin: (Math.random() - 0.5) * 0.28,
        });
      };

      const offWash = onWash(bloom);

      /* ---- the wash spreading, then drying ---- */
      app.ticker.add((ticker) => {
        const dt = ticker.deltaMS;
        for (let i = blots.length - 1; i >= 0; i--) {
          const b = blots[i];
          b.age += dt;
          const t = Math.min(b.age / b.life, 1);

          // Spreads fast while the paper is wet, then barely at all.
          const spread = 1 - Math.pow(1 - t, 3.1);
          // Colour arrives quickly and lifts away slowly.
          const wet = t < 0.13 ? t / 0.13 : Math.pow(1 - (t - 0.13) / 0.87, 1.45);

          const s = 0.44 + spread * b.target;
          b.pigment.scale.set(s);
          b.damp.scale.set(s * 1.16);
          b.pigment.alpha = wet * 0.8;
          b.damp.alpha = wet * 0.46;
          b.pigment.rotation += b.spin * (dt / 1000);

          if (t >= 1) {
            b.pigment.destroy();
            b.damp.destroy();
            blots.splice(i, 1);
          }
        }
      });

      /* ---- resize ---- */
      const onResize = () => {
        lift.width = app.screen.width;
        lift.height = app.screen.height;
        shade.width = app.screen.width;
        shade.height = app.screen.height;
        placeFoxing();
      };
      window.addEventListener("resize", onResize);

      cleanup = () => {
        offWash();
        window.removeEventListener("resize", onResize);
        app.destroy(true, { children: true, texture: true });
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
      className="pointer-events-none fixed inset-0 z-[2]"
    />
  );
}
