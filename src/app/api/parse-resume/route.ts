import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
            console.warn("[parse-resume] Auth warning:", authError.message);
        }

        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are supported" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const { text, pages } = await extractTextFromPDF(buffer);

        return NextResponse.json({
            text,
            pages,
            info: {},
        });
    } catch (error: any) {
        console.error("PDF parsing error:", error?.message || error);
        return NextResponse.json(
            { error: `Failed to parse PDF: ${error?.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
