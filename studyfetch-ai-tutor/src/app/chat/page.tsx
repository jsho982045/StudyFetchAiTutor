//src/app/chat/page.tsx

"use client";

import { useEffect, useState } from "react";
import { createFlashcardSet } from "@/utils/anthropic";
import ChatInput from "@/components/chat/ChatInput";
import ChatMessage from "@/components/chat/ChatMessage";
import SaveFeedback from "@/components/flashcards/SaveFeedback";
import Link from "next/link";

interface Message {
    sender: "User" | "AI";
    text: string | { topic: string; flashcards: Array<{ term: string; definition: string }> };
    type?: "flashcards" | "save-prompt" | "regular";
}

interface FlashcardSet {
    _id: string;
    topic: string;
    flashcards: Array<{ term: string; definition: string }>;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [saveState, setSaveState] = useState<{ saving: boolean, error: string | null }>({
        saving: false,
        error: null
    });

    // Fetch existing flashcard sets
    useEffect(() => {
        const fetchFlashcardSets = async () => {
            try {
                const response = await fetch("/api/flashcards");
                const data = await response.json();
                if (data.success) {
                    setFlashcardSets(data.data);
                }
            } catch (error) {
                console.error("Error fetching flashcard sets:", error);
            }
        };
        fetchFlashcardSets();
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const currentMessage = messages.find(msg => 
                msg.type === "flashcards" && typeof msg.text !== "string"
            );
            
            if (!currentMessage || typeof currentMessage.text === "string") return;

            const flashcards = currentMessage.text.flashcards;
            
            switch (event.key) {
                case 'ArrowLeft':
                    setCurrentFlashcardIndex(prev => 
                        prev > 0 ? prev - 1 : flashcards.length - 1
                    );
                    setIsFlipped(false);
                    break;
                case 'ArrowRight':
                    setCurrentFlashcardIndex(prev => 
                        (prev + 1) % flashcards.length
                    );
                    setIsFlipped(false);
                    break;
                case ' ':
                    event.preventDefault();
                    setIsFlipped(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [messages]);

    const handleSave = async (flashcardSet: { topic: string; flashcards: Array<{ term: string; definition: string }> }) => {
        setSaveState({ saving: true, error: null });
        try {
            const response = await fetch("/api/flashcards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(flashcardSet),
            });

            if (response.ok) {
                const data = await response.json();
                setFlashcardSets(prev => [...prev, data.data]);
                setMessages(prev => [
                    ...prev,
                    {
                        sender: "AI",
                        text: "Flashcard set saved successfully! You can access it from the sidebar.",
                        type: "regular"
                    }
                ]);
            } else {
                throw new Error("Failed to save flashcard set");
            }
        } catch (error) {
            setSaveState({ saving: false, error: 'Failed to save flashcard set' });
        } finally {
            setSaveState({ saving: false, error: null });
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
    
        const userMessage = input;
        setInput("");
        console.log("1. User message added")
        setMessages(prev => [...prev, { sender: "User", text: userMessage, type: "regular" }]);
        setLoading(true);
    
        try {
            if (userMessage.toLowerCase().includes("create flashcards on")) {
                const topic = userMessage.replace(/create flashcards on/i, "").trim();
                console.log("2. Creating flashcards message")
                // Add the "Creating..." message
                setMessages(prev => [
                    ...prev,
                    { 
                        sender: "AI", 
                        text: `Creating flashcards on "${topic}"...`,
                        type: "regular"
                    }
                ]);
                console.log("3. Awaiting flashcard creation");
    
                // Wait for flashcard creation
                const flashcardData = await createFlashcardSet(topic);
                console.log("4. Flashcard data received:", flashcardData);

                // Add flashcard set AND save prompt messages together
                setMessages(prev => {
                    console.log("5. Setting messages with flashcards and save prompt");
                    return [
                        ...prev,
                        {
                            sender: "AI",
                            text: flashcardData,
                            type: "flashcards"
                        },
                        {   // Add save prompt immediately after flashcards
                            sender: "AI",
                            text: "Would you like to save this flashcard set to your collection?",
                            type: "save-prompt"
                        }
                    ];
                });
            } else {
                // Your existing code for regular messages
                const response = await fetch("/api/anthropic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: userMessage }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setMessages(prev => [
                        ...prev,
                        {
                            sender: "AI",
                            text: data.content,
                            type: "regular"
                        }
                    ]);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setMessages(prev => [
                ...prev,
                {
                    sender: "AI",
                    text: "Sorry, something went wrong. Please try again.",
                    type: "regular"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex min-h-screen bg-gray-50">
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

            <div className="flex flex-col flex-1">
                <div className="flex-1 overflow-y-auto p-6">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message}
                            currentIndex={currentFlashcardIndex}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped(!isFlipped)}
                            onNext={() => {
                                setCurrentFlashcardIndex((prev) => {
                                    if (typeof message.text !== 'string') {
                                        return (prev + 1) % message.text.flashcards.length;
                                    }
                                    return prev;
                                });
                                setIsFlipped(false);
                            }}
                            onPrevious={() => {
                                setCurrentFlashcardIndex((prev) => {
                                    if (typeof message.text !== 'string') {
                                        return prev > 0 ? prev - 1 : message.text.flashcards.length - 1;
                                    }
                                    return prev;
                                });
                                setIsFlipped(false);
                            }}
                            onSave={() => {
                                if (typeof message.text !== 'string') {
                                    handleSave(message.text);
                                }
                            }}
                            onCancel={() => {
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        sender: "AI",
                                        text: "OK, I won't save the flashcard set. Let me know if you need anything else!",
                                        type: "regular"
                                    }
                                ]);
                            }}
                        />
                    ))}
                </div>
                <ChatInput
                    input={input}
                    loading={loading}
                    onChange={setInput}
                    onSend={handleSend}
                />
            </div>
            <SaveFeedback
                saving={saveState.saving}
                error={saveState.error}
            />
        </div>
    );
}