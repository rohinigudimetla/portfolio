/**
 * The running head. Her name in the corner of every leaf, taking that
 * leaf's own ink so it reads on whichever ground it lands on.
 */
export default function NameMark({ tone }: { tone: string }) {
  return (
    <p
      className="t-meta absolute top-[5vh] right-[6vw] z-20"
      style={{ color: tone }}
    >
      Rohini Gudimetla
    </p>
  );
}
