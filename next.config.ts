import type { NextConfig } from "next";

// PDF.js loads its worker dynamically, which Next's file tracing misses.
// Include both entry-point variants so serverless uploads can parse locally.
const pdfWorkers = [
  "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  "./node_modules/pdf-parse/dist/worker/pdf.worker.mjs",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/parse-resume": pdfWorkers,
    "/api/amplify/parse": pdfWorkers,
  },
};

export default nextConfig;
