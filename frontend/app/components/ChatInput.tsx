"use client";

import { useState, useRef } from "react";
import { apiRequest } from "../lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "pdf";
};

type ChatInputProps = {
  activeConversationId: string | null;
  disabled: boolean;
  onUserMessage: (msg: Message) => void;
  onConversationCreated: (id: string) => void;
  onUploadStart: () => void;
  onProcessingEnd: () => void;
};
export default function ChatInput({
  activeConversationId,
  disabled,
  onUserMessage,
  onConversationCreated,
  onUploadStart,
  onProcessingEnd,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    onUploadStart();

    // 🔹 FIX: Keep a local track of the ID to prevent duplicates in the loop
    let currentId: string | null = activeConversationId;

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("files", file); // 🔹 Note: Backend usually expects "file", not "files"

        if (currentId) {
          formData.append("conversation_id", currentId);
        }

        const res = await apiRequest("/upload-pdf", "POST", formData);

        // 🔹 FIX: Update local currentId immediately so the NEXT file uses it
        if (!currentId && res.conversation_id) {
          currentId = res.conversation_id;
          onConversationCreated(res.conversation_id);
        }
      }
    } catch (err) {
      console.error("PDF upload failed:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      onProcessingEnd(); // This triggers the thinking/polling state
    }
  };

const handleSend = async () => {
  if (!text.trim() || disabled) return;

  const q = text;
  setText("");

  onUserMessage({ role: "user", content: q, type: "text" });

  // ✅ correct semantic signal
  onUploadStart();      // uploading/processing begins
  onProcessingEnd();   // explicitly tells ChatPage to start thinking

  try {
    const res = await apiRequest("/query-pdf", "POST", {
      question: q,
      conversation_id: activeConversationId,
    });

    if (res.conversation_id && !activeConversationId) {
      onConversationCreated(res.conversation_id);
    }
  } catch (err) {
    console.error("Query failed:", err);
  }
};

  return (
    <div className="w-full mx-auto flex items-end gap-1.5 sm:gap-2 bg-white border-2 border-neutral-200 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 focus-within:border-neutral-400 focus-within:shadow-lg transition-all shadow-md hover:shadow-lg max-w-4xl">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf"
        multiple
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 sm:p-3 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg sm:rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        title="Attach PDF"
        aria-label="Attach PDF"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4 sm:w-5 sm:h-5"
        >
          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.51a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      <textarea
        rows={1}
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Ask a question..."
        className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm py-2 sm:py-3 px-1 resize-none max-h-24 sm:max-h-32 text-neutral-900 placeholder-neutral-400 disabled:opacity-50 min-w-0"
      />

      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="p-2 sm:p-3 bg-black text-white rounded-lg sm:rounded-xl hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all shadow-sm font-medium shrink-0 active:scale-95"
        aria-label="Send message"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4 sm:w-4.5 sm:h-4.5"
        >
          <path d="m5 12 7-7 7 7"/>
          <path d="M12 19V5"/>
        </svg>
      </button>
    </div>
  );
}
