import ReactMarkdown from "react-markdown";
import { Code2 } from "lucide-react";
import type { ChatMessage } from "@/store/raincastStore";
import { cn } from "@/lib/utils";

/**
 * Strip fenced code blocks from the chat bubble — code renders in the Code panel.
 * If streaming is mid-code (unclosed fence), show a "Writing code…" indicator instead.
 */
function stripCodeForChat(raw: string): { text: string; writingCode: boolean } {
  if (!raw) return { text: "", writingCode: false };

  // Remove fully-closed fenced blocks
  let text = raw.replace(/```[a-zA-Z]*\s*[\s\S]*?```/g, "");

  // Detect an unclosed fence → still streaming code
  const writingCode = /```[a-zA-Z]*\s*[\s\S]*$/.test(text);
  if (writingCode) {
    text = text.replace(/```[a-zA-Z]*\s*[\s\S]*$/, "");
  }

  return { text: text.trim(), writingCode };
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const { text, writingCode } = isUser
    ? { text: message.content, writingCode: false }
    : stripCodeForChat(message.content);

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-secondary text-foreground rounded-bl-sm border border-border",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:hidden prose-code:text-primary prose-strong:text-foreground">
            {text ? (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mt-3 mb-1.5">
                      {children}
                    </div>
                  ),
                  h2: ({ children }) => (
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mt-3 mb-1.5">
                      {children}
                    </div>
                  ),
                  h3: ({ children }) => (
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mt-3 mb-1.5">
                      {children}
                    </div>
                  ),
                }}
              >
                {text}
              </ReactMarkdown>
            ) : !writingCode ? (
              <div className="raincast-typing">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {writingCode && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/30 rounded-md px-2 py-1">
                <Code2 className="w-3 h-3" />
                <span>Writing code…</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
