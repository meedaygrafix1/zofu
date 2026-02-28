import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
// if GEMINI_API_KEY is used instead of GOOGLE_GENERATIVE_AI_API_KEY
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

async function test() {
    try {
        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: "You are a helpful assistant.",
            messages: [{ role: "user", content: "hello" }],
        });

        const reader = result.textStream.getReader();
        console.log("Stream started...");
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log("Stream finished.");
                break;
            }
            console.log("Chunk:", value);
        }
    } catch (e) {
        console.error("Error directly caught:", e);
    }
}
test();
