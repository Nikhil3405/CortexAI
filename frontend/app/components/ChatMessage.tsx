"use client";

import Image from "next/image";

type Props = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "pdf";
};

/**
 * 🔹 Formats Bold (**text**) and Inline Code (`code`)
 */
function formatInlineStyles(text: string) {
  // Split by bold (**), keeping the delimiter to identify bold text
  const boldParts = text.split(/(\*\*(?:.*?)\*\*)/g);

  return boldParts.map((part, i) => {
    // Check if this part is wrapped in **
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2); // Remove the asterisks
      return (
        <strong key={`bold-${i}`} className="font-bold text-neutral-900 dark:text-white inline">
          {boldText}
        </strong>
      );
    }

    // Handle inline code within the non-bold segments
    const codeParts = part.split(/`(.*?)`/g);
    return codeParts.map((subPart, j) =>
      j % 2 === 1 ? (
        <code
          key={`code-${j}`}
          className="bg-neutral-200/50 px-1 rounded font-mono text-[0.9em] font-medium"
        >
          {subPart}
        </code>
      ) : (
        <span key={`text-${j}`}>{subPart}</span>
      )
    );
  });
}

function renderFormattedText(text: string, isUser: boolean) {
  const lines = text.split("\n");

  return lines.map((rawLine, i) => {
    const line = rawLine.trim();
    if (!line) return <div key={`space-${i}`} className="h-2" />;

    const numberedMatch = line.match(/^(\d+)\.(.*)/);
    if (numberedMatch) {
      return (
        <div key={`num-${i}`} className="ml-1 sm:ml-2 flex gap-1.5 sm:gap-2 py-0.5">
          <span
            className={`font-semibold shrink-0 text-xs sm:text-sm ${
              isUser ? "text-neutral-300" : "text-neutral-500"
            }`}
          >
            {numberedMatch[1]}.
          </span>
          <span className="flex-1 text-xs sm:text-sm">
            {formatInlineStyles(numberedMatch[2].trim())}
          </span>
        </div>
      );
    }

    if (line.startsWith("*") || line.startsWith("-") || line.startsWith("•")) {
      const cleaned = line.replace(/^[*•-]\s*/, "");
      return (
        <div key={`bullet-${i}`} className="ml-1 sm:ml-2 flex gap-1.5 sm:gap-2 py-0.5">
          <span
            className={`shrink-0 text-xs sm:text-sm ${
              isUser ? "text-neutral-300" : "text-neutral-500"
            }`}
          >
            •
          </span>
          <span className="flex-1 text-xs sm:text-sm">
            {formatInlineStyles(cleaned)}
          </span>
        </div>
      );
    }

    return (
      <p key={`p-${i}`} className="leading-relaxed mb-1 last:mb-0 text-xs sm:text-sm">
        {formatInlineStyles(line)}
      </p>
    );
  });
}

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
                  isUser
                    ? "bg-neutral-700"
                    : "bg-white"
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
          <div className="space-y-1 wrap-break-word">
            {renderFormattedText(content, isUser)}
          </div>
        )}
      </div>
    </div>
  );
}
