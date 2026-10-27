import { isAIPaymentRequiredError, isAISpendLimitError } from "./aiErrors";
import { PDF_AI_UNAVAILABLE, PDFExtractionError } from "./pdfErrors";
import { isPDFPageBlank } from "./pdfBlankPages";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from "jsonrepair";
import {
    SYSTEM_PROMPT,
    AMPLIFY_PROMPT,
    INTERVIEW_PROMPT,
    buildPrompt,
} from "./prompts";

function getClient() {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    return new GoogleGenerativeAI(apiKey);
}

function getModel() {
    const model = process.env.AI_MODEL;
    return model || "gemini-2.5-flash";
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
    baseDelayMs: number = 2000
): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await operation();
        } catch (error: any) {
            if (isAISpendLimitError(error) || isAIPaymentRequiredError(error)) throw error;
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

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface AmplifyResult {
    amplifiedResume: string;
    atsScore: number;
    originalAtsScore: number; // ATS score of the original resume before optimization
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
            maxOutputTokens: 16384, // Increased: cover letter + full resume needs more headroom
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
): Promise<{ text: string; pages: number; tokenUsage?: TokenUsage }> {
    // Ordinary PDFs can be read without an AI request. Keep Gemini as a
    // fallback for scans (including PDFs with a mix of text and scanned pages).
    let pages = 1;
    try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: pdfBuffer });
        try {
            const result = await parser.getText({ pageJoiner: "" });
            pages = result.total;
            const text = result.text.trim();
            let needsOCR = false;
            for (const page of result.pages) {
                if (!page.text.trim() && !(await isPDFPageBlank(parser, page.num))) {
                    needsOCR = true;
                    break;
                }
            }
            if (text && !needsOCR) {
                return { text, pages };
            }
            if (!text && !needsOCR) {
                throw new PDFExtractionError("No readable text found in PDF. Please upload a document containing text.", 422);
            }
        } finally {
            // Cleanup must not discard successfully extracted text.
            await parser.destroy().catch(() => console.warn("[PDF] Parser cleanup failed."));
        }
    } catch (error) {
        if (error instanceof PDFExtractionError) throw error;
        if (error instanceof Error && error.name === "PasswordException") {
            throw new PDFExtractionError("This PDF is password-protected. Please upload an unlocked copy.", 422, { cause: error });
        }
        if (error instanceof Error && error.name === "InvalidPDFException") {
            throw new PDFExtractionError("This PDF is damaged or invalid. Please export it again and retry.", 422, { cause: error });
        }
        console.warn("[PDF] Local extraction failed; trying AI extraction.", error instanceof Error ? error.name : "Unknown error");
    }

    if (!process.env.GEMINI_API_KEY?.trim()) {
        throw new PDFExtractionError(PDF_AI_UNAVAILABLE, 503, {
            cause: new Error("GEMINI_API_KEY is not configured"),
        });
    }

    try {
        const client = getClient();
        const model = client.getGenerativeModel({ model: getModel() });
        const result = await withRetry(() =>
            model.generateContent([
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: pdfBuffer.toString("base64"),
                    },
                },
                "Extract all text content from this PDF document. Return ONLY the raw text content, preserving paragraphs and structure. Do not add any commentary, headings, or formatting of your own.",
            ])
        );

        const text = result.response.text()?.trim();
        const usage = result.response.usageMetadata;

        if (!text) {
            throw new PDFExtractionError(
                "No readable text found in PDF. The file may be empty or corrupted.",
                422
            );
        }

        return {
            text,
            pages,
            tokenUsage: {
                inputTokens: usage?.promptTokenCount ?? 0,
                outputTokens: usage?.candidatesTokenCount ?? 0,
                totalTokens: usage?.totalTokenCount ?? 0,
            },
        };
    } catch (error) {
        if (error instanceof PDFExtractionError) throw error;
        // This also covers blocked responses whose text() accessor throws.
        throw new PDFExtractionError(PDF_AI_UNAVAILABLE, 503, { cause: error });
    }
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
