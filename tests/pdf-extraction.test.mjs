import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

function loadModule(path, dependencies = {}, env = {}) {
    const source = readFileSync(new URL(path, import.meta.url), "utf8");
    const compiled = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const loadedModule = { exports: {} };
    vm.runInNewContext(compiled, {
        module: loadedModule, exports: loadedModule.exports, Buffer, Error, console, setTimeout,
        process: { env },
        require: (name) => dependencies[name] ?? require(name),
    });
    return loadedModule.exports;
}

const errors = loadModule("../src/lib/pdfErrors.ts");

function extraction({ apiKey, providerError, localPDF, responseError, localError, cleanupError, responseText = "Scanned resume" } = {}) {
    let calls = 0;
    const dependencies = {
        "./prompts": {},
        "./aiErrors": loadModule("../src/lib/aiErrors.ts"),
        "./pdfErrors": errors,
        "./pdfBlankPages": localPDF
            ? loadModule("../src/lib/pdfBlankPages.ts")
            : { isPDFPageBlank: async () => false },
        "@google/generative-ai": {
            GoogleGenerativeAI: class {
                getGenerativeModel() {
                    return {
                        async generateContent() {
                            calls++;
                            if (providerError) throw providerError;
                            return { response: { text: () => {
                                if (responseError) throw responseError;
                                return responseText;
                            } } };
                        },
                    };
                }
            },
        },
    };
    if (!localPDF) {
        dependencies["pdf-parse"] = {
            PDFParse: class {
                async getText() {
                    if (localError) throw localError;
                    return cleanupError
                        ? { text: "Readable resume", total: 1, pages: [{ num: 1, text: "Readable resume" }] }
                        : { text: "", total: 1, pages: [{ num: 1, text: "" }] };
                }
                async destroy() { if (cleanupError) throw cleanupError; }
            },
        };
    }
    const ai = loadModule("../src/lib/ai.ts", dependencies, { GEMINI_API_KEY: apiKey });
    return { extract: ai.extractTextFromPDF, calls: () => calls };
}

test("a real selectable-text PDF uploads without a Gemini key or request", async () => {
    const { jsPDF } = require("jspdf");
    const pdf = new jsPDF();
    pdf.text("Jane Doe - Software Engineer", 20, 20);
    const { extract, calls } = extraction({ localPDF: true });
    const result = await extract(Buffer.from(pdf.output("arraybuffer")));
    assert.match(result.text, /Jane Doe - Software Engineer/);
    assert.equal(result.pages, 1);
    assert.equal(calls(), 0);
});

test("blank pages in a real text PDF do not require AI even when credits are depleted", async () => {
    const { jsPDF } = require("jspdf");
    const pdf = new jsPDF();
    pdf.addPage();
    pdf.text("Jane Doe - Software Engineer", 20, 20);
    pdf.addPage();
    const { extract, calls } = extraction({
        localPDF: true, apiKey: "test-key",
        providerError: Object.assign(new Error("Your prepayment credits are depleted."), { status: 402 }),
    });
    const result = await extract(Buffer.from(pdf.output("arraybuffer")));
    assert.match(result.text, /Jane Doe/);
    assert.equal(result.pages, 3);
    assert.equal(calls(), 0);
});

test("a real mixed text and scanned PDF still uses OCR without silently dropping the scan", async () => {
    const { jsPDF } = require("jspdf");
    const { createCanvas } = require("@napi-rs/canvas");
    const canvas = createCanvas(600, 200);
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, 600, 200);
    context.fillStyle = "black";
    context.font = "30px sans-serif";
    context.fillText("Scanned employment history", 20, 60);
    const pdf = new jsPDF();
    pdf.text("Jane Doe", 20, 20);
    pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 20, 20, 170, 60);
    const buffer = Buffer.from(pdf.output("arraybuffer"));
    const { extract, calls } = extraction({ localPDF: true, apiKey: "test-key", responseText: "Jane Doe\nScanned employment history" });
    const result = await extract(buffer);
    assert.match(result.text, /Scanned employment history/);
    assert.equal(result.pages, 2);
    assert.equal(calls(), 1);
    const unavailable = extraction({ localPDF: true });
    await assert.rejects(unavailable.extract(buffer), { status: 503 });
});

test("a real empty or invalid PDF gives a document error without calling AI", async () => {
    const { jsPDF } = require("jspdf");
    for (const buffer of [Buffer.from(new jsPDF().output("arraybuffer")), Buffer.from("invalid PDF")]) {
        const { extract, calls } = extraction({ localPDF: true, apiKey: "test-key" });
        await assert.rejects(extract(buffer), { status: 422 });
        assert.equal(calls(), 0);
    }
});

test("password protection is reported without sending the PDF to AI", async () => {
    const { extract, calls } = extraction({
        apiKey: "test-key",
        localError: Object.assign(new Error("Password required"), { name: "PasswordException" }),
    });
    await assert.rejects(extract(Buffer.from("protected")), (error) => {
        assert.equal(error.status, 422);
        assert.match(error.message, /unlocked copy/);
        return true;
    });
    assert.equal(calls(), 0);
});

