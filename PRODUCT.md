# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) with TypeScript and Tailwind v4. Canvas and drawing layers use
Rough.js, Paper.js and PixiJS. All four were named by the user and are binding.

## Users

Primary: engineering recruiters and hiring managers evaluating Rohini Gudimetla for
full-stack roles. They arrive from a resume link or a LinkedIn profile, skim for stack
and shipped evidence, and decide within about a minute.

Secondary: engineers who will read the linked source and the architectural decision
records. The user's framing is "mixed, but recruiters decide" - the page must survive a
fast skim and still reward a slow read.

## Product Purpose

A single-page portfolio that presents Rohini's work as a developer. Success is a
recruiter leaving with her stack, two work engagements, one deep project, and a way to
contact her, plus enough personality that the page is remembered against the other
portfolios seen that day.

## Positioning

The evidence is unusually specific for an early-career portfolio: a production system
with sixteen architectural decision records, a Kubernetes deploy pipeline that replaced
a manual twelve-step SSH sequence, and security work guided by an OWASP Top 10 audit.
The differentiator is documented reasoning, not volume of projects.

## Operating Context

Read in a browser tab between other candidate tabs, most often on a laptop, sometimes on
a phone from a LinkedIn link. Recruiters frequently want the resume file itself, so the
PDF must be reachable without hunting.

## Capabilities and Constraints

- Single page. No routing, no multi-page book.
- Static content. No backend, no CMS, no forms.
- The site is a portfolio surface only. It is not the Pocket Library product.
- All factual claims come from the supplied resume. Nothing may be invented or inflated.

## Brand Commitments

- Locked palette, user-specified and binding: `#334736` deep forest green as the primary
  background, `#EEEBD3` warm cream as the primary ink, `#E3655B` soft terracotta as the
  accent. Warm earthy supplements are permitted to complete the token set.
- Dark mode only. This is a deliberate single-theme page.
- Aesthetic direction, in the user's words: the inside of a children's book. Cozy, warm,
  approachable, tactile, hand-illustrated. Explicitly not high fashion, not elite, not
  corporate SaaS. Texture is a requirement, not decoration.
- Minimal layout, compensated by interactive animation rather than by density.

## Evidence on Hand

- `Rohini_Gudimetla_Resume_Blueprint.pdf` - the source of every factual claim, shipped to
  `/public` for download.
- Live work: `cher-digi-analytics.vercel.app`, `world-salon.com`, `pocklib.site`.
- Source: `github.com/rohinigudimetla/Pocket-Library`,
  `github.com/rohinigudimetla/cher-digi-analytics`.
- Contact, all approved for publication: email, phone, LinkedIn, GitHub.
- No testimonials, no metrics beyond those stated in the resume, no client logos. None
  may be fabricated to fill a section.

## Product Principles

1. Every claim traces to the resume. The personality lives in the presentation, never in
   the facts.
2. Warmth over polish. If a choice reads as expensive or exclusive, it is wrong for this
   brief.
3. Motion carries the weight that density would otherwise carry, so each animation has to
   earn its place by revealing content or answering a touch.
4. The resume PDF and the contact details stay one gesture away at any scroll position.

## Accessibility & Inclusion

Canvas layers are decorative and must be `aria-hidden` with the page fully readable
without them. All motion collapses under `prefers-reduced-motion`. Cream on forest must
hold WCAG AA at every text size used.
