"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Flashcard {
    term: string;
    definition: string;
}

export default function FlashcardPage({ params }: { params: { id: string } }) {
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                const response = await fetch(`/api/flashcards/${params.id}`);
                const data = await response.json();
                if (data.success) {
                    setFlashcards(data.flashcards);
                } else {
                    console.error("Failed to fetch flashcards:", data.error);
                }
            } catch (error) {
                console.error("Error fetching flashcards:", error);
            }
        };

        fetchFlashcards();
    }, [params.id]);

    const handleNext = () => {
        setFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    };

    const handlePrevious = () => {
        setFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    };

    const handleFlip = () => {
        setFlipped((prev) => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <button
                onClick={() => router.push("/chat")}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                Back to Chat
            </button>
            {flashcards.length > 0 ? (
                <div className="flex flex-col items-center">
                    <div
                        onClick={handleFlip}
                        className="w-80 h-40 p-4 bg-white border shadow-lg rounded flex justify-center items-center text-center cursor-pointer"
                    >
                        {flipped
                            ? flashcards[currentIndex].definition
                            : flashcards[currentIndex].term}
                    </div>
                    <div className="mt-4 flex justify-between w-full max-w-xs">
                        <button
                            onClick={handlePrevious}
                            className="px-4 py-2 bg-gray-300 text-black rounded"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-4 py-2 bg-gray-300 text-black rounded"
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <p>Loading flashcards...</p>
            )}
        </div>
    );
}
