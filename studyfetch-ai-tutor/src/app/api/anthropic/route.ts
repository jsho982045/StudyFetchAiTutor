// src/app/api/anthropic/route.ts
import { NextResponse } from "next/server";
import { createFlashcardSet } from '@/utils/anthropic';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        console.log("Prompt received:", prompt);

        // Mock AI response for development
        const aiResponse = await createFlashcardSet(prompt);
        console.log("AI Response: ", aiResponse);

        return NextResponse.json({ success: true, content: aiResponse });
    } catch (error: any) {
        console.error("Error in  AI route:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
