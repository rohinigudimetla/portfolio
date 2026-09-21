import type { Tone } from "./palette";

/**
 * A one-line bus between React and the Pixi canvas.
 * Buttons announce where they were touched; the wash layer listens and
 * blooms a watercolour there.
 *
 * The registry hangs off globalThis on purpose. The wash layer is code
 * split, so a module-local Set can end up duplicated across chunks: the
 * buttons then publish into one copy while the canvas listens to another,
 * and nothing ever blooms.
 */

export type WashEvent = {
  x: number;
  y: number;
  /** Footprint of the thing being touched, so the bloom is sized to it. */
  w: number;
  h: number;
  tone: Tone;
  /** 0..1, how wet the brush is. */
  strength: number;
};

type Listener = (e: WashEvent) => void;

const KEY = "__inkwash_listeners__";
type Registry = { [KEY]?: Set<Listener> };

function registry(): Set<Listener> {
  const g = globalThis as Registry;
  if (!g[KEY]) g[KEY] = new Set<Listener>();
  return g[KEY];
}

export function onWash(fn: Listener) {
  const set = registry();
  set.add(fn);
  return () => {
    set.delete(fn);
  };
}

export function spillWash(e: WashEvent) {
  registry().forEach((fn) => fn(e));
}

/** Bloom centred on a DOM element's box. */
export function spillFromElement(
  el: HTMLElement | null,
  tone: Tone = "terracotta",
  strength = 1,
) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  spillWash({
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    w: r.width,
    h: r.height,
    tone,
    strength,
  });
}
