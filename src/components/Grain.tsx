"use client";

import { useEffect, useState } from "react";

/**
 * Paper.
 *
 * A noise tile computed once in a canvas and repeated across the viewport,
 * with a second pass of long fibres for the direction that pulp lies in.
 * `overlay` rather than `multiply`, because this sits over both the dark
 * ground and the cream one and multiply only works on the light.
 *
 * Fixed and pointer-transparent, so it never joins a scrolling repaint.
 */
export default function Grain() {
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
      // Mostly fine tooth, with the occasional heavier fleck.
      const v = rnd() * 0.62 + (rnd() > 0.988 ? 0.38 : 0);
      const level = Math.round(v * 255);
      const o = i * 4;
      img.data[o] = level;
      img.data[o + 1] = level;
      img.data[o + 2] = level;
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    // Fibres, laid down the way handmade stock pulls.
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
      className="pointer-events-none fixed inset-0 z-[70]"
      style={{
        backgroundImage: `url(${tile})`,
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px",
        mixBlendMode: "overlay",
        opacity: 0.4,
      }}
    />
  );
}
