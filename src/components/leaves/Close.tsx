"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  EnvelopeSimple,
  Phone,
  LinkedinLogo,
  GithubLogo,
  DownloadSimple,
} from "@phosphor-icons/react";
import { useRef, type ComponentType } from "react";
import Voronoi from "../Voronoi";
import Bloom from "../Bloom";
import Ink from "../Ink";
import { CSS, type Tone } from "@/lib/palette";
import { person, tools, schooling } from "@/content/book";
import { spillFromElement } from "@/lib/wash";

type IconType = ComponentType<{ size?: number; weight?: "regular" }>;

function Line({
  href,
  label,
  Icon,
  tone,
  download = false,
}: {
  href: string;
  label: string;
  Icon: IconType;
  tone: Tone;
  download?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const external = href.startsWith("http");
  return (
    <a
      ref={ref}
      href={href}
      {...(download ? { download: "" } : {})}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      onPointerEnter={() => spillFromElement(ref.current, tone, 0.55)}
      onFocus={() => spillFromElement(ref.current, tone, 0.55)}
      className="inline-flex items-center gap-3 text-[0.97rem] no-underline transition-colors duration-200 hover:text-[var(--color-gold-pale)]"
      style={{ color: CSS.cream }}
    >
      <Icon size={17} weight="regular" />
      {label}
    </a>
  );
}

/** Last page. Where to find her, and the one file a recruiter wants. */
export default function Close() {
  const reduce = useReducedMotion();

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: {
            duration: 0.85,
            delay,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <div className="relative h-full w-full overflow-y-auto">
      <Voronoi cells={38} opacity={0.13} />
      <Bloom />

      <div className="relative z-10 flex min-h-full w-full items-center px-7 py-16 sm:px-14">
        <div className="mx-auto w-full max-w-[46rem]">
          <motion.h2
            {...rise(0)}
            className="t-display text-[clamp(1.8rem,4.6vw,2.7rem)]"
            style={{ color: CSS.cream }}
          >
            say hello
          </motion.h2>

          <motion.div {...rise(0.08)} className="relative mt-4 h-4 w-40">
            <Ink variant="underline" color={CSS.terracotta} seed={404} strokeWidth={1.4} pad={0} />
          </motion.div>

          <motion.div {...rise(0.16)} className="mt-10 flex flex-col gap-4">
            <Line href={`mailto:${person.email}`} label={person.email} Icon={EnvelopeSimple} tone="terracotta" />
            <Line href={person.phoneHref} label={person.phone} Icon={Phone} tone="gold" />
            <Line href={person.linkedin} label="linkedin.com/in/rohinigudimetla" Icon={LinkedinLogo} tone="roseDust" />
            <Line href={person.github} label="github.com/rohinigudimetla" Icon={GithubLogo} tone="sage" />
            <Line href={person.resume} label="resume, as a PDF" Icon={DownloadSimple} tone="goldPale" download />
          </motion.div>

          <motion.div
            {...rise(0.26)}
            className="mt-16 flex flex-wrap items-baseline gap-x-5 gap-y-2"
          >
            {tools.map((t) => (
              <span key={t} className="text-[0.86rem]" style={{ color: CSS.sage }}>
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div {...rise(0.34)} className="mt-14 flex flex-col gap-5">
            {schooling.map((s) => (
              <div key={s.school} className="flex flex-wrap items-baseline gap-x-4">
                <span className="t-hand text-[1.15rem]" style={{ color: CSS.gold }}>
                  {s.when}
                </span>
                <span className="text-[0.97rem]" style={{ color: CSS.cream }}>
                  {s.school}
                </span>
                <span className="text-[0.86rem]" style={{ color: CSS.sage }}>
                  {s.award}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
