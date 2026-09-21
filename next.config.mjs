import path from "node:path";

/**
 * Paper.js can render outside a browser, so it reaches for `canvas` and
 * `jsdom`. Nothing here does: the two Paper.js components are client leaves
 * that import it lazily against a real <canvas>. Point both bundlers at the
 * core build and drop the server-rendering branch it carries.
 */
const paperCore = path.resolve("./node_modules/paper/dist/paper-core.js");

const nodeOnly = [
  "canvas",
  "jsdom",
  "jsdom/lib/jsdom/living/generated/utils",
  "source-map-support",
  // Paper.js's own server-side shims, which reach for the above.
  path.resolve("./node_modules/paper/dist/node/self.js"),
  path.resolve("./node_modules/paper/dist/node/extend.js"),
];

/**
 * `STATIC_EXPORT=1 npm run build` emits a self-contained ./out that can be
 * opened from a file path or hosted anywhere flat. Paths are made relative
 * so the export does not assume it is served from a domain root.
 */
const isExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export", images: { unoptimized: true } } : {}),

  turbopack: {
    resolveAlias: {
      paper: paperCore,
    },
  },

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      paper: paperCore,
      ...Object.fromEntries(nodeOnly.map((m) => [m, false])),
    };
    return config;
  },
};

export default nextConfig;
