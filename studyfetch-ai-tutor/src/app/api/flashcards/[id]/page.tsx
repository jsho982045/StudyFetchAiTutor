import { NextResponse } from "next/server";
import clientPromise from "@/utils/mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise;
        const db = client.db("studyfetch");

        const flashcardSet = await db.collection("flashcards").findOne({ _id: params.id });

        if (!flashcardSet) {
            return NextResponse.json({ success: false, error: "Flashcard set not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: flashcardSet });
    } catch (error: any) {
        console.error("Error fetching flashcard set:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
