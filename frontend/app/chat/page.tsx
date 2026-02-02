"use client";

import { useState, useEffect, useRef } from "react";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import Sidebar from "../components/SideBar";
import { apiRequest } from "../lib/api";
import Image from "next/image";

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll when messages change or thinking state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSelectConversation = async (id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    setActiveConversationId(id);
    setIsThinking(false);
    setIsUploading(false);

    try {
      const history = await apiRequest(`/messages/${id}`, "GET");
      setMessages(history);
    } catch (err) {
      console.error("Failed to load history:", err);
    }

    setSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    setActiveConversationId(null);
    setMessages([]);
    setIsThinking(false);
    setIsUploading(false);
    setSidebarOpen(false);
  };

  const refreshMessages = async (id: string) => {
    try {
      const history = await apiRequest(`/messages/${id}`, "GET");
      setMessages(history);

      const lastMessage = history[history.length - 1];

      // ✅ Stop when ANY real assistant response arrives
      if (lastMessage?.role === "assistant") {
        setIsThinking(false);
        setIsUploading(false);

        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }

    } catch (err) {
      console.error("Failed to refresh messages", err);
    }
  };

  // ✅ Poll ONLY when we have a conversationId
  useEffect(() => {
    if (!isThinking || !activeConversationId) return;

    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      refreshMessages(activeConversationId);
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isThinking, activeConversationId]);

  return (
    <div className="flex h-screen bg-white text-black overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar onSelect={handleSelectConversation} onNewChat={handleNewChat} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 relative bg-linear-to-b from-neutral-50 to-white w-full">
        {/* Header */}
        <div className="h-14 sm:h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-6 z-10 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Logo and Title */}
            <div className="flex items-center gap-2">
              <h1 className="font-semibold tracking-tight text-neutral-900 text-sm sm:text-base truncate max-w-37.5 sm:max-w-none">
                 CortexAI
              </h1>
            </div>
          </div>

          {(isUploading || isThinking) && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium text-neutral-600">
              <div className="flex gap-0.5 sm:gap-1">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              </div>
              <span className="hidden sm:inline">
                {isUploading ? "AI is indexing PDF..." : "AI is processing..."}
              </span>
              <span className="sm:hidden">
                {isUploading ? "Indexing..." : "Processing..."}
              </span>
            </div>
          )}
        </div>

        {/* Message List */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 scroll-smooth"
        >
          {messages.length === 0 && !isUploading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-23 h-23 sm:w-25 sm:h-25 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                
              <Image 
                src="/pdf.svg" 
                alt="pdf" 
                width={24} 
                height={24}
                className="w-12 h-12 sm:w-13 sm:h-13"
              />
              </div>
              <h2 className="font-semibold text-neutral-900 text-base sm:text-lg">Ready to analyze</h2>
              <p className="text-neutral-500 text-xs sm:text-sm max-w-xs mt-2">
                Upload one or multiple PDFs to begin your intelligent document analysis.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage key={i} role={m.role} content={m.content} type={m.type} />
          ))}

          {/* 🤖 "Thinking" Animation */}
          {isThinking && (
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 shadow-md border border-neutral-700 overflow-hidden">
                  <Image
                    src="/favicon.ico"
                    alt="AI"
                    width={20}
                    height={20}
                    className="w-4 h-4 sm:w-5 sm:h-5 invert"
                  />
                </div>
                <div className="bg-white border border-neutral-200 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-neutral-300 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse [animation-delay:200ms]"></div>
                    <div className="w-2 h-2 bg-neutral-500 rounded-full animate-pulse [animation-delay:400ms]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invisible div at the bottom for scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-3 sm:p-6 bg-white border-t border-neutral-200">
          <ChatInput
            activeConversationId={activeConversationId}
            disabled={isUploading || isThinking}
            onUploadStart={() => setIsUploading(true)}
            onProcessingEnd={() => {
              setIsUploading(false);
              setIsThinking(true);
            }}
            onUserMessage={(msg) => setMessages((prev) => [...prev, msg])}
            onConversationCreated={(id) => setActiveConversationId(id)}
          />
        </div>
      </div>
    </div>
  );
}