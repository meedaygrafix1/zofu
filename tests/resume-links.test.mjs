import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/resumeLinks.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { normalizeResumeUrl, createResumeLink, parseResumeInline } =
    await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("accepts website addresses and preserves query strings and fragments", () => {
    assert.equal(normalizeResumeUrl(" example.com/work?q=design#projects "), "https://example.com/work?q=design#projects");
    assert.equal(normalizeResumeUrl("https://example.com/work(2026)"), "https://example.com/work%282026%29");
});

test("rejects unsafe protocols, credentials, and invalid addresses", () => {
    for (const url of ["javascript:alert(1)", "data:text/html,test", "file:///tmp/test", "https://user:pass@example.com", "", "my portfolio", "https://"]) {
        assert.equal(normalizeResumeUrl(url), null, url);
    }
});

test("link labels and destinations survive saving and reopening", () => {
    const url = normalizeResumeUrl("https://example.com/work(2026)?ref=cv#projects");
    const markdown = createResumeLink("My [design] portfolio", url);
    assert.deepEqual(parseResumeInline(markdown), [
        { text: "My [design] portfolio", bold: false, url },
    ]);
});

test("multiple header links preserve labels, separators, and bold formatting", () => {
    const text = "**Jane Doe** | [Portfolio](https://example.com) | **[GitHub](https://github.com/jane)**";
    const segments = parseResumeInline(text);
    assert.equal(segments.map(segment => segment.text).join(""), "Jane Doe | Portfolio | GitHub");
    assert.deepEqual(segments.filter(segment => segment.url).map(segment => [segment.text, segment.bold, segment.url]), [
        ["Portfolio", false, "https://example.com/"],
        ["GitHub", true, "https://github.com/jane"],
    ]);
});
