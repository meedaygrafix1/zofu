import { createMCPClient } from '@ai-sdk/mcp';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

async function main() {
    try {
        // 1. Create the MCP client with SSE transport
        const mcpClient = await createMCPClient({
            transport: {
                type: 'sse',
                url: 'https://mcp.context7.com/mcp',
            },
        });

        // 2. Use the tools provided by the MCP server
        console.log("Fetching tools...");
        const tools = await mcpClient.tools();
        console.log("Tools retrieved:", Object.keys(tools));

        const result = await generateText({
            model: google('gemini-2.5-flash'),
            tools: tools,
            prompt: 'Use the tools from context7 to help me find information about React hooks.',
            onFinish: async () => {
                // 3. Always close the connection when done
                await mcpClient.close();
            },
        });

        console.log("AI Response:", result.text);
    } catch (e) {
        console.error("ERROR:", e);
    }
}

main();
