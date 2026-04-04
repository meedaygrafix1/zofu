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

        // Determine Pro status from user metadata.
        // Set user_metadata.is_pro = true in Supabase when billing goes live.
        const isPro = user.user_metadata?.is_pro === true;

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

        const result = await amplifyResume(resumeText, jobDescription);

        // Gate: cover letter is a Pro-only feature.
        // Strip it from the response for free-tier users so the client
        // can show the upsell overlay instead.
        if (!isPro) {
            result.coverLetter = "";
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Amplification error:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: "Amplification failed", message },
            { status: 500 }
        );
    }
}
