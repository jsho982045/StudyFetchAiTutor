interface FlashcardControlsProps {
    onNext: () => void;
    onPrevious: () => void;
    onFlip: () => void;
    currentIndex: number;
    totalCards: number;
}

export default function FlashcardControls({
    onNext,
    onPrevious,
    onFlip,
    currentIndex,
    totalCards
}: FlashcardControlsProps) {
    return (
        <div className="mt-4 flex flex-col items-center">
            <div className="flex space-x-4">
                <button
                    onClick={onPrevious}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Previous
                </button>
                <button
                    onClick={onNext}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Next
                </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
                Press spacebar to flip, arrow keys to navigate
            </div>
        </div>
    );
}