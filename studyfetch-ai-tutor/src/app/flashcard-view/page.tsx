//src/app/flashcard-view/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardComponent from '@/components/flashcards/FlashcardComponent';

interface Flashcard {
    term: string;
    definition: string;
}

interface FlashcardSet {
    _id: string;
    topic: string;
    flashcards: Flashcard[];
}

export default function FlashcardViewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                const response = await fetch(`/api/flashcards/${params.id}`);
                const data = await response.json();
                if (data.success) {
                    setFlashcardSet(data.data);
                } else {
                    console.error("Failed to fetch flashcard set");
                }
            } catch (error) {
                console.error("Error fetching flashcard set:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcards();
    }, [params.id]);

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            switch (event.key) {
                case ' ':
                    event.preventDefault();
                    setIsFlipped(prev => !prev);
                    break;
                case 'ArrowLeft':
                    if (flashcardSet) {
                        setCurrentIndex(prev => 
                            prev > 0 ? prev - 1 : flashcardSet.flashcards.length - 1
                        );
                        setIsFlipped(false);
                    }
                    break;
                case 'ArrowRight':
                    if (flashcardSet) {
                        setCurrentIndex(prev => 
                            (prev + 1) % flashcardSet.flashcards.length
                        );
                        setIsFlipped(false);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [flashcardSet]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading flashcards...</div>
            </div>
        );
    }

    if (!flashcardSet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Flashcard set not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Chat
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {flashcardSet.topic}
                    </h1>
                    <div className="w-24"></div> {/* Spacer for alignment */}
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <FlashcardComponent
                        term={flashcardSet.flashcards[currentIndex].term}
                        definition={flashcardSet.flashcards[currentIndex].definition}
                        isFlipped={isFlipped}
                        currentIndex={currentIndex}
                        onFlip={() => setIsFlipped(!isFlipped)}
                    />

                    <div className="mt-6 flex justify-between items-center">
                        <button
                            onClick={() => {
                                setCurrentIndex(prev => 
                                    prev > 0 ? prev - 1 : flashcardSet.flashcards.length - 1
                                );
                                setIsFlipped(false);
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Previous
                        </button>
                        <div className="text-gray-600">
                            {currentIndex + 1} of {flashcardSet.flashcards.length}
                        </div>
                        <button
                            onClick={() => {
                                setCurrentIndex(prev => 
                                    (prev + 1) % flashcardSet.flashcards.length
                                );
                                setIsFlipped(false);
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Next
                        </button>
                    </div>

                    <div className="text-sm text-gray-500 text-center mt-4">
                        Press spacebar to flip, arrow keys to navigate
                    </div>
                </div>
            </div>
        </div>
    );
}