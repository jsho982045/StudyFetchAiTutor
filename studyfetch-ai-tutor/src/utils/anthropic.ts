const ANTHROPIC_API_KEY = process.env.ANTHROPIC_TEST_API_KEY || process.env.ANTHROPIC_API_KEY;
console.log("ANTHROPIC_API_KEY Loaded:", ANTHROPIC_API_KEY);

if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
}

export async function createFlashcardSet(prompt: string): Promise<{ topic: string; flashcards: { term: string; definition: string }[] }> {
    console.log("Using API Key: ", ANTHROPIC_API_KEY);
    console.log("Prompt for flashcards: ", prompt);

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("anthropic-version", "2023-06-01");
    if (ANTHROPIC_API_KEY) {
        headers.append("x-api-key", ANTHROPIC_API_KEY);
    }

    const formattedPrompt = `
    Based on the topic "${prompt}", please respond with flashcard data in the following JSON format:

    [
        { "term": "Example Term 1", "definition": "Example Definition 1" },
        { "term": "Example Term 2", "definition": "Example Definition 2" }
    ]

    Do not include any other text, explanations, or formatting outside of this JSON structure.
    `;

    const body = JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 300,
        messages: [
            { role: "user", content: formattedPrompt },
        ],
    });

    console.log("Request body: ", body);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Anthropic API error: ", errorText);
        throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Full API Response: ", data);

    // Extract the content text from the response
    const rawContent = data.content?.[0]?.text || data.content || "";
    console.log("Extracted content: ", rawContent);

    // Parse the content as JSON
    let flashcards;
    try {
        flashcards = JSON.parse(rawContent);
        if (!Array.isArray(flashcards)) {
            throw new Error("Invalid flashcard format: Expected an array.");
        }
    } catch (error) {
        console.error("Failed to parse flashcard data. Response content: ", rawContent);
        throw new Error("Failed to parse flashcard data. Ensure the API is returning valid JSON.");
    }

    return { topic: prompt, flashcards };
}
