import Book from "@/components/Book";
import Nav from "@/components/Nav";
import Hello from "@/components/leaves/Hello";
import Work from "@/components/leaves/Work";
import Education from "@/components/leaves/Education";
import Contact from "@/components/leaves/Contact";

/**
 * Nav sits outside the smoother wrapper deliberately. ScrollSmoother moves
 * the content by transforming that wrapper on every frame, and a fixed
 * element inside a transformed ancestor is positioned against the ancestor
 * rather than the viewport, so a nav placed in there would scroll away with
 * the page it is supposed to sit above.
 */
export default function Page() {
  return (
    <>
      <Nav />
      <div id="smooth-wrapper">
        <div id="smooth-content">
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
        </div>
      </div>
    </>
  );
}
