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

None of these imitates a picture. They draw geometry, linework and texture.

| Library | Job | Lives in |
|---|---|---|
| Paper.js | Voronoi cells standing in for paper fibre, drifting, opening around the pointer | `src/components/Voronoi.tsx` |
| PixiJS | Procedural paper grain and old foxing stains, over the whole book | `src/components/WashLayer.tsx` |
| Rough.js | Rules, rings, frames and ticks, re-inked on hover | `src/components/Ink.tsx` |
| 2D canvas | Watercolour blooms that answer a hover | `src/components/Bloom.tsx` |

The Voronoi follows the Paper.js example, with `d3-delaunay` doing the
geometry and Paper.js the drawing. It is kept at low contrast on purpose.

### Why blooms are not in the Pixi layer

Each leaf transforms, which makes it a stacking context. A single shared
canvas cannot sit between every page's background and its own text, so a
bloom either vanished behind a page or stained the reading panel on top of
it. `Bloom` therefore renders inside each leaf and ignores any spill whose
coordinates fall outside its own box. `src/lib/wash.ts` is the bus between
them, and its registry hangs off `globalThis` because the layer is code
split and a module-local registry ends up duplicated across chunks.

## Layering, inside a leaf

```
z-30  the opened detail panel
z-20  the turn's shadow and crease
z-10  everything readable
z-1   watercolour blooms
z-0   Voronoi fibre, page background
```

Paper grain is the exception: it is fixed at `z-60`, over the whole book,
because grain sits on top of everything in a real sheet.

## Palette

| Token | Value | Use |
|---|---|---|
| `forest` | `#334736` | the page |
| `cream` | `#EEEBD3` | primary ink |
| `terracotta` | `#E3655B` | accent, the only one |
| `char` | `#1B211C` | the table the book lies on |
| `gold` | `#D9A441` | dates, margin notes, the cover rule |
| `clay` | `#7A4E3F` | the cover boards |
| `sage` | `#9AA98E` | secondary ink |

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
