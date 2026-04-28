import ReactMarkdown from "react-markdown";
import { Code2, ClipboardList, Sparkles } from "lucide-react";
import type { ChatMessage } from "@/store/raincastStore";
import { cn } from "@/lib/utils";
import { useAIBuild } from "@/hooks/useAIBuild";

interface PlanData {
  title?: string;
  type?: string;
  summary?: string;
  pages?: string[];
  style?: string;
  features?: string[];
}

/**
 * Strip fenced code blocks AND raincast-plan blocks from chat. Extract plan if present.
 */
function parseAssistantMessage(raw: string): {
  text: string;
  writingCode: boolean;
  plan: PlanData | null;
  planRaw: string | null;
} {
  if (!raw)
    return { text: "", writingCode: false, plan: null, planRaw: null };

  let plan: PlanData | null = null;
  let planRaw: string | null = null;

  // Extract plan block (closed only)
  const planMatch = raw.match(/```raincast-plan\s*([\s\S]*?)```/);
  if (planMatch) {
    planRaw = planMatch[1].trim();
    try {
      plan = JSON.parse(planRaw);
    } catch {
      plan = null;
    }
  }

  // Remove all fenced code blocks (closed)
  let text = raw.replace(/```[a-zA-Z0-9_-]*\s*[\s\S]*?```/g, "");

  // Detect unclosed fence
  const writingCode = /```[a-zA-Z0-9_-]*\s*[\s\S]*$/.test(text);
  if (writingCode) {
    text = text.replace(/```[a-zA-Z0-9_-]*\s*[\s\S]*$/, "");
  }

  return { text: text.trim(), writingCode, plan, planRaw };
}

function PlanCard({ plan, raw }: { plan: PlanData; raw: string }) {
  const { buildFromPlan } = useAIBuild();
  return (
    <div className="not-prose mt-3 rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-4 shadow-[0_0_24px_-8px_rgba(139,92,246,0.5)]">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-purple-400" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-purple-300">
          Project Plan
        </span>
      </div>
      {plan.title && (
        <div className="font-display text-lg leading-tight mb-1">
          {plan.title}
        </div>
      )}
      {plan.summary && (
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          {plan.summary}
        </p>
      )}
      <dl className="space-y-1.5 text-xs">
        {plan.type && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-16 shrink-0">Type</dt>
            <dd className="text-foreground">{plan.type}</dd>
          </div>
        )}
        {plan.style && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-16 shrink-0">Style</dt>
            <dd className="text-foreground">{plan.style}</dd>
          </div>
        )}
        {plan.pages && plan.pages.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-16 shrink-0">Pages</dt>
            <dd className="text-foreground">{plan.pages.join(", ")}</dd>
          </div>
        )}
        {plan.features && plan.features.length > 0 && (
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-16 shrink-0">Features</dt>
            <dd className="text-foreground">{plan.features.join(", ")}</dd>
          </div>
        )}
      </dl>
      <button
        onClick={() => buildFromPlan(raw)}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-medium transition-all shadow-[0_0_18px_-4px_rgba(139,92,246,0.7)] hover:-translate-y-[1px]"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Build This Now
      </button>
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const parsed = isUser
    ? { text: message.content, writingCode: false, plan: null, planRaw: null }
    : parseAssistantMessage(message.content);
  const { text, writingCode, plan, planRaw } = parsed;

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
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
            ) : !writingCode && !plan ? (
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
            {plan && planRaw && <PlanCard plan={plan} raw={planRaw} />}
          </div>
        )}
      </div>
    </div>
  );
}
