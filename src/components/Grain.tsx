"use client";

import { useEffect, useState } from "react";

/**
 * Paper tooth, for a background and nothing else.
 *
 * This used to be one fixed layer blended over the whole page, which put
 * grain across the type and the controls as well as the ground, and forced
 * the compositor to re-blend a full viewport over four transformed leaves
 * on every scroll frame. It now sits inside a leaf, directly above that
 * leaf's flat colour and below everything readable, so it textures the
 * background only and blends against a single flat fill.
 */
export default function Grain({ opacity = 0.34 }: { opacity?: number }) {
  const [tile, setTile] = useState<string | null>(null);

  useEffect(() => {
    const size = 220;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const img = ctx.createImageData(size, size);
    let s = 0x9e3779b9;
    const rnd = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };

    for (let i = 0; i < size * size; i++) {
      const v = rnd() * 0.62 + (rnd() > 0.988 ? 0.38 : 0);
      const level = Math.round(v * 255);
      const o = i * 4;
      img.data[o] = level;
      img.data[o + 1] = level;
      img.data[o + 2] = level;
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = "#ffffff";
    for (let i = 0; i < size / 2.4; i++) {
      const y = rnd() * size;
      const x = rnd() * size;
      const len = 20 + rnd() * 84;
      ctx.lineWidth = rnd() * 0.85 + 0.25;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + len * 0.5, y + (rnd() - 0.5) * 3.2, x + len, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    setTile(c.toDataURL("image/png"));
  }, []);

  if (!tile) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        backgroundImage: `url(${tile})`,
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px",
        mixBlendMode: "overlay",
        opacity,
      }}
    />
  );
}
