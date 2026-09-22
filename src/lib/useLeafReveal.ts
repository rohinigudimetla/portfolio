"use client";

import { useEffect } from "react";

export const LEAF_ACTIVE = "leaf:active";

/**
 * Nav asks the book to turn to a leaf. Book owns the scroll position, so it
 * listens for this rather than exposing a ref up through the tree.
 */
export const BOOK_GOTO = "book:goto";

/**
 * Runs a leaf's entrance the first time that leaf becomes the one on top.
 *
 * Leaves cannot use ScrollTrigger for their own reveals: they sit inside a
 * pinned stage, so a trigger like "top 78%" either fires before the reader
 * ever sees the leaf or never fires at all, and anything it was animating
 * from stays stuck at opacity 0. Book announces the active leaf instead,
 * and this listens for its own index.
 */
export function useLeafReveal(index: number, play: () => void) {
  useEffect(() => {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      play();
    };

    const onActive = (e: Event) => {
      if ((e as CustomEvent<number>).detail === index) run();
    };

    window.addEventListener(LEAF_ACTIVE, onActive);
    // The first leaf is already active, and a reader who never scrolls must
    // still see a settled page.
    if (index === 0) run();
    return () => window.removeEventListener(LEAF_ACTIVE, onActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
}
