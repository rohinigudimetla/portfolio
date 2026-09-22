import Book from "@/components/Book";
import Nav from "@/components/Nav";
import Hello from "@/components/leaves/Hello";
import Work from "@/components/leaves/Work";
import Education from "@/components/leaves/Education";
import Contact from "@/components/leaves/Contact";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Book
          leaves={[
            <Hello key="hello" />,
            <Work key="work" />,
            <Education key="education" />,
            <Contact key="contact" />,
          ]}
        />
      </main>
    </>
  );
}
