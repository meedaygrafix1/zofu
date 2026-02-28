import fs from 'fs';
fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        messages: [{ role: "user", content: "Hello, this is a test" }],
        resumeContext: "",
        jobContext: ""
    })
}).then(async r => {
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('test_error.json', text);
    console.log("Saved to test_error.json");
}).catch(console.error);
