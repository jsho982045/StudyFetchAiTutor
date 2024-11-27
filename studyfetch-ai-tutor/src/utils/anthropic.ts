const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY as string;

console.log("Loaded API Key: ", process.env.ANTHROPIC_API_KEY);

if(!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
}

export async function getAnthropicResponse(prompt: string): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/complete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY, // Always a string now
        },
        body: JSON.stringify ({
            model: "claude-v1",
            prompt: prompt,
            max_tokens_to_sample: 300,
        }),
    });

    if (!response.ok) {
        throw new Error('Anthropic API error: ${response.statusText}');
    }

    const data = await(response.json());
    return data.completion;
}