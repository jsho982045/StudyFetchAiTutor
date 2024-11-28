interface ChatInputProps {
    input: string;
    loading: boolean;
    onChange: (value: string) => void;
    onSend: () => void;
}

export default function ChatInput({ input, loading, onChange, onSend }: ChatInputProps) {
    return (
        <div className="p-4 bg-white shadow-lg flex">
            <input
                type="text"
                value={input}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-l-lg text-black font-bold"
                placeholder="Type a message..."
                disabled={loading}
            />
            <button
                onClick={onSend}
                className={`bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
            >
                {loading ? "Sending..." : "Send"}
            </button>
        </div>
    );
}