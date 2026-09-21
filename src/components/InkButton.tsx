"use client";

import { useRef, useState, type ReactNode } from "react";
import Ink from "./Ink";
import { CSS, type Tone } from "@/lib/palette";
import { spillFromElement } from "@/lib/wash";

type Props = {
  href: string;
  children: ReactNode;
  tone?: Tone;
  /** Primary carries the terracotta fill mark. Quiet is outline only. */
  weight?: "primary" | "quiet";
  download?: boolean;
  external?: boolean;
};

/**
 * A link with a hand-inked outline.
 *
 * Two things happen on hover, and both are feedback rather than decoration:
 * the outline is re-drawn with a fresh Rough.js seed, so the line looks
 * inked again rather than lit up, and a watercolour bloom is spilled onto
 * the Pixi layer behind the page at the button's position.
 */
export default function InkButton({
  href,
  children,
  tone = "terracotta",
  weight = "quiet",
  download = false,
  external = false,
}: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 900) + 11);

  const wet = () => {
    setSeed((s) => (s + 137) % 997);
    spillFromElement(ref.current, tone, weight === "primary" ? 1 : 0.72);
  };

  const primary = weight === "primary";

  return (
    <a
      ref={ref}
      href={href}
      {...(download ? { download: "" } : {})}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      onPointerEnter={wet}
      onFocus={wet}
      className="group relative inline-flex items-center gap-2.5 px-6 py-3
                 text-[0.98rem] no-underline transition-transform duration-200
                 ease-out active:translate-y-px"
      style={{ color: primary ? CSS.cream : CSS.cream }}
    >
      <Ink
        variant="frame"
        seed={seed}
        color={primary ? CSS.terracotta : CSS.sage}
        strokeWidth={primary ? 1.7 : 1.15}
        wobble={2.05}
        pad={3}
        {...(primary ? { fill: "rgba(227, 101, 91, 0.17)" } : {})}
      />
      <span className="relative z-10">{children}</span>
    </a>
  );
}
