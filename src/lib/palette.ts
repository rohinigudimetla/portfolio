/** The book's inks, in a form canvases can read. */
export const INK = {
  forest: 0x334736,
  forestLit: 0x3e543f,
  forestDeep: 0x283829,
  forestMist: 0x4a5f4c,
  cream: 0xeeebd3,
  creamDim: 0xc9c6b2,
  terracotta: 0xe3655b,
  roseDust: 0xc98b7e,
  gold: 0xd9a441,
  goldPale: 0xe8c988,
  sage: 0x9aa98e,
  clay: 0x7a4e3f,
  char: 0x1b211c,
} as const;

export const CSS = {
  forest: "#334736",
  forestLit: "#3e543f",
  forestDeep: "#283829",
  forestMist: "#4a5f4c",
  cream: "#eeebd3",
  creamDim: "#c9c6b2",
  terracotta: "#e3655b",
  roseDust: "#c98b7e",
  gold: "#d9a441",
  goldPale: "#e8c988",
  sage: "#9aa98e",
  clay: "#7a4e3f",
  char: "#1b211c",
} as const;

export type Tone = keyof typeof INK;

export function toRgb(hex: number) {
  return {
    r: (hex >> 16) & 0xff,
    g: (hex >> 8) & 0xff,
    b: hex & 0xff,
  };
}
