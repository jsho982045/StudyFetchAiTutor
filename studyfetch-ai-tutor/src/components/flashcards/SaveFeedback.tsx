interface SaveFeedbackProps {
    saving: boolean;
    error: string | null;
}

export default function SaveFeedback({ saving, error }: SaveFeedbackProps) {
    return (
        <div className="fixed bottom-20 right-4 pointer-events-none">
            {saving && (
                <div className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg 
                    animate-slideIn">
                    Saving flashcard set...
                </div>
            )}
            {error && (
                <div className="bg-red-500 text-white px-4 py-2 rounded shadow-lg 
                    animate-slideIn">
                    {error}
                </div>
            )}
        </div>
    );
}