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
