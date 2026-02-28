import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
        const { resumeText, jobDescription } = await request.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: "Resume text and job description are required" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                {
                    error: "API key not configured",
                    message:
                        "Please add your GEMINI_API_KEY to .env.local to use AI features.",
                },
                { status: 503 }
            );
        }

        const result = await generateInterviewQuestions(resumeText, jobDescription);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Interview questions error:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: "Failed to generate questions", message },
            { status: 500 }
        );
    }
}
