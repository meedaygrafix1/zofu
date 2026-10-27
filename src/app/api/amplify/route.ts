import { getAIErrorResponse } from "@/lib/aiErrors";
import { NextRequest, NextResponse } from "next/server";
import { amplifyResume } from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (!user || authError) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        const { resumeText, jobDescription } = await request.json();

        if (!resumeText || !jobDescription) {
            return NextResponse.json(
                { error: "Resume text and job description are required" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY?.trim()) {
            return NextResponse.json(
                {
                    error: "AI_UNAVAILABLE",
                    message: "Resume optimization is currently unavailable. Please contact support or try again later.",
                },
                { status: 503 }
            );
        }

        const result = await amplifyResume(resumeText, jobDescription);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Amplification error:", error);
        const { code, message, status } = getAIErrorResponse(error);
        return NextResponse.json(
            { error: code, message },
            { status }
        );
    }
}
