"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useRef } from "react";
import Ink from "../Ink";
import PageTurn from "../PageTurn";
import { posts } from "@/content/book";
import { CSS } from "@/lib/palette";
import { spillFromElement } from "@/lib/wash";

function OutLink({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onPointerEnter={() => spillFromElement(ref.current, "roseDust", 0.5)}
      onFocus={() => spillFromElement(ref.current, "roseDust", 0.5)}
      className="inline-flex items-center gap-1.5 text-[0.93rem] no-underline
                 transition-colors duration-200 hover:text-[var(--color-gold-pale)]"
      style={{ color: CSS.terracotta }}
    >
      {label}
      <ArrowUpRight size={15} weight="regular" aria-hidden="true" />
    </a>
  );
}

/**
 * A ruled margin running down the page with the two engagements hung off
 * it, the way dates sit in the gutter of a journal.
 */
export default function Work() {
  const reduce = useReducedMotion();

  return (
    <section id="work" className="relative py-28 sm:py-36">
      <PageTurn />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          className="t-heading text-[clamp(1.9rem,4vw,2.7rem)]"
          style={{ color: CSS.cream }}
        >
          Things built for other people
        </h2>

        <div className="relative mt-16 sm:pl-10">
          {/* The rule in the margin, inked rather than ruled. */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-0 hidden w-6 sm:block"
            aria-hidden="true"
          >
            <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 6 100" opacity="0.45">
              <path
                d="M 3 0 C 4.6 18, 1.4 34, 3.2 52 C 4.8 70, 1.6 84, 3 100"
                fill="none"
                stroke={CSS.sage}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-20">
            {posts.map((post, i) => (
              <motion.article
                key={post.place}
                initial={reduce ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.75,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative"
              >
                <p
                  className="t-hand text-[1.3rem]"
                  style={{ color: CSS.gold }}
                >
                  {post.when}
                </p>

                <h3
                  className="t-heading mt-2 text-[1.5rem] sm:text-[1.75rem]"
                  style={{ color: CSS.cream }}
                >
                  {post.place}
                </h3>
                <p
                  className="mt-1 text-[1rem]"
                  style={{ color: CSS.sage }}
                >
                  {post.role}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {post.stack.map((s) => (
                    <span
                      key={s}
                      className="text-[0.87rem]"
                      style={{ color: CSS.creamDim }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex max-w-[44rem] flex-col gap-4">
                  {post.notes.map((note, ni) => (
                    <p
                      key={ni}
                      className="t-body text-[1rem]"
                      style={{ color: CSS.creamDim }}
                    >
                      {note}
                    </p>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-6">
                  {post.links.map((l) => (
                    <OutLink key={l.href} href={l.href} label={l.label} />
                  ))}
                </div>

                {i < posts.length - 1 && (
                  <div className="relative mt-16 h-4 w-full max-w-[30rem]">
                    <Ink
                      variant="rule"
                      color={CSS.forestMist}
                      seed={520 + i * 47}
                      strokeWidth={1}
                      wobble={2.2}
                    />
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
