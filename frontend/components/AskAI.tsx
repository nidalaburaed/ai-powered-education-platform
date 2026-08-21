"use client";

import { useState, useRef, useEffect } from "react";
import { askQuestion, type ChatMessage } from "@/lib/api";
import { Send, Loader2, Bot, User } from "lucide-react";

interface AskAIProps {
  videoId: string;
}

export default function AskAI({ videoId }: AskAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askQuestion(videoId, q, messages);
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't answer that right now. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    "Explain the main concept in simple terms",
    "What are the most common mistakes?",
    "Give me a real-world example",
    "Summarise the key takeaways",
  ];

  return (
    <div className="flex flex-col h-[560px] rounded-2xl overflow-hidden"
      style={{ background:"#1f1a14", border:"1px solid rgba(232,168,56,0.12)" }}>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            {/* AI avatar */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background:"rgba(232,168,56,0.1)", border:"1px solid rgba(232,168,56,0.2)" }}>
              <Bot className="w-7 h-7 text-gold-400" />
            </div>
            <div>
              <p className="text-parchment-200 text-lg mb-1" style={{ fontFamily:'"DM Serif Display",Georgia,serif' }}>
                Ask me anything
              </p>
              <p className="text-parchment-600 text-sm font-light max-w-xs">
                I&apos;ve read the transcript. Ask about any concept, problem, or idea from this video.
              </p>
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
                  style={{ background:"rgba(232,168,56,0.07)", border:"1px solid rgba(232,168,56,0.15)", color:"#a89070" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                  style={{ background:"rgba(232,168,56,0.1)", border:"1px solid rgba(232,168,56,0.2)" }}>
                  <Bot className="w-3.5 h-3.5 text-gold-400" />
                </div>
              )}
              <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed`}
                style={msg.role === "user"
                  ? { background:"rgba(232,168,56,0.12)", border:"1px solid rgba(232,168,56,0.2)", color:"#fdf6e3" }
                  : { background:"rgba(31,26,20,0.9)", border:"1px solid rgba(232,168,56,0.08)", color:"#c9b080" }
                }>
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                  style={{ background:"rgba(126,168,126,0.1)", border:"1px solid rgba(126,168,126,0.2)" }}>
                  <User className="w-3.5 h-3.5 text-sage-400" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background:"rgba(232,168,56,0.1)", border:"1px solid rgba(232,168,56,0.2)" }}>
              <Bot className="w-3.5 h-3.5 text-gold-400" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{ background:"rgba(31,26,20,0.9)", border:"1px solid rgba(232,168,56,0.08)" }}>
              {[0,1,2].map((j) => (
                <div key={j} className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-bounce"
                  style={{ animationDelay:`${j*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t" style={{ borderColor:"rgba(232,168,56,0.1)" }}>
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Enter to send)"
            rows={1}
            className="flex-1 resize-none input-warm py-2.5"
            style={{ minHeight:"42px", maxHeight:"120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-gold px-3 py-2.5 flex-shrink-0 disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-parchment-700 text-xs mt-2">Shift+Enter for new line · Enter to send</p>
      </div>
    </div>
  );
}
