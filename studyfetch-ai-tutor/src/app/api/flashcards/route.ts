import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongodb";

export async function GET() {
    try {
        const { db } = await connectToDatabase();
        const flashcardSets = await db.collection("flashcardSets").find({}).toArray();

        return NextResponse.json({
            success: true,
            data: flashcardSets.map((set) => ({
                _id: set._id.toString(),
                topic: set.topic,
            })),
        });
    } catch (error: any) {
        console.error("Error fetching flashcard sets:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { topic, flashcards } = await req.json();
        if (!topic || !flashcards) {
            return NextResponse.json(
                { success: false, error: "Invalid data" },
                { status: 400 }
            );
        }
        const { db } = await connectToDatabase();

        const result = await db.collection("flashcardSets").insertOne({ topic, flashcards });

        return NextResponse.json({
            success: true,
            data: { _id: result.insertedId.toString(), topic, flashcards },
        });
    } catch (error: any) {
        console.error("Error saving flashcard set:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
