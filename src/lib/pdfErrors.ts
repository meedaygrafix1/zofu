export const PDF_AI_UNAVAILABLE =
    "This PDF needs AI text extraction, but the service is currently unavailable. " +
    "Please try again later, upload a PDF with selectable text, or contact support.";

export class PDFExtractionError extends Error {
    constructor(message: string, public readonly status: number, options?: ErrorOptions) {
        super(message, options);
        this.name = "PDFExtractionError";
    }
}

export function getPDFErrorResponse(error: unknown) {
    if (error instanceof PDFExtractionError) {
        return { message: error.message, status: error.status };
    }

    return {
        message: "Unable to read this PDF. Please try again or upload another PDF.",
        status: 500,
    };
}
