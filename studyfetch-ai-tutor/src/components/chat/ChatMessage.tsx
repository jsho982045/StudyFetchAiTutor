import { useState } from 'react';
import FlashcardComponent from '@/components/flashcards/FlashcardComponent';
import FlashcardControls from '@/components/flashcards/FlashcardControls';
import SavePrompt from '@/components/flashcards/SavePrompt';

interface ChatMessageProps {
    message: {
        sender: 'User' | 'AI';
        text: string | { topic: string; flashcards: Array<{ term: string; definition: string }> };
        type?: 'flashcards' | 'save-prompt' | 'regular';
    };
    onSave?: () => void;
    onCancel?: () => void;
    currentIndex?: number;
    isFlipped?: boolean;
    onFlip?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
}

export default function ChatMessage({
    message,
    onSave,
    onCancel,
    currentIndex = 0,
    isFlipped = false,
    onFlip = () => {},
    onNext = () => {},
    onPrevious = () => {},
}: ChatMessageProps) {
    const isFlashcardMessage = (text: any): text is { topic: string; flashcards: Array<{ term: string; definition: string }> } => {
        return text && typeof text === 'object' && 'flashcards' in text;
    };

    // Handle save prompt message
    if (message.type === 'save-prompt') {
        return (
            <div className="flex justify-start mb-4">
                <div className="bg-green-100 text-black p-4 rounded-lg max-w-md shadow">
                    <p className="mb-3">{message.text as string}</p>
                    <div className="flex space-x-4">
                        <button
                            onClick={onSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Yes, Save
                        </button>
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            No, Thanks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle flashcard message
    if (isFlashcardMessage(message.text)) {
        const flashcardSet = message.text;
        return (
            <div className="flex justify-start mb-6">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">
                        Topic: {flashcardSet.topic}
                    </h3>
                    <div className="relative">
                        <FlashcardComponent
                            term={flashcardSet.flashcards[currentIndex].term}
                            definition={flashcardSet.flashcards[currentIndex].definition}
                            currentIndex={currentIndex}
                            isFlipped={isFlipped}
                            totalCards={flashcardSet.flashcards.length}
                            onFlip={onFlip}
                        />
                        <div className="mt-4 flex justify-between items-center">
                            <button
                                onClick={onPrevious}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Previous
                            </button>
                            <span className="text-gray-600">
                                {currentIndex + 1} / {flashcardSet.flashcards.length}
                            </span>
                            <button
                                onClick={onNext}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Next
                            </button>
                        </div>
                        <div className="text-sm text-gray-500 text-center mt-2">
                            Press spacebar to flip card, arrow keys to navigate
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Handle regular message
    return (
        <div className={`flex ${message.sender === 'User' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-md rounded-lg p-4 ${message.sender === 'User' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                {message.text as string}
            </div>
        </div>
    );
}