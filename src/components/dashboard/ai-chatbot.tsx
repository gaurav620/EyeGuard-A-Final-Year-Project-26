"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

type Msg = { role: "user" | "bot"; text: string };

const QUICK = ["How to reduce eye strain?", "What is the 20-20-20 rule?", "My eyes feel dry", "Best eye exercises?"];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Hi! 👋 I'm your EyeGuard AI assistant. Ask me anything about eye health, blink rate, screen ergonomics, or eye exercises!" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    setMsgs((p) => [...p, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg }) });
      const d = await r.json();
      setMsgs((p) => [...p, { role: "bot", text: d.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMsgs((p) => [...p, { role: "bot", text: "Connection error. Please try again! 🔄" }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(!open)} className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-xl shadow-[#5B6CFF]/30 hover:scale-110 transition-transform" aria-label="Chat">
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[90] w-[360px] max-h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-white/50 flex flex-col" style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}>
          {/* Header */}
          <div className="gradient-primary px-4 py-3 flex items-center gap-2">
            <Bot className="h-5 w-5 text-white" />
            <div>
              <p className="text-white text-sm font-bold">EyeGuard AI</p>
              <p className="text-white/70 text-[10px]">Eye Health Assistant</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[340px]">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "bot" && <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5"><Bot className="h-3.5 w-3.5 text-white" /></div>}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[#5B6CFF] text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                  {m.text}
                </div>
                {m.role === "user" && <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5"><User className="h-3.5 w-3.5 text-gray-600" /></div>}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0"><Bot className="h-3.5 w-3.5 text-white" /></div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-400">Thinking... 💭</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          {msgs.length <= 2 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button key={q} onClick={() => void send(q)} className="text-xs bg-[#5B6CFF]/10 text-[#5B6CFF] rounded-full px-3 py-1.5 hover:bg-[#5B6CFF]/20 transition-colors font-medium">{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void send(input)} placeholder="Ask about eye health..." className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/30 focus:border-[#5B6CFF]" disabled={loading} />
            <button onClick={() => void send(input)} disabled={loading || !input.trim()} className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center disabled:opacity-50 transition-opacity"><Send className="h-4 w-4 text-white" /></button>
          </div>
        </div>
      )}
    </>
  );
}
