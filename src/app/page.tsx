import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import Hero from "@/components/sections/Hero";
import Maker from "@/components/sections/Maker";
import Work from "@/components/sections/Work";
import Library from "@/components/sections/Library";
import Closing from "@/components/sections/Closing";

/**
 * The paper itself: procedural grain and the watercolour blooms that
 * answer a hover. Decorative, so it loads after everything readable.
 */
const WashLayer = dynamic(() => import("@/components/WashLayer"));

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Maker />
        <Work />
        <Library />
        <Closing />
      </main>
      <WashLayer />
    </>
  );
}
