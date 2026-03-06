const requestBody = {
    resumeText: "Experienced Software Engineer with 5 years of React and Node.js. Developed several web applications. Led a team of 3 developers.",
    jobDescription: "We are looking for a Senior Frontend Developer with strong React skills, leadership experience, and familiarity with Next.js and Tailwind CSS."
};

async function testAmplify() {
    try {
        console.log("Calling API on localhost:3000...");
        const res = await fetch("http://localhost:3000/api/amplify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const text = await res.text();
        console.log("Status:", res.status);
        try {
            const json = JSON.parse(text);
            console.log("API Success. Keys returned:", Object.keys(json));
            console.log("Cover letter present:", !!json.coverLetter);
            if (json.coverLetter) {
                console.log("Cover Letter slice:", json.coverLetter.substring(0, 50) + "...");
            }
        } catch (e) {
            console.error("Failed to parse API response as JSON. Raw text:", text.substring(0, 500) + "...");
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testAmplify();
