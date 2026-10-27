import type { PDFParse } from "pdf-parse";

// An empty text layer can mean either a blank page or a scan. Render only
// those pages so we never silently drop scanned content from a mixed PDF.
export async function isPDFPageBlank(parser: PDFParse, pageNumber: number) {
    const result = await parser.getScreenshot({
        partial: [pageNumber],
        desiredWidth: 256,
        imageBuffer: true,
        imageDataUrl: false,
    });
    const page = result.pages[0];
    if (!page?.data.length) return false;

    const { createCanvas, loadImage } = await import("@napi-rs/canvas");
    const image = await loadImage(Buffer.from(page.data));
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
            return false;
        }
    }
    return true;
}
