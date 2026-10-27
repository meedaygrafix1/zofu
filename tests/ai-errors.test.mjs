import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
function loadModule(path, dependencies = {}, env = {}) {
    const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const loadedModule = { exports: {} };
    vm.runInNewContext(compiled, {
        module: loadedModule, exports: loadedModule.exports, Error, console,
        setTimeout: (callback) => callback(),
        process: { env },
        require: (name) => dependencies[name] ?? require(name),
    });
    return loadedModule.exports;
}

const errors = loadModule("../src/lib/aiErrors.ts");
const spendError = Object.assign(new Error(
    "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent: [429 Too Many Requests] Your project has exceeded its monthly spending cap. Please go to https://aistudio.google.com/spend to manage your project spend cap."
), { status: 429 });
const paymentError = Object.assign(new Error("[402 Payment Required] Your prepayment credits are depleted."), { status: 402 });

test("optimization does not retry spending caps but still retries transient failures", async () => {
    for (const failure of [spendError, paymentError, Object.assign(new Error("429 Too Many Requests"), { status: 429 })]) {
        let calls = 0;
        const ai = loadModule("../src/lib/ai.ts", {
            "./aiErrors": errors,
            "./pdfErrors": {},
            "./pdfBlankPages": {},
            "./prompts": { buildPrompt: () => "test prompt" },
            "@google/generative-ai": {
                GoogleGenerativeAI: class {
                    getGenerativeModel() {
                        return {
                            async generateContent() {
                                calls++;
                                if (calls === 1) throw failure;
                                return { response: { text: () => '{"amplifiedResume":"Updated resume"}' } };
                            },
                        };
                    }
                },
            },
        }, { GEMINI_API_KEY: "test-key" });

        if (failure === spendError || failure === paymentError) {
            await assert.rejects(ai.amplifyResume("resume", "job"), (error) => error === failure);
            assert.equal(calls, 1);
        } else {
            const result = await ai.amplifyResume("resume", "job");
            assert.equal(result.amplifiedResume, "Updated resume");
            assert.equal(calls, 2);
        }
    }
});

test("optimization and interview endpoints return safe billing and rate limit messages", async () => {
    for (const path of ["../src/app/api/amplify/route.ts", "../src/app/api/interview-questions/route.ts"]) {
        for (const [failure, expectedStatus, expectedCode] of [
            [spendError, 503, "AI_SPEND_LIMIT_REACHED"],
            [paymentError, 503, "AI_PAYMENT_REQUIRED"],
            [Object.assign(new Error("Private diagnostic"), { status: 429 }), 429, "AI_RATE_LIMITED"],
            [new Error("Private diagnostic"), 503, "AI_UNAVAILABLE"],
        ]) {
            const fail = async () => { throw failure; };
            const route = loadModule(path, {
                "next/server": { NextResponse: { json: (body, options) => ({ body, ...options }) } },
                "@/lib/aiErrors": errors,
                "@/lib/ai": { amplifyResume: fail, generateInterviewQuestions: fail },
                "@/utils/supabase/server": {
                    createClient: async () => ({
                        auth: { getUser: async () => ({ data: { user: { id: "test-user" } } }) },
                    }),
                },
            }, { GEMINI_API_KEY: "test-key" });
            const response = await route.POST({ json: async () => ({ resumeText: "resume", jobDescription: "job" }) });
            assert.equal(response.status, expectedStatus);
            assert.equal(response.body.error, expectedCode);
            assert.doesNotMatch(JSON.stringify(response.body), /Private diagnostic|googleapis|GoogleGenerativeAI|aistudio/);
            assert.ok(response.body.message);
        }
    }
});
