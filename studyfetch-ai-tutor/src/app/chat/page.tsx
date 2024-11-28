"use client";

import { useEffect, useState } from "react";
import { createFlashcardSet } from "@/utils/anthropic";
import Link from "next/link";
import { CachedRouteKind } from "next/dist/server/response-cache";

interface FlashcardSet {
    _id: string; // MongoDB document ID
    topic: string;
}

interface Message {
    sender: "User" | "AI";
    text: string | { topic: string; flashcards: { term: string; definition: string }[] };
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);

    // Fetch flashcard sets from the database
    useEffect(() => {
        const fetchFlashcardSets = async () => {
            try {
                const response = await fetch("/api/flashcards");
                const data = await response.json();
                if (data.success) {
                    setFlashcardSets(data.data);
                } else {
                    console.error("Failed to fetch flashcard sets:", data.error);
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error("Error fetching flashcard sets:", error.message);
                } else {
                    console.error("Unknown error fetching flashcard sets:", error);
                }
            }
        };

        fetchFlashcardSets();
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        setMessages([...messages, { sender: "User", text: input }]);
        const userMessage = input;
        setInput("");
        setLoading(true);

        try {
            if (userMessage.toLowerCase().includes("create flashcards on")) {
                const topic = userMessage.replace(/create flashcards on/i, "").trim();
                setMessages((prev) => [
                    ...prev,
                    { sender: "AI", text: `Creating flashcards on "${topic}"...` },
                ]);

                const flashcardData = await createFlashcardSet(topic);

                // Save flashcards to DB
                const response = await fetch("/api/flashcards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(flashcardData),
                });

                if (response.ok) {
                    const result = await response.json();
                    setMessages((prev) => [
                        ...prev,
                        {
                            sender: "AI",
                            text: {
                                topic: flashcardData.topic,
                                flashcards: flashcardData.flashcards,
                            },
                        },
                    ]);

                    const updatedFlashcardSets = await fetch("/api/flashcards");
                    const updatedData = await updatedFlashcardSets.json();

                    if(updatedData.success) {
                        setFlashcardSets(updatedData.data);
                    }
                } else {
                    setMessages((prev) => [
                        ...prev,
                        { sender: "AI", text: "Failed to save flashcard set." },
                    ]);
                }
            } else {
                const response = await fetch("/api/anthropic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: userMessage }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setMessages((prev) => [
                        ...prev,
                        { sender: "AI", text: data.content },
                    ]);
                } else {
                    setMessages((prev) => [
                        ...prev,
                        { sender: "AI", text: "Error processing your request." },
                    ]);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error:", error.message);
                setMessages((prev) => [
                    ...prev,
                    { sender: "AI", text: "Sorry, something went wrong." },
                ]);
            } else {
                console.error("Unknown error:", error);
                setMessages((prev) => [
                    ...prev,
                    { sender: "AI", text: "An unknown error occurred." },
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-500 text-white flex flex-col">
                <h2 className="text-xl font-bold p-4">Flashcard Sets</h2>
                <ul className="flex-1 overflow-y-auto px-4">
                    {flashcardSets.map((set) => (
                        <li key={set._id} className="py-2 border-b border-blue-300">
                            <Link href={`/flashcards/${set._id}`} className="hover:underline">
                                {set.topic}
                            </Link>
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Chat Interface */}
            <div className="flex flex-col flex-1">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${
                                msg.sender === "User" ? "justify-end" : "justify-start"
                            } mb-4`}
                        >
                            <div
                                className={`${
                                    msg.sender === "User" ? "bg-blue-500" : "bg-green-500"
                                } text-white p-4 rounded-lg max-w-md shadow`}
                            >
                                {/* Check if the message text is a string */}
                                {typeof msg.text === "string" ? (
                                    msg.text
                                ) : (
                                    /* Handle non-string message content (e.g., flashcards) */
                                    Array.isArray(msg.text.flashcards) ? (
                                        <div>
                                            <h3 className="font-bold">Topic: {msg.text.topic}</h3>
                                            {msg.text.flashcards.map((card, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2 border rounded bg-gray-100 my-1"
                                                >
                                                    <strong className="font-bold text-black">{card.term}</strong>: {card.definition}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        "Invalid message content"
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-white shadow-lg flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-l-lg text-black font-bold"
                        placeholder="Type a message..."
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        className={`bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600 ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
