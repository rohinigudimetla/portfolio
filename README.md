# Rohini Gudimetla, portfolio

A single-page portfolio built to feel like the inside of a children's book:
warm, dark, hand drawn, and textured rather than flat.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run start
```

## What draws what

The three canvas libraries each do one job, and none of them imitates a
picture. They draw geometry, linework and texture.

| Library | Job | Lives in |
|---|---|---|
| Paper.js | Marbled endpapers that part around the pointer, and the leaf that sweeps over each section as it arrives | `src/components/Endpapers.tsx`, `src/components/PageTurn.tsx` |
| PixiJS | Procedural paper grain, old foxing stains, and the watercolour blooms that answer a hover | `src/components/WashLayer.tsx` |
| Rough.js | Every rule, frame, underline and tick mark on the page, re-inked on hover | `src/components/Ink.tsx` |

The grain is computed per pixel rather than filtered, and the wash textures
are drawn once at load and then tinted per use.

### How a hover becomes a watercolour

`src/lib/wash.ts` is a small publish/subscribe bus. Anything hoverable calls
`spillFromElement`, and the Pixi layer blooms a blot at those coordinates.
The registry hangs off `globalThis` on purpose: the wash layer is code split,
and a module-local registry ends up duplicated across chunks, leaving the
buttons publishing into a set that nothing listens to.

## Layering

Everything decorative sits under the ink.

```
z-40  navigation
z-10  all readable content
z-2   the paper: grain, stains, watercolour blooms
z-1   section backdrops (gradients, warm pools)
z-0   Paper.js endpapers
```

## Palette

Locked to the three inks the brief fixed, plus warm earths that complete the
set. All tokens live in `src/app/globals.css` and `src/lib/palette.ts`.

| Token | Value | Use |
|---|---|---|
| `forest` | `#334736` | page ground |
| `cream` | `#EEEBD3` | primary ink |
| `terracotta` | `#E3655B` | accent, the only one |
| `char` | `#1B211C` | deep charcoal, the dark under the page |
| `gold` | `#D9A441` | drop caps, dates, margin notes |
| `clay` | `#7A4E3F` | binding brown |
| `sage` | `#9AA98E` | secondary ink |

## Content

Every factual claim comes from `src/content/book.ts`, which is transcribed
from the resume in `public/rohini-gudimetla-resume.pdf`. Editing the copy
means editing that one file.

## Notes

- Paper.js is aliased to its browser-only core build in `next.config.mjs`,
  since its default entry reaches for `canvas` and `jsdom`.
- Every canvas is `aria-hidden` and the page reads correctly without them.
- All motion collapses under `prefers-reduced-motion`.
- The page is dark only, which is a deliberate single-theme choice.

## Illustration slots

Image generation was unavailable when this was built, so the page carries no
painted artwork. Three places would take it well, and each is a plain `img`
drop-in with no layout change needed:

1. Beside the hero type, right third, roughly 3:2. A cosy lamplit desk nook.
2. The Pocket Library title block, right half, roughly 1:1. A lantern lit
   shelf with a key and a padlock.
3. The closing section, right of the contact list, roughly 3:2. A paper boat
   carrying a lantern.

Painted gouache on the forest ground, warm gold light, soft edges.
