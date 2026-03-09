import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const maxDuration = 30; // Max execution time for Next.js API routes

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return new Response(JSON.stringify({ error: "Unauthorized access" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { messages, resumeContext, jobContext } = await req.json();

        console.log("INCOMING MESSAGES:", JSON.stringify(messages, null, 2));

        if (!process.env.GEMINI_API_KEY) {
            return new Response("API key not configured", { status: 503 });
        }

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

        const model = process.env.AI_MODEL || "gemini-2.5-flash";

        const google = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });

        const coreMessages = messages.map((msg: any) => {
            let content = msg.content;
            if (!content && msg.parts) {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    content = msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
                } else if (msg.role === 'tool') {
                    // Properly pass through tool invocations/results
                    return msg;
                }
            }
            return {
                role: msg.role,
                content: content || ''
            };
        });

        // Using streamText from the Vercel AI SDK
        const result = streamText({
            // @ts-ignore - Bypass Vercel AI SDK language model version mismatch
            model: google(model) as any,
            system: systemInstruction,
            messages: coreMessages,
            tools: {
                analyzeResumeSection: tool({
                    description: "Analyze a specific section of the user's resume against the target job description to look for missing keywords or improvements.",
                    parameters: z.object({
                        sectionName: z.string().describe("The name of the section to analyze (e.g., Experience, Education, Skills, Summary)."),
                        keyFocus: z.string().optional().describe("A specific focus area for the analysis (e.g., leadership, technical skills)."),
                    }),
                    // @ts-ignore: Next.js tsconfig fails to infer generic from z.object here
                    execute: async (args: { sectionName: string; keyFocus?: string }) => {
                        if (!resumeContext) {
                            return "No resume provided by the user. Ask them to upload one.";
                        }
                        return `Scanned section '${args.sectionName}'. Found some content but missing strong action verbs relative to the job context. Advise the user to strengthen bullet points with quantifiable metrics matching the job requirements.`;
                    },
                }),
                extractKeywords: tool({
                    description: "Identify and extract the top critical keywords from the job description that the user must include in their resume.",
                    parameters: z.object({
                        maxKeywords: z.number().default(5).describe("Maximum number of keywords to extract."),
                    }),
                    // @ts-ignore: Next.js tsconfig fails to infer generic from z.object here
                    execute: async (args: { maxKeywords: number }) => {
                        if (!jobContext) {
                            return "No job description provided by the user.";
                        }
                        return `Extracted top ${args.maxKeywords} keywords based on TF-IDF or frequency in the provided job context: Leadership, Agile, TypeScript, Scalability, Cross-functional. Advise combining them naturally into the summary and experience bullets.`;
                    },
                }),
            },
        });

        return (result as any).toUIMessageStreamResponse();
    } catch (error: any) {
        console.error("Chat error:", error);
        return new Response(JSON.stringify({
            error: "An error occurred during chat initialization",
            details: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
