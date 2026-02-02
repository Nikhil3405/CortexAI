"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface PDFInfo {
  id: string;
  filename: string;
}

interface Conversation {
  id: string;
  title: string;
  pdfs: PDFInfo[];
}

interface SidebarProps {
  onSelect: (conversationId: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({ onSelect, onNewChat }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiRequest("/conversations", "GET");
        if (Array.isArray(data)) {
          setConversations(data);
        }
      } catch (err) {
        console.error("Sidebar load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("/logout", "POST");
      localStorage.clear();
      sessionStorage.clear();
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/");
    }
  };

  const handleSelect = (chat: Conversation) => {
    setActiveId(chat.id);
    onSelect(chat.id);
  };

  const handleNewChat = () => {
    setActiveId(null);
    onNewChat();
  };

  const handleDeleteChat = async (id: string) => {
    if (!confirm("Delete this conversation and all PDFs?")) return;

    try {
      await apiRequest(`/conversations/${id}`, "DELETE");
      setConversations((prev) => prev.filter((c) => c.id !== id));

      if (activeId === id) {
        setActiveId(null);
        onNewChat();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete conversation");
    }
  };

  return (
    <div className="w-64 sm:w-72 bg-linear-to-br from-white via-neutral-50 to-neutral-100 h-full flex flex-col border-r border-neutral-200/80 shadow-2xl backdrop-blur-sm">
      {/* Header with Logo */}
      <div className="p-4 sm:p-5 border-b border-neutral-200/50 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <div className="relative">
              <Image 
                src="/favicon.ico" 
                alt="CortexAI" 
                width={20} 
                height={20}
                className="w-7 h-7 sm:w-8 sm:h-8 "
              />
          </div>
          <div>
            <h2 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
              CortexAI
            </h2>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full bg-linear-to-r from-neutral-900 via-neutral-800 to-black text-white hover:from-neutral-800 hover:via-neutral-700 hover:to-neutral-900 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-4 h-4 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-300"
          >
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* History Section */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 py-4 space-y-1.5 custom-scrollbar">
        <div className="flex items-center justify-between px-2 sm:px-3 mb-3">
          <h3 className="text-[9px] sm:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            History
          </h3>
        </div>
        
        {loading ? (
          <div className="px-3 py-8 flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-3 border-neutral-200 rounded-full"></div>
              <div className="absolute inset-0 border-3 border-t-neutral-900 rounded-full animate-spin"></div>
            </div>
            <p className="text-xs text-neutral-500 font-medium">Loading chats...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-12 text-center ">
            <p className="text-xs text-neutral-500 font-medium">No conversations yet</p>
            <p className="text-[10px] text-neutral-400 mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {conversations.map((chat) => (
              <div key={chat.id} className="relative group">
                <button
                  onClick={() => handleSelect(chat)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-2 pr-10 relative overflow-hidden ${
                    activeId === chat.id
                      ? "bg-linear-to-br from-neutral-900 to-black text-white shadow-lg ring-2 ring-neutral-800"
                      : "hover:bg-white/80 text-neutral-700 active:bg-white hover:shadow-md"
                  }`}
                >
                  {activeId === chat.id && (
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                  )}
                  
                  <div className="flex items-start gap-2 relative z-10">
                    <span className={`truncate text-xs sm:text-sm font-semibold min-w-0 flex-1 ${
                      activeId === chat.id ? "text-white" : "text-neutral-800 group-hover:text-neutral-900"
                    }`}>
                      {chat.title || "Untitled Chat"}
                    </span>
                  </div>

                  {chat.pdfs && chat.pdfs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 relative z-10">
                      {chat.pdfs.slice(0, 2).map((pdf) => (
                        <span
                          key={pdf.id}
                          className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-lg truncate max-w-50 font-medium flex items-center gap-1 ${
                            activeId === chat.id
                              ? "bg-white/10 text-neutral-300 backdrop-blur-sm"
                              : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200"
                          }`}
                        >
                          
                        <Image 
                          src="/pdf-2.svg" 
                          alt="pdf" 
                          width={24} 
                          height={24}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${activeId === chat.id ? "invert" : ""}`}
                        />
                          {pdf.filename}
                        </span>
                      ))}
                      {chat.pdfs.length > 2 && (
                        <span
                          className={`text-[9px] sm:text-[10px] px-2 py-1 rounded-lg font-semibold ${
                            activeId === chat.id
                              ? "bg-white/10 text-neutral-300"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          +{chat.pdfs.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                  className={`absolute right-2 top-1 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
                    activeId === chat.id
                      ? "text-neutral-300 hover:text-red-400 hover:bg-white/10"
                      : "text-neutral-400 hover:text-red-600 hover:bg-red-50"
                  }`}
                  title="Delete"
                  aria-label="Delete conversation"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="w-4.5 h-4.5"
                  >
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with Logout */}
      <div className="p-4 border-t border-neutral-200/50 bg-white/60 backdrop-blur-md space-y-3">
        <button
          onClick={handleLogout}
          className="w-full bg-white border-2 border-neutral-200 text-neutral-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md active:scale-[0.98] text-xs sm:text-sm group"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
        <div className="text-center">
          <p className="text-[10px] text-neutral-400 font-medium">Powered by CortexAI</p>
          <p className="text-[9px] text-neutral-400 mt-0.5">© 2026 All rights reserved</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}