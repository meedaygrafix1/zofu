import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from "jsonrepair";
import {
    SYSTEM_PROMPT,
    AMPLIFY_PROMPT,
    INTERVIEW_PROMPT,
    buildPrompt,
} from "./prompts";

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    return new GoogleGenerativeAI(apiKey);
}

function getModel() {
    const model = process.env.AI_MODEL;
    // Temporarily using gemini-2.0-flash for stability — 2.5 models are experiencing high-demand 503s
    // Switch back to "gemini-2.5-flash" once Google stabilizes
    return model || "gemini-2.0-flash";
}

function parseAIResponse<T>(content: string): T {
    try {
        let cleaned = content.trim();
        // Remove markdown formatting if the LLM unexpectedly includes it
        if (cleaned.startsWith('```json')) {
            cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
        }

        try {
            return JSON.parse(cleaned) as T;
        } catch (e) {
            console.warn("Standard JSON.parse failed. Attempting to repair JSON structure...");
            // Use jsonrepair to fix trailing commas, missing closing brackets, or truncated strings
            try {
                const repaired = jsonrepair(cleaned);
                return JSON.parse(repaired) as T;
            } catch (repairError) {
                console.error("jsonrepair also failed.");
                console.error("Length of original content:", content.length);
                console.error("End of content:", content.slice(-200));
                throw e; // throw the original error
            }
        }
    } catch (error) {
        console.error("AI Response Parsing Failed");
        console.error("Raw Error:", error);
        throw new Error("Failed to parse AI response. The response might have been cut off or malformed.");
    }
}

async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1500
): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error: any) {
            attempt++;
            const errorMessage = error?.message || "";
            const isFetchError = errorMessage.includes('fetch failed') ||
                error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
                errorMessage.includes('network') ||
                errorMessage.includes('Timeout') ||
                errorMessage.includes('ECONNRESET') ||
                errorMessage.includes('503') ||
                errorMessage.includes('500') ||
                errorMessage.includes('429');

            if (!isFetchError || attempt >= maxRetries) {
                throw error;
            }

            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`[AI Network Error] Retrying ${attempt}/${maxRetries} in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
    throw new Error("AI operation failed after maximum retries.");
}

export interface AmplifyResult {
    amplifiedResume: string;
    atsScore: number;
    keywords: {
        found: string[];
        missing: string[];
        added: string[];
    };
    changes: {
        section: string;
        original: string;
        amplified: string;
        reason: string;
    }[];
    summary: string;
    coverLetter: string;
}

export interface InterviewQuestion {
    question: string;
    context: string;
    suggestedPoints: string[];
}

export interface InterviewResult {
    behavioral: InterviewQuestion[];
    technical: InterviewQuestion[];
}

export async function amplifyResume(
    resumeText: string,
    jobDescription: string
): Promise<AmplifyResult> {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: getModel(),
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        },
    });

    const prompt = buildPrompt(AMPLIFY_PROMPT, { resumeText, jobDescription });
    const result = await withRetry(() => model.generateContent(prompt));
    const content = result.response.text();

    if (!content) throw new Error("No response from AI");
    return parseAIResponse<AmplifyResult>(content);
}

export async function generateInterviewQuestions(
    resumeText: string,
    jobDescription: string
): Promise<InterviewResult> {
    const client = getClient();
    const model = client.getGenerativeModel({
        model: getModel(),
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
        },
    });

    const prompt = buildPrompt(INTERVIEW_PROMPT, { resumeText, jobDescription });
    const result = await withRetry(() => model.generateContent(prompt));
    const content = result.response.text();

    if (!content) throw new Error("No response from AI");
    return parseAIResponse<InterviewResult>(content);
}

export async function extractTextFromPDF(
    pdfBuffer: Buffer
): Promise<{ text: string; pages: number }> {
    // With pdfjs-dist externalized via serverExternalPackages, we can resolve
    // the real worker file path from disk and avoid all Turbopack bundling issues.
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);

    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const workerPath = require.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

    const data = new Uint8Array(pdfBuffer);
    const doc = await pdfjsLib.getDocument({
        data,
        useWorkerFetch: false,
        disableRange: true,
        disableStream: true,
        isEvalSupported: false,
    }).promise;

    const numPages = doc.numPages;
    const textParts: string[] = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ");
        textParts.push(pageText);
        page.cleanup();
    }

    await doc.destroy();

    const text = textParts.join("\n").trim();
    if (!text) throw new Error("No text content found in PDF");

    return { text, pages: numPages };
}


export interface ChatMessage {
    role: "user" | "model";
    text: string;
}

export async function chatWithCoach(
    message: string,
    history: ChatMessage[],
    resumeContext?: string,
    jobContext?: string
): Promise<string> {
    const client = getClient();

    let systemInstruction = `You are Zofu Coach, a friendly and knowledgeable career advisor. You help users with:
- Resume writing tips and best practices
- Job interview preparation strategies
- Career transition advice
- Salary negotiation tactics
- Job search strategies
- Professional development guidance

Keep your responses concise, practical, and actionable. Use bullet points when listing tips. Be encouraging but honest.`;

    if (resumeContext) {
        systemInstruction += `\n\nThe user has uploaded a resume with this content:\n${resumeContext.slice(0, 2000)}`;
    }
    if (jobContext) {
        systemInstruction += `\n\nThe user is targeting a job with this description:\n${jobContext.slice(0, 2000)}`;
    }

    const model = client.getGenerativeModel({
        model: getModel(),
        systemInstruction,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        },
    });

    const geminiHistory = history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await withRetry(() => chat.sendMessage(message));
    const reply = result.response.text();

    if (!reply) throw new Error("No response from coach");
    return reply;
}
