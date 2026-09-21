/**
 * Everything the book says.
 *
 * The rule here is that a page shows almost nothing. Anything long lives in
 * `detail`, which stays folded away until a reader asks for it.
 * Every factual claim traces to the resume in /public.
 */

export const person = {
  name: "Rohini Gudimetla",
  role: "software developer",
  place: "Boston, Massachusetts",
  email: "rohinigudimetla174@gmail.com",
  phone: "857-316-8283",
  phoneHref: "tel:+18573168283",
  resume: "/rohini-gudimetla-resume.pdf",
  linkedin: "https://linkedin.com/in/rohinigudimetla",
  github: "https://github.com/rohinigudimetla",
};

/** The one sentence on the first page. */
export const hello = "hi, my name is Rohini and I'm a software developer.";

/** Set beneath it, small. Four words, not a paragraph. */
export const note = "I build things that stay up.";

export type Entry = {
  title: string;
  kind: string;
  when: string;
  stack: string[];
  links: { label: string; href: string }[];
  /** Folded away. Shown only when a reader opens the entry. */
  detail: string[];
};

export const entries: Entry[] = [
  {
    title: "Pocket Library",
    kind: "Personal project",
    when: "2025",
    stack: ["Spring Boot", "PostgreSQL", "Redis", "Kubernetes", "AWS"],
    links: [
      { label: "pocklib.site", href: "https://pocklib.site" },
      { label: "GitHub", href: "https://github.com/rohinigudimetla/Pocket-Library" },
    ],
    detail: [
      "Over-engineered on purpose. Sixteen architectural decision records sit beside the code, one for each trade-off worth arguing about.",
      "Spring Boot runs on a minikube cluster on EC2 with liveness and readiness probes through Spring Actuator. A manual twelve-step SSH deploy became a four-minute GitHub Actions pipeline that rolls updates without dropping a request.",
      "Fourteen REST endpoints on a repository-pattern architecture, seven Liquibase migrations carrying the schema, and all access through JPA and Hibernate.",
      "An OWASP Top 10 audit shaped the security layer: role-based access, JWT with Redis-backed revocation on logout, and Bucket4j rate limiting in front of the login route.",
      "Redis Pub/Sub pushes book request alerts over Server-Sent Events, which retired the polling loop and the database reads it caused.",
      "Twenty-five tests across JUnit 5, Mockito, Vitest and React Testing Library, reaching 76% on JWT authentication and access control. The frontend ships to S3 and CloudFront in 27 seconds.",
    ],
  },
  {
    title: "Cher Digital Analytics",
    kind: "Consulting",
    when: "2025",
    stack: ["Next.js", "Supabase", "Vercel"],
    links: [
      { label: "Live site", href: "https://cher-digi-analytics.vercel.app" },
      { label: "GitHub", href: "https://github.com/rohinigudimetla/cher-digi-analytics" },
    ],
    detail: [
      "A client booking system. Confirming a slot sends Google Calendar OAuth2 to write the event, and Resend posts the confirmation to both the client and the consultant.",
      "Four RLS-protected Supabase tables, with every read and write routed through a Next.js server route holding the service-role key, so no credential reaches the browser.",
      "Three production builds failed on the way out, in OAuth2 initialization, a Resend dynamic import, and Supabase environment fallbacks. All three were traced and fixed.",
    ],
  },
  {
    title: "World Salon",
    kind: "Internship",
    when: "2024",
    stack: ["React", "Bootstrap"],
    links: [{ label: "world-salon.com", href: "https://world-salon.com" }],
    detail: [
      "Three React pages built from Figma specifications and shipped to production as responsive components.",
      "Existing REST endpoints wired in with fetch, handling response shapes and conditional rendering throughout.",
    ],
  },
];

export const tools = [
  "Java",
  "TypeScript",
  "Spring Boot",
  "React",
  "PostgreSQL",
  "Redis",
  "AWS",
  "Docker",
  "Kubernetes",
];

export const schooling = [
  { school: "Boston University", award: "MS, Software Development", when: "2025" },
  { school: "Amrita School of Engineering", award: "BTech, Electronics and Computer Engineering", when: "2023" },
];
