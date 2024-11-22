import { NextResponse } from 'next/server';
import clientPromise from '@/utils/mongodb';


export async function GET() {
    try{
        const client = await clientPromise;
        const db = client.db('studyfetch'); 
        const flashcards = await db.collection('flashcards').find({}).toArray();

        return NextResponse.json({ success: true, data: flashcards });   
    }
    catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500});
    }
}

export async function POST(){
    try{
        const client = await clientPromise;
        const db = client.db('studyfetch');

        const flashcards = [
            {
                topic: "JavaScript Basics",
                flashcards: [
                    { term:"Closure", definition:"A function that remembers its outer variables." },
                    { term:"Hoisting", definition:"The process of moving variable declarations to the top of the scope." },
                    { term: "Promise", definition:"An object representing a future completion (or failure) of an asynchronous operation." }
                ]
            },
            {
                topic: "HTML Basics",
                flashcards: [
                    { term:"Tag", definition:"An HTML element used to define content." },
                    { term:"Attribute", definition:"Provides additional information about an HTML element." },
                    { term:"DOM", definition:"The Document Object Model represents the page's structure as objects." }
                ]
            }
        ];

        await db.collection('flashcards').insertMany(flashcards);

        return NextResponse.json({ success: true, message:"Flashcards successfully seeded!" });
    } catch (error: any){
        return NextResponse.json({ success: false, error: error.message}, { status: 500});
    }
}