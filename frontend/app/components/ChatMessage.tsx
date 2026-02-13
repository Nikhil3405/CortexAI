"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";

type Props = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "pdf";
};

export default function ChatMessage({ role, content, type }: Props) {
  const isUser = role === "user";
  const isPdf = type === "pdf";

  // ✅ Normalize backend message: "Uploaded: file.pdf" → "file.pdf"
  let displayContent = content;
  if (isPdf && content.startsWith("Uploaded:")) {
    displayContent = content.replace("Uploaded:", "").trim();
  }

  return (
    <div
      className={`flex w-full mb-4 sm:mb-6 ${
        isUser ? "justify-end" : "justify-start"
      } group`}
    >
      {!isUser && (
        <div className="mr-2 sm:mr-3 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-800 to-neutral-900 shadow-md border border-neutral-700 overflow-hidden group-hover:scale-110 transition-transform">
          <Image
            src="/favicon.ico"
            alt="AI"
            width={20}
            height={20}
            className="w-4 h-4 sm:w-5 sm:h-5 invert"
          />
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-all overflow-hidden wrap-break-word ${
          isUser
            ? "bg-linear-to-br from-neutral-900 to-black text-white rounded-br-none shadow-lg hover:shadow-xl border border-neutral-700"
            : "bg-white text-neutral-900 rounded-bl-none shadow-md hover:shadow-lg border-2 border-neutral-200"
        }`}
      >
        {isPdf ? (
          <div className="flex flex-col gap-2 min-w-35 sm:min-w-50">
            <div
              className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg border transition-colors ${
                isUser
                  ? "bg-neutral-800 border-neutral-700"
                  : "bg-neutral-50 border-neutral-200"
              }`}
            >
              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                  isUser ? "bg-neutral-700" : "bg-white"
                }`}
              >
                <Image
                  src="/pdf-2.svg"
                  alt="pdf"
                  width={24}
                  height={24}
                  className="w-4 h-4 sm:w-5 sm:h-5 invert"
                />
              </div>

              <div className="flex flex-col overflow-hidden min-w-0">
                <span
                  className={`font-medium truncate text-xs sm:text-sm ${
                    isUser ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {displayContent}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] uppercase tracking-wider ${
                    isUser ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  PDF Document
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 wrap-break-words text-xs sm:text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),

                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),

                ul: ({ children }) => (
                  <ul className="list-disc ml-4 space-y-1">{children}</ul>
                ),

                ol: ({ children }) => (
                  <ol className="list-decimal ml-4 space-y-1">{children}</ol>
                ),

                li: ({ children }) => <li className="pl-1">{children}</li>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
