import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/mongodb";
import { ObjectId } from "mongodb"; // Import ObjectId

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { db } = await connectToDatabase();
        const flashcardSet = await db.collection("flashcardSets").findOne({ _id: new ObjectId(params.id) }); // Convert to ObjectId

        if (!flashcardSet) {
            return NextResponse.json(
                { success: false, error: "Flashcard set not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            flashcards: flashcardSet.flashcards,
        });
    } catch (error: any) {
        console.error("Error fetching flashcard set:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
