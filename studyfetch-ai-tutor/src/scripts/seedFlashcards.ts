import clientPromise from "@/utils/mongodb";

async function seedDatabase() {
    try {
        const client = await clientPromise;
        const db = client.db('studyfetch');


        const flashcards = [
            {
                topic: "JavaScript Basics",
                flashcards: [
                    { term:"Tag", definition:"An HTML element used to define content." },
                    { term:"Attribute", definition:"Provides additional information about an HMTL element." },
                    { term:"DOM", definition:"The Document Object Model represents the page's structure as objects." }
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

        await db.collection('flashcardSets').insertMany(flashcards);

        console.log("Flashcards successfully seeded!");
        process.exit(0);   
    
    }catch (error) {
        console.error("Error seeding database: ", error);
        process.exit(1);
    }
}

seedDatabase();