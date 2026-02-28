import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/ai";

export async function POST(request: NextRequest) {
    try {
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
