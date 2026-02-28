import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import fs from "fs";

async function test() {
    const google = createGoogleGenerativeAI({ apiKey: "test" });
    const result = streamText({
        model: google("gemini-2.5-flash"),
        prompt: "hello"
    });
    const proto = Object.getPrototypeOf(result);
    fs.writeFileSync('test_keys.json', JSON.stringify(Object.getOwnPropertyNames(proto), null, 2));
}
test().catch(console.error);
