"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatComponent({ 
  currentUserId, 
  receiverId, 
  initialMessages = [] 
}: { 
  currentUserId: string; 
  receiverId?: string; 
  initialMessages?: any[] 
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !receiverId) return;

    // TODO: Connect to Supabase to insert message
    const newMessage = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: input,
      created_at: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  if (!receiverId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Chap tomondan suxbatni tanlang
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                msg.sender_id === currentUserId
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Xabar yozing..."
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
