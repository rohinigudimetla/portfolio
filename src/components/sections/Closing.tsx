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
import Endpapers from "../Endpapers";
import Ink from "../Ink";
import InkButton from "../InkButton";
import { person, schooling, colophon } from "@/content/book";
import { CSS, type Tone } from "@/lib/palette";
import { spillFromElement } from "@/lib/wash";

type IconType = ComponentType<{ size?: number; weight?: "regular"; "aria-hidden"?: boolean }>;

function Contact({
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
      onPointerEnter={() => spillFromElement(ref.current, tone, 0.6)}
      onFocus={() => spillFromElement(ref.current, tone, 0.6)}
      className="inline-flex items-center gap-2.5 text-[1rem] no-underline
                 transition-colors duration-200 hover:text-[var(--color-gold-pale)]"
      style={{ color: CSS.cream }}
    >
      <Icon size={18} weight="regular" aria-hidden={true} />
      {label}
    </a>
  );
}

/**
 * The back endpapers. Schooling, every way to reach her, and the note
 * about how the book was made.
 */
export default function Closing() {
  const reduce = useReducedMotion();

  return (
    <section id="hello" className="relative overflow-hidden pt-28 pb-16 sm:pt-36">
      <div className="absolute inset-0 z-0 opacity-[0.4]">
        <Endpapers intensity={0.8} />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #334736 6%, color-mix(in oklab, #334736 72%, transparent) 46%, color-mix(in oklab, #1b211c 55%, transparent) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-x-16 gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="t-heading text-[clamp(1.9rem,4vw,2.7rem)]"
              style={{ color: CSS.cream }}
            >
              Say hello
            </h2>

            <div className="relative mt-4 h-4 w-[min(16rem,60%)]">
              <Ink
                variant="underline"
                color={CSS.terracotta}
                seed={404}
                strokeWidth={1.5}
              />
            </div>

            <div className="mt-9 flex flex-col gap-4">
              <Contact
                href={`mailto:${person.email}`}
                label={person.email}
                Icon={EnvelopeSimple}
                tone="terracotta"
              />
              <Contact
                href={person.phoneHref}
                label={person.phone}
                Icon={Phone}
                tone="gold"
              />
              <Contact
                href={person.linkedin}
                label="linkedin.com/in/rohinigudimetla"
                Icon={LinkedinLogo}
                tone="roseDust"
              />
              <Contact
                href={person.github}
                label="github.com/rohinigudimetla"
                Icon={GithubLogo}
                tone="sage"
              />
              <Contact
                href={person.resume}
                label="The resume, as a PDF"
                Icon={DownloadSimple}
                tone="goldPale"
                download
              />
            </div>

            <div className="mt-10">
              <InkButton
                href={`mailto:${person.email}`}
                weight="primary"
                tone="terracotta"
              >
                Send an email
              </InkButton>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="t-heading text-[1.6rem]" style={{ color: CSS.cream }}>
              Schooling
            </h2>

            <div className="mt-8 flex flex-col gap-9">
              {schooling.map((s, i) => (
                <div key={s.school}>
                  <p className="t-hand text-[1.28rem]" style={{ color: CSS.gold }}>
                    {s.when}
                  </p>
                  <h3
                    className="t-heading mt-1.5 text-[1.18rem]"
                    style={{ color: CSS.cream }}
                  >
                    {s.school}
                  </h3>
                  <p className="mt-1 text-[0.95rem]" style={{ color: CSS.sage }}>
                    {s.award}
                  </p>
                  <p className="mt-0.5 text-[0.88rem]" style={{ color: CSS.creamDim }}>
                    {s.where}
                  </p>
                  {i === 0 && (
                    <div className="relative mt-8 h-3 w-24">
                      <Ink
                        variant="underline"
                        color={CSS.forestMist}
                        seed={912}
                        strokeWidth={0.9}
                        wobble={2.5}
                        pad={0}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative mt-24 h-5 w-full">
          <Ink variant="rule" color={CSS.forestMist} seed={1201} strokeWidth={0.9} />
        </div>

        <p
          className="t-body mx-auto mt-10 max-w-[38rem] text-center text-[0.87rem]"
          style={{ color: CSS.sage }}
        >
          {colophon}
        </p>
      </div>
    </section>
  );
}
