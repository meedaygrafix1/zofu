import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

for (const route of ["parse-resume", "amplify/parse"]) {
    const tracePath = resolve(`.next/server/app/api/${route}/route.js.nft.json`);
    assert.ok(existsSync(tracePath), "Run npm run build before checking PDF deployment files.");
    const { files } = JSON.parse(readFileSync(tracePath, "utf8"));
    const tracedPaths = new Set(files.map((file) => resolve(dirname(tracePath), file)));
    for (const worker of [
        "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
        "node_modules/pdf-parse/dist/worker/pdf.worker.mjs",
    ]) {
        assert.ok(tracedPaths.has(resolve(worker)), `${route}: PDF worker missing from deployment: ${worker}`);
        assert.ok(existsSync(resolve(worker)), `${route}: PDF worker does not exist: ${worker}`);
    }
    console.log(`${route}: PDF workers included in deployment`);
}
