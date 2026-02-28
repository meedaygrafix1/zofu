async function test() {
    try {
        const payload = {
            messages: [
                {
                    parts: [{ type: "text", text: "How do I pass ATS screening?" }],
                    id: "4yBqZCmqhxyFfBta",
                    role: "user"
                }
            ],
            resumeContext: "Fake resume..."
        };

        const response = await fetch("http://127.0.0.1:3000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log("Status:", response.status);

        const text = await response.text();
        console.log("Body length:", text.length);
        console.log("Body preview:", text.slice(0, 500));
    } catch (e) {
        console.error("Fetch failed", e);
    }
}
test();
