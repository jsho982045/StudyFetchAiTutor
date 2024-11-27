// src/app/api/anthropic/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        console.log("Prompt received:", prompt);

        // Mock AI response for development
        const mockCompletion = `This is a mock AI response for your input: "${prompt}"`;
        console.log("Mock completion:", mockCompletion);

        return NextResponse.json({ success: true, completion: mockCompletion });
    } catch (error: any) {
        console.error("Error in mock AI route:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
