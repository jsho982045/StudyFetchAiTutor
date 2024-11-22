"use client";

import { useState } from 'react';

interface Message {
    sender: 'User' | 'AI';
    text: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        // Append user message to chat
        setMessages([...messages, { sender: 'User', text: input }]);
        const userMessage = input; // Save the input value for AI response
        setInput('');

        // Simulate AI response for now
        setTimeout(() => {
            setMessages((prev) => [...prev, { sender: 'AI', text: `Here's a response for "${userMessage}"` }]);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
            <div className="w-full max-w-3xl bg-white shadow-md rounded-lg flex flex-col p-4">
                <div className="flex-1 overflow-y-auto mb-4">
                    {messages.map((msg, index) => (
                        <p
                            key={index}
                            className={msg.sender === 'User' ? 'text-blue-600' : 'text-green-600'}
                        >
                            {msg.sender}: {msg.text}
                        </p>
                    ))}
                </div>
                <div className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-l-lg"
                        placeholder="Type a message..."
                    />
                    <button
                        onClick={handleSend}
                        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
