# Rohini Gudimetla, portfolio

A book you scroll through. Four leaves: a closed cover, a hello, the work,
and where to find her. Each page hinges at its top edge and swings up as you
scroll, revealing the one already sitting underneath.

The design is book-like. The content is not: pages carry a line or two, and
anything long stays folded away until a reader opens it.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run start
```

## The turn

`src/components/Book.tsx` stacks every leaf in one pinned viewport and gives
each a slice of the page's scroll progress. Inside its slice a leaf rotates
on `rotateX` about `50% 0%`, so the bottom edge lifts toward the reader and
goes over the top. A shadow gradient deepens as it turns and a warm crease
runs along the lifting edge.

Scroll distance is one viewport per leaf. The last leaf never turns. Under
`prefers-reduced-motion` the whole thing degrades to ordinary stacked
sections.

## What draws what

| Library | Job |
|---|---|
| GSAP + ScrollTrigger | The page turn. One pin, one scrubbed timeline, `start: "top top"`. |
| Radix UI | The project dialog: focus trap, escape, scroll lock, aria wiring. |
| Paper.js + d3-delaunay | Voronoi cells, one page only, at 8% coverage, standing in for the fibre of the stock. |

Motion is GSAP throughout. Radix is what `shadcn/ui` is built on; its registry is
unreachable from this environment, so the primitives are composed directly.


## Palette

Three spot inks, the way a mid-century picture book was actually printed.
Everything on the page is one of these or a true overprint of two.

| Token | Value | Use |
|---|---|---|
| `forest` | `#334736` | ground for the cover and the work page |
| `paper` | `#EEEBD3` | ground for the hello page, and type on forest |
| `flame` | `#E3655B` | ground for the last page, plates and meta elsewhere |
| `ink` | `#16190F` | press black, the only type that holds on flame |

No gradients, no shadows, no blur. Flat fields, square corners, 1px rules.
Colour commits at page scale: each leaf gives its whole ground to one ink.


## Content

Everything the site says lives in `src/content/book.ts`, transcribed from
`public/rohini-gudimetla-resume.pdf`. Each work entry has a one-line face and
a `detail` array that only appears once the entry is opened.

## Slots to fill

- **Portrait.** `Hello` shows initials in a hand-drawn ring. Drop a square
  image at `/public/rohini.jpg`, about 480px, and swap it in for the initials.
  Nothing else needs to change.
- **Painted artwork.** Image generation was unavailable when this was built,
  so there is none. The cover and the hello page would each take one warm
  gouache spot illustration on the forest ground.

## Notes

- Paper.js is aliased to its browser-only core build in `next.config.mjs`,
  since its default entry reaches for `canvas` and `jsdom`.
- Every canvas is `aria-hidden` and the page reads correctly without them.
- Dark only, by intent.
