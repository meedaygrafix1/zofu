import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";

// Force Node.js runtime — this route uses native require() to load pdf-parse
// and must never run on the Edge runtime which lacks Node module support.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.warn("[amplify/parse] Auth warning:", authError.message);
        }

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are supported" },
                { status: 400 }
            );
        }

        // 10MB limit
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size must be under 10MB" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { text, pages } = await extractTextFromPDF(buffer);

        return NextResponse.json({ text, pages });
    } catch (error) {
        console.error("PDF parse error:", error);
        const message =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: "Failed to parse PDF", message },
            { status: 500 }
        );
    }
}
