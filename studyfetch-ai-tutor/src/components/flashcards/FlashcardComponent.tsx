interface FlashcardProps {
    term: string;
    definition: string;
    isFlipped: boolean;
    currentIndex: number;
    totalCards?: number;
    onFlip: () => void;
}

export default function FlashcardComponent({
    term,
    definition,
    isFlipped,
    currentIndex,
    totalCards,
    onFlip
}: FlashcardProps) {
    return (
        <div
            onClick={onFlip}
            className={`p-4 border rounded my-1 cursor-pointer bg-white shadow-lg w-full max-w-md h-40 flex items-center justify-center text-center 
                transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]
                ${isFlipped ? 'flip-card-flipped' : ''}`}
        >
            <div className="transition-all duration-300 ease-in-out">
                {isFlipped ? definition : term}
            </div>
        </div>
    );
}