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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
      
      // 🔹 ONLY update messages if we actually got new content.
      // This prevents the "vanishing" effect if the DB is temporarily empty.
      if (history.length >= messages.length) {
        setMessages(history);
      }


      const lastMessage = history[history.length - 1];

      // STOP CONDITION
      if (
        lastMessage?.role === "assistant" &&
        lastMessage.content &&
        lastMessage.content.length > 0
      ) {
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
    <div className="flex h-screen w-full bg-white text-black overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <Sidebar onSelect={handleSelectConversation} onNewChat={handleNewChat} />
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex flex-col flex-1 h-full relative bg-neutral-50 overflow-hidden">
        
        {/* HEADER: Compact for Mobile */}
        <header className="h-14 sm:h-16 border-b border-neutral-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 z-20 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 className="font-bold tracking-tight text-neutral-900 text-lg sm:text-lg">CortexAI</h1>
          </div>

          {(isUploading || isThinking) && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 sm:px-3 py-1 rounded-full animate-pulse">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
              <span>{isUploading ? "Indexing..." : "Thinking..."}</span>
            </div>
          )}
        </header>

        {/* MESSAGE LIST: Responsive Spacing */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-8 scroll-smooth custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
            {messages.length === 0 && !isUploading && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 sm:w-28 sm:h-28 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-xl relative">
                  <Image src="/pdf.svg" alt="pdf" width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" />
                  <div className="absolute inset-0 rounded-full border-2 border-black/5 animate-ping opacity-20"></div>
                </div>
                <h2 className="font-bold text-neutral-900 text-lg sm:text-2xl tracking-tight">Ready to analyze</h2>
                <p className="text-neutral-500 text-xs sm:text-base max-w-60 sm:max-w-xs mt-2 sm:mt-3 leading-relaxed">
                  Upload one or multiple PDFs to begin your intelligent document analysis.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} type={m.type} />
            ))}

            {isThinking && (
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="mr-2 sm:mr-3 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 shadow-md border border-neutral-700 overflow-hidden group-hover:scale-110 transition-transform">
                          <Image
                            src="/favicon.ico"
                            alt="AI"
                            width={20}
                            height={20}
                            className="w-4 h-4 sm:w-5 sm:h-5 invert"
                          />
                </div>
                <div className="bg-white border border-neutral-200 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-300 rounded-full animate-bounce"></span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* INPUT AREA: Fixed at bottom, responsive padding */}
        <footer className="p-3 sm:p-6 bg-white border-t border-neutral-200 shrink-0 z-20">
          <div className="max-w-4xl mx-auto">
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
            <p className="hidden sm:block text-[10px] text-center text-neutral-400 mt-3">
              CortexAI can make mistakes. Verify important information.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
