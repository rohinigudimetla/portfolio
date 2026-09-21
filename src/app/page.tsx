import dynamic from "next/dynamic";
import Book from "@/components/Book";
import Cover from "@/components/leaves/Cover";
import Hello from "@/components/leaves/Hello";
import Work from "@/components/leaves/Work";
import Close from "@/components/leaves/Close";

/** Paper grain and the watercolour blooms that answer a hover. */
const WashLayer = dynamic(() => import("@/components/WashLayer"));

export default function Page() {
  return (
    <>
      <main>
        <Book
          leaves={[
            <Cover key="cover" />,
            <Hello key="hello" />,
            <Work key="work" />,
            <Close key="close" />,
          ]}
        />
      </main>
      <WashLayer />
    </>
  );
}
