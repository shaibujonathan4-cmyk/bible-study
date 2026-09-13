"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type Message = {
  speaker: string;
  text: string;
};

const KNOWN_NAMES = [
  "moses", "elijah", "deborah", "isaiah", "mary", "peter", "paul",
  "david", "abraham", "sarah", "ruth", "esther", "daniel", "jeremiah",
  "john", "james", "thomas", "miriam", "joshua", "samuel",
];

function detectName(text: string, fallback: string): string {
  const lower = text.toLowerCase();
  const found = KNOWN_NAMES.find((n) => lower.includes(n));
  if (found) return found[0].toUpperCase() + found.slice(1);
  return fallback;
}

async function getReply(character: string, history: Message[]): Promise<string> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character, history }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Chat API error:", data.error);
      return "Something went wrong reaching the voice of scripture — try again in a moment.";
    }
    return data.text as string;
  } catch (err) {
    console.error(err);
    return "Something went wrong reaching the voice of scripture — try again in a moment.";
  }
}

async function loadConversation(room: string): Promise<{ active: string | null; messages: Message[] }> {
  try {
    const res = await fetch(`/api/conversation?room=${encodeURIComponent(room)}`);
    if (!res.ok) return { active: null, messages: [] };
    return await res.json();
  } catch {
    return { active: null, messages: [] };
  }
}

async function saveConversation(room: string, active: string, messages: Message[]) {
  try {
    await fetch("/api/conversation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room, active, messages }),
    });
  } catch (err) {
    console.error("Failed to save conversation:", err);
  }
}

function ChatInner() {
  const params = useSearchParams();
  const initial = params.get("with");
  const room = initial ? initial.toLowerCase() : "general";
  const startName = initial ? initial[0].toUpperCase() + initial.slice(1) : "Anyone";

  const [active, setActive] = useState(startName);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Load this room's saved conversation on mount (or when the room changes)
  useEffect(() => {
    setHydrated(false);
    loadConversation(room).then(({ active: savedActive, messages: savedMessages }) => {
      if (savedMessages?.length) {
        setActive(savedActive || startName);
        setMessages(savedMessages);
      } else {
        setActive(startName);
        setMessages(initial ? [{ speaker: startName, text: "Yes, I am here. What would you like to ask?" }] : []);
      }
      setHydrated(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // Save whenever this room's conversation changes
  useEffect(() => {
    if (!hydrated) return;
    saveConversation(room, active, messages);
  }, [messages, active, hydrated, room]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    function updateHeight() {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        scrollToBottom();
      }
    }

    updateHeight();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateHeight);
    }

    return () => {
      document.body.style.overflow = "";
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", updateHeight);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const nextActive = detectName(text, active);
    const userMsg: Message = { speaker: "You", text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setActive(nextActive);
    setInput("");
    requestAnimationFrame(() => inputRef.current?.focus());

    setLoading(true);
    const replyText = await getReply(nextActive, updated);
    setLoading(false);

    const reply: Message = { speaker: nextActive, text: replyText };
    setMessages((m) => [...m, reply]);
  }

  async function clearChat() {
    await fetch(`/api/conversation?room=${encodeURIComponent(room)}`, { method: "DELETE" });
    setMessages([]);
    setActive(startName);
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full bg-white flex flex-col overflow-hidden"
      style={{
        height: viewportHeight ? `${viewportHeight}px` : "100vh",
      }}
    >
      <header className="shrink-0 h-16 border-b border-gold/30 bg-sky-light/85 backdrop-blur-md flex items-center justify-between px-6 z-30">
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full border-2 border-gold bg-gold-light flex items-center justify-center font-[family-name:var(--font-headline)] text-[#1a1a1a]">
              {active[0]}
            </div>
            <div>
              <p className="font-[family-name:var(--font-headline)] text-lg text-[#1a1a1a] leading-tight">{active}</p>
              <p className="text-xs text-[#666] leading-tight">speaking with you now</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-[#888] hover:text-crimson transition underline underline-offset-2"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-4 min-h-full justify-end">
          {messages.length === 0 && (
            <p className="text-[#777] text-center my-auto">
              Say hello to anyone from scripture — try &quot;Hi Elijah&quot; or &quot;Moses, are you there?&quot;
            </p>
          )}
          {messages.map((m, i) => {
            const isUser = m.speaker === "You";
            return (
              <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                {!isUser && <span className="text-xs text-gold font-medium mb-1">{m.speaker}</span>}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    isUser ? "bg-crimson text-white rounded-br-sm" : "bg-sky-light text-[#1a1a1a] rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex flex-col items-start">
              <span className="text-xs text-gold font-medium mb-1">{active}</span>
              <div className="bg-sky-light text-[#999] rounded-2xl rounded-bl-sm px-4 py-3 text-[15px]">
                ...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      <footer className="shrink-0 border-t border-gold/30 bg-white px-6 py-3 z-30">
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <input
            ref={inputRef}
            value={input}
            onFocus={scrollToBottom}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Say hi to anyone in scripture..."
            className="flex-1 border border-gold/40 rounded-full px-5 py-3 text-[15px] focus:outline-none focus:border-gold"
          />
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={send}
            className="bg-crimson text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition shrink-0"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatInner />
    </Suspense>
  );
}
