"use client";

import { useEffect, useState } from "react";
import { createFlashcardSet } from "@/utils/anthropic";
import Link from "next/link";

interface Flashcard {
    term: string;
    definition: string;
    flipped?: boolean;
}

interface FlashcardSet {
    _id: string; // MongoDB document ID
    topic: string;
    flashcards?: Flashcard[];
}

interface Message {
    sender: "User" | "AI";
    text: string | { topic: string; flashcards: Flashcard[] };
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [lastFlashcardSet, setLastFlashcardSet] = useState<FlashcardSet | null>(null);

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
                console.error("Error fetching flashcard sets:", error);
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
    
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: "AI",
                        text: {
                            topic: flashcardData.topic,
                            flashcards: flashcardData.flashcards.map((card) => ({
                                ...card,
                                flipped: false,
                            })),
                        },
                    },
                ]);
    
                // Save flashcard set to MongoDB
                const response = await fetch("/api/flashcards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ topic: flashcardData.topic, flashcards: flashcardData.flashcards }),
                });
    
                if (response.ok) {
                    const savedSet = await response.json();
                    console.log("Saved Set:", savedSet); // Debugging log
                    setFlashcardSets((prev) => [...prev, savedSet.data]);
                    setLastFlashcardSet(savedSet.data);
                } else {
                    console.error("Failed to save flashcard set");
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
            console.error("Error:", error);
            setMessages((prev) => [
                ...prev,
                { sender: "AI", text: "Sorry, something went wrong." },
            ]);
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
                            <Link href={`/flashcard-view/${set._id}`} className="hover:underline">
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
                                } text-black p-4 rounded-lg max-w-md shadow`}
                            >
                                {typeof msg.text === "string" ? (
                                    msg.text
                                ) : (
                                    Array.isArray(msg.text.flashcards) && (
                                        <div>
                                            <h3 className="font-bold">Topic: {msg.text.topic}</h3>
                                            {msg.text.flashcards.map((card, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-2 border rounded my-1 cursor-pointer ${
                                                        card.flipped
                                                            ? "bg-gray-300"
                                                            : "bg-gray-100"
                                                    }`}
                                                >
                                                    {card.flipped ? card.definition : card.term}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Render "Save Flashcards" button if a flashcard set was created */}
                    {lastFlashcardSet && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => {
                                    fetch("/api/flashcards", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            topic: lastFlashcardSet.topic,
                                            flashcards: lastFlashcardSet.flashcards,
                                        }),
                                    })
                                        .then((res) => res.json())
                                        .then((data) => {
                                            if (data.success) {
                                                alert("Flashcard set saved successfully!");
                                            } else {
                                                alert("Failed to save flashcard set.");
                                            }
                                        });
                                }}
                                className="px-4 py-2 bg-green-500 text-white rounded"
                            >
                                Save Flashcard Set
                            </button>
                        </div>
                    )}
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
