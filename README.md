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

`src/components/Book.tsx` stacks the leaves in one pinned stage and scrubs a
single GSAP timeline that hinges each one at its top edge.

Two settings matter and are easy to get wrong:

- `pinSpacing: false`, because the wrapper already supplies the scroll
  length. With the default, ScrollTrigger adds its own spacer on top and the
  document comes out twice as long as intended.
- `snap.directional: false`, so a released scroll goes to the nearest rest
  point. The directional default pushes past the leaf you just arrived at.

Each turn owns exactly one timeline unit, so rest positions land on clean
fractions and the page can never sit half turned.


## What draws what

| Library | Job |
|---|---|
| GSAP + ScrollTrigger | The page turn. One pin, one scrubbed timeline, `start: "top top"`. |
| Radix UI | The project dialog: focus trap, escape, scroll lock, aria wiring. |
| Paper.js + d3-delaunay | Voronoi cells, one page only, at 8% coverage, standing in for the fibre of the stock. |

Motion is GSAP throughout. Radix is what `shadcn/ui` is built on; its registry is
unreachable from this environment, so the primitives are composed directly.


## Palette

Four inks. Flat fields, square corners, 1px rules, no gradients or shadows.
Colour commits at page scale: each leaf gives its whole ground to one ink.

| Token | Value | Use |
|---|---|---|
| `bark` | `#2A2D1D` | ground of the first leaf, and the plate on the last |
| `moss` | `#6F6F52` | rules and secondary ink on light grounds |
| `moss-lit` | `#9A9A78` | the same hue lifted to 4.9:1, for text on bark |
| `butter` | `#FCE7BC` | ground of the work leaf, and type on bark |
| `ember` | `#C94C38` | accent, and the full field of the last leaf |

`ember` is a mid tone: nothing in the set reaches 4.5:1 against it, so it
never carries body copy. On the ember leaf the text sits in a bark plate,
and only the display line, which clears the 3:1 large-text rule, sits
directly on the colour.


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
