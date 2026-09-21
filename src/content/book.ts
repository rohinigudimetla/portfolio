/**
 * Everything the page says, in one place.
 * Every factual claim here traces to the supplied resume.
 */

export const person = {
  name: "Rohini Gudimetla",
  role: "Full Stack Software Developer",
  place: "Boston, Massachusetts",
  email: "rohinigudimetla174@gmail.com",
  phone: "857-316-8283",
  phoneHref: "tel:+18573168283",
  resume: "/rohini-gudimetla-resume.pdf",
  linkedin: "https://linkedin.com/in/rohinigudimetla",
  github: "https://github.com/rohinigudimetla",
};

/** The one line under the name. Kept under twenty words on purpose. */
export const hook =
  "She builds production systems on Spring Boot and React, and writes down why every awkward decision went the way it did.";

/* ----------------------------------------------------------- The maker */

export const opening = {
  lead: "Rohini builds software the way some people build furniture. Slowly, with the joints left showing.",
  body: [
    "She works in Spring Boot and React, keeps her data in PostgreSQL, and caches it in Redis. Most of what she has shipped runs on AWS, and it stays up.",
    "The piece she is fondest of is a library application nobody commissioned. It carries distributed caching and a notification layer that replaced a polling loop. Alongside the code sit sixteen written records, each explaining why an awkward decision went the way it did.",
    "She wrote those for whoever opens the repository after her.",
  ],
  margin: "Boston, by way of Bangalore",
};

export type ToolGroup = { heading: string; items: string[] };

export const workbench: ToolGroup[] = [
  { heading: "Languages", items: ["Java", "TypeScript", "JavaScript", "SQL"] },
  {
    heading: "Frameworks",
    items: ["Spring Boot", "React", "Spring Security", "Hibernate"],
  },
  { heading: "Where data sleeps", items: ["PostgreSQL", "Redis"] },
  {
    heading: "Infrastructure",
    items: [
      "AWS (EC2, S3, RDS, CloudFront, CloudWatch)",
      "Docker",
      "Kubernetes",
    ],
  },
  { heading: "Pipelines", items: ["GitHub Actions", "Maven", "Liquibase"] },
  {
    heading: "Proof",
    items: ["JUnit 5", "Mockito", "Vitest", "React Testing Library"],
  },
];

/* ----------------------------------------------------------------- Work */

export type Post = {
  role: string;
  place: string;
  when: string;
  stack: string[];
  links: { label: string; href: string }[];
  notes: string[];
};

export const posts: Post[] = [
  {
    role: "Software Development Consultant",
    place: "Cher Digital Analytics",
    when: "Oct to Nov 2025",
    stack: ["Next.js", "Supabase", "Vercel", "JavaScript"],
    links: [
      {
        label: "See it live",
        href: "https://cher-digi-analytics.vercel.app",
      },
      {
        label: "Read the source",
        href: "https://github.com/rohinigudimetla/cher-digi-analytics",
      },
    ],
    notes: [
      "Built a client booking system in Next.js. A confirmed slot sends Google Calendar OAuth2 off to write the event, and Resend posts the confirmation to the client and the consultant both.",
      "Laid the Supabase backend across four RLS-protected tables. Every read and write travels through a Next.js server route holding the service-role key, so no credential ever reaches the browser.",
      "Three Vercel production builds failed on the way out, in Google OAuth2 initialization, a Resend dynamic import, and Supabase environment fallbacks. Each was traced and fixed, and the Next.js 15 application went live.",
    ],
  },
  {
    role: "Front End Developer Intern",
    place: "World Salon",
    when: "Jul 2024 to Jan 2025",
    stack: ["React", "Bootstrap", "JavaScript"],
    links: [{ label: "See it live", href: "https://world-salon.com" }],
    notes: [
      "Built three React pages from Figma specifications, shipping responsive components to production.",
      "Wired existing REST endpoints into those pages with fetch, handling the response shapes and the conditional rendering across all of them.",
    ],
  },
];

/* -------------------------------------------------------- Pocket Library */

export const library = {
  name: "Pocket Library",
  lead: "Deliberately over-engineered, and the paper trail was the point. Sixteen architectural decision records sit beside the code, one for every trade-off worth arguing about.",
  links: [
    { label: "See it live", href: "https://pocklib.site" },
    {
      label: "Read the source",
      href: "https://github.com/rohinigudimetla/Pocket-Library",
    },
  ],
  stack: ["Spring Boot", "PostgreSQL", "Redis", "Kubernetes", "AWS"],
  entries: [
    {
      mark: "Deploying",
      text: "Spring Boot runs on a minikube cluster on EC2, watched by liveness and readiness probes through Spring Actuator. A manual twelve-step SSH sequence became a four-minute GitHub Actions pipeline that rolls updates out without dropping a request.",
    },
    {
      mark: "Shaping",
      text: "Fourteen REST endpoints sit on a repository-pattern architecture. Seven Liquibase migrations carry the PostgreSQL schema forward, and every access runs through JPA and Hibernate.",
    },
    {
      mark: "Guarding",
      text: "An OWASP Top 10 audit guided the security layer: Spring Security role-based access, JWT authentication with Redis-backed token revocation on logout, and Bucket4j rate limiting standing in front of the login route.",
    },
    {
      mark: "Telling",
      text: "A Redis Pub/Sub system pushes book request alerts to authenticated readers over Server-Sent Events. The polling architecture went away, and the needless database reads went with it.",
    },
    {
      mark: "Proving",
      text: "Twenty-five tests across JUnit 5, Mockito, Vitest and React Testing Library. Security coverage came first and reached 76% on JWT authentication and access control. The suite runs in GitHub Actions on every push.",
    },
    {
      mark: "Shipping",
      text: "The React and TypeScript frontend lands on S3 and CloudFront through a path-filtered GitHub Actions pipeline. It wakes only for changes under the client directory and finishes in 27 seconds.",
    },
  ],
};

/* ----------------------------------------------------------- Endpapers */

export const schooling = [
  {
    school: "Boston University",
    award: "Master of Science, Software Development",
    when: "May 2025",
    where: "Boston, Massachusetts",
  },
  {
    school: "Amrita School of Engineering",
    award: "Bachelor of Technology, Electronics and Computer Engineering",
    when: "May 2023",
    where: "Bangalore, India",
  },
];

export const colophon =
  "Set in Literata. The lines are drawn by Rough.js, the endpapers by Paper.js, and the paper itself by PixiJS. The grain is computed, and the wobble is deliberate.";