test("parser cleanup failures do not turn a successful extraction into an AI request", async () => {
    const { extract, calls } = extraction({ cleanupError: new Error("Cleanup failed") });
    assert.equal((await extract(Buffer.from("text"))).text, "Readable resume");
    assert.equal(calls(), 0);
});

test("blocked AI response errors are sanitized too", async () => {
    const responseError = new Error("[GoogleGenerativeAI Error]: Private response diagnostic");
    const { extract } = extraction({ apiKey: "test-key", responseError });
    await assert.rejects(extract(Buffer.from("scan")), (error) => {
        assert.equal(error.status, 503);
        assert.equal(error.message, errors.PDF_AI_UNAVAILABLE);
        assert.equal(error.cause, responseError);
        return true;
    });
});

test("scanned PDFs with a missing or whitespace-only key return a safe service error", async () => {
    for (const apiKey of [undefined, "", " \n "]) {
        const { extract, calls } = extraction({ apiKey });
        await assert.rejects(extract(Buffer.from("scan")), (error) => {
            assert.equal(error.status, 503);
            assert.equal(error.message, errors.PDF_AI_UNAVAILABLE);
            return true;
        });
        assert.equal(calls(), 0);
    }
});

test("provider failures including depleted credits do not leak details or retry", async () => {
    for (const status of [400, 402, 403]) {
        const providerError = Object.assign(
            new Error(status === 402 ? "[GoogleGenerativeAI Error]: [402 Payment Required] Your prepayment credits are depleted. https://ai.studio/projects" : "API key not valid. Provider diagnostic details"), { status },
        );
        const { extract, calls } = extraction({ apiKey: "test-key", providerError });
        await assert.rejects(extract(Buffer.from("scan")), (error) => {
            assert.equal(error.status, 503);
            assert.equal(error.message, errors.PDF_AI_UNAVAILABLE);
            assert.equal(error.cause, providerError);
            return true;
        });
        assert.equal(calls(), 1);
    }
});

test("successful AI fallback still returns extracted text", async () => {
    const { extract, calls } = extraction({ apiKey: "test-key" });
    const result = await extract(Buffer.from("scan"));
    assert.equal(result.text, "Scanned resume");
    assert.equal(calls(), 1);
});

test("an empty AI response reports an unreadable document", async () => {
    const { extract } = extraction({ apiKey: "test-key", responseText: "" });
    await assert.rejects(extract(Buffer.from("scan")), (error) => {
        assert.equal(error.status, 422);
        assert.match(error.message, /No readable text/);
        return true;
    });
});

test("both PDF routes return safe messages and service status codes", async () => {
    for (const path of ["../src/app/api/parse-resume/route.ts", "../src/app/api/amplify/parse/route.ts"]) {
        for (const failure of [
            new errors.PDFExtractionError(errors.PDF_AI_UNAVAILABLE, 503),
            new Error("Private provider diagnostic"),
        ]) {
            const route = loadModule(path, {
                "next/server": { NextResponse: { json: (body, options) => ({ body, ...options }) } },
                "@/lib/pdfErrors": errors,
                "@/lib/ai": { extractTextFromPDF: async () => { throw failure; } },
                "@/utils/supabase/server": {
                    createClient: async () => ({
                        auth: { getUser: async () => ({ data: { user: { id: "test-user" } } }) },
                    }),
                },
            });
            const result = await route.POST({
                formData: async () => ({
                    get: () => ({ type: "application/pdf", size: 4, arrayBuffer: async () => new ArrayBuffer(4) }),
                }),
            });
            assert.equal(result.status, failure.status ?? 500);
            assert.equal(result.body.error, errors.getPDFErrorResponse(failure).message);
            assert.doesNotMatch(JSON.stringify(result.body), /Private provider diagnostic/);
        }
    }
});

test("both upload routes handle depleted credits safely through the actual extraction function", async () => {
    for (const [path, field] of [
        ["../src/app/api/parse-resume/route.ts", "file"],
        ["../src/app/api/amplify/parse/route.ts", "resume"],
    ]) {
        const { extract, calls } = extraction({
            apiKey: "test-key",
            providerError: Object.assign(new Error("[GoogleGenerativeAI Error]: [402 Payment Required] Your prepayment credits are depleted. https://ai.studio/projects"), { status: 402 }),
        });
        const route = loadModule(path, {
            "next/server": { NextResponse: { json: (body, options) => ({ body, ...options }) } },
            "@/lib/pdfErrors": errors,
            "@/lib/ai": { extractTextFromPDF: extract },
            "@/utils/supabase/server": {
                createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "test-user" } } }) } }),
            },
        });
        for (const size of [4, 6 * 1024 * 1024]) {
            const result = await route.POST({ formData: async () => ({
                get: (name) => name === field ? { type: "application/pdf", size, arrayBuffer: async () => new ArrayBuffer(4) } : null,
            }) });
            assert.equal(result.status, size === 4 ? 503 : 400);
            assert.doesNotMatch(JSON.stringify(result.body), /GoogleGenerativeAI|prepayment|aistudio|ai.studio/);
            if (size === 4) assert.equal(result.body.error, errors.PDF_AI_UNAVAILABLE);
        }
        assert.equal(calls(), 1);
    }
});
