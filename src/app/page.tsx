import Book from "@/components/Book";
import Cover from "@/components/leaves/Cover";
import Hello from "@/components/leaves/Hello";
import Work from "@/components/leaves/Work";
import Contact from "@/components/leaves/Contact";

export default function Page() {
  return (
    <main>
      <Book
        leaves={[
          <Cover key="cover" />,
          <Hello key="hello" />,
          <Work key="work" />,
          <Contact key="contact" />,
        ]}
      />
    </main>
  );
}
