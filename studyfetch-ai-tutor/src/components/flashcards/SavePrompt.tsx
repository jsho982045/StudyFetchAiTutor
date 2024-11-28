//src/components/flashcards/SavePrompt.tsx

interface SavePromptProps {
    onSave: () => void;
    onCancel: () => void;
}

export default function SavePrompt({ onSave, onCancel }: SavePromptProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
            <p className="text-lg mb-4">Would you like to save this flashcard set?</p>
            <div className="flex space-x-4">
                <button
                    onClick={onSave}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}