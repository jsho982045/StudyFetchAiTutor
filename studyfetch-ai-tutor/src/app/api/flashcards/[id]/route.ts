import { NextResponse } from "next/server";
import clientPromise from "@/utils/mongodb";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Ensure params.id is available
        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing id parameter in request" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("studyfetch");

        // Fetch the flashcard set by ID
        const flashcardSet = await db
            .collection("flashcards")
            .findOne({ _id: id });

        if (!flashcardSet) {
            return NextResponse.json(
                { success: false, error: "Flashcard set not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: flashcardSet });
    } catch (error: any) {
        console.error("Error fetching flashcard set:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
