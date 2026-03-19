import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API_URL from "./config";

const SYSTEM_PROMPT =
  "You are Nirvana AI, a compassionate health companion inside CityCare Hospital's patient portal. " +
  "You provide supportive guidance on both mental health (anxiety, stress, depression, sleep) and " +
  "general health questions (symptoms, medications, wellness tips). Always be warm, empathetic and " +
  "non-judgmental. Never diagnose — always suggest consulting a doctor for serious concerns. " +
  "Keep responses concise and easy to read.";

const SUGGESTIONS = [
  "I've been feeling anxious lately",
  "What are symptoms of diabetes?",
  "I'm having trouble sleeping",
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function nowHHMM() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function NirvanaChat() {
  const navigate        = useNavigate();
  const { state }       = useLocation();
  const patientName     = state?.name      || "Patient";
  const patientId       = state?.patientId;

  const [isDark,     setIsDark]     = useState(() => localStorage.getItem("nirvana-theme") !== "light");
  const [messages,   setMessages]   = useState([]);
  const [input,      setInput]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [isOnline,   setIsOnline]   = useState(null);
  const [remaining,  setRemaining]  = useState(null); // null = not yet known
  const [cooldown,   setCooldown]   = useState(0);    // seconds until next send

  const toggleTheme = () =>
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("nirvana-theme", next ? "dark" : "light");
      return next;
    });

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const INI        = getInitials(patientName);

  /* auto-scroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* cooldown countdown — ticks every second until zero */
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* auto-resize textarea */
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  /* ── send message ── */
  const sendMessage = async (textOverride) => {
    const content = (textOverride ?? input).trim();
    if (!content || loading || cooldown > 0 || remaining === 0) return;

    if (inputRef.current) inputRef.current.style.height = "auto";
    setInput("");

    const userMsg     = { role: "user", content, ts: nowHHMM() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...nextHistory.map(({ role, content: c }) => ({ role, content: c })),
    ];

    let startCooldown = false;
    try {
      const res  = await fetch(`${API_URL}/nirvana_chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: groqMessages, patient_id: patientId }),
      });
      const data = await res.json();

      if (res.status === 429) {
        setRemaining(0);
        setMessages((prev) => [
          ...prev,
          {
            role:    "assistant",
            content: "You've reached your daily limit of 20 messages. Nirvana AI resets at 5:30 AM IST.\n\nIf you're in crisis, please call iCall at 9152987821.",
            isError: true,
            ts:      nowHHMM(),
          },
        ]);
        return;
      }

      const reply = data.message?.content;
      if (res.ok && reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, ts: nowHHMM() },
        ]);
        setIsOnline(true);
        if (data.remaining !== undefined) setRemaining(data.remaining);
        startCooldown = true;
      } else {
        throw new Error(data.error || "No response from AI");
      }
    } catch (err) {
      setIsOnline(false);
      setMessages((prev) => [
        ...prev,
        {
          role:    "assistant",
          content: `⚠️ Nirvana AI is unavailable. ${err.message}`,
          isError: true,
          ts:      nowHHMM(),
        },
      ]);
      startCooldown = true;
    } finally {
      setLoading(false);
      if (startCooldown) setCooldown(5);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goBack = () =>
    navigate("/home/patient", { state: { name: patientName, patientId } });

  /* ── render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg-primary:    #0D1117;
          --bg-secondary:  #161B22;
          --bg-tertiary:   #21262D;
          --accent:        #7C3AED;
          --accent-soft:   #4C1D95;
          --accent-glow:   rgba(124, 58, 237, 0.15);
          --text-primary:  #F0F6FC;
          --text-secondary:#8B949E;
          --user-bubble:   #7C3AED;
          --ai-bubble:     #21262D;
          --border:        rgba(255, 255, 255, 0.06);
          --chip-border:   rgba(124, 58, 237, 0.45);
        }

        /* ── theme toggle ── */
        .nv-theme-btn {
          background: none; border: none; cursor: pointer;
          font-size: 17px; line-height: 1;
          padding: 6px 8px; border-radius: 8px;
          transition: background 0.15s, transform 0.15s;
          flex-shrink: 0;
        }
        .nv-theme-btn:hover { background: var(--bg-tertiary); transform: scale(1.15); }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── page shell ── */
        .nv-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── header ── */
        .nv-header {
          height: 60px;
          flex-shrink: 0;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 20px;
          background: rgba(13, 17, 23, 0.80);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          z-index: 20;
        }

        .nv-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: none; border: none; cursor: pointer;
          color: var(--text-secondary); font-size: 13px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          padding: 6px 10px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
          justify-self: start;
        }
        .nv-back:hover { color: var(--text-primary); background: var(--bg-tertiary); }

        .nv-header-center { text-align: center; }
        .nv-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 600;
          color: var(--text-primary); letter-spacing: 0.01em;
        }
        .nv-subtitle {
          font-size: 10px; color: var(--text-secondary);
          letter-spacing: 0.08em; text-transform: lowercase;
          margin-top: 1px;
        }

        .nv-status { justify-self: end; display: flex; align-items: center; gap: 7px; }
        .nv-dot-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
        .nv-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #22C55E;
        }
        .nv-dot-ring {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          background: #22C55E; opacity: 0.4;
          animation: nv-pulse 2s ease-out infinite;
        }
        @keyframes nv-pulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
        .nv-online-label { font-size: 11px; color: #22C55E; font-weight: 600; }

        /* ── messages area ── */
        .nv-messages {
          flex: 1;
          overflow-y: auto;
          padding: 28px 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          scrollbar-width: none;
        }
        .nv-messages::-webkit-scrollbar { display: none; }

        /* ── empty state ── */
        .nv-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          padding: 40px 20px;
          text-align: center;
        }
        .nv-empty-glow {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 88px; height: 88px;
        }
        .nv-empty-glow::before {
          content: '';
          position: absolute; inset: -18px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.30) 0%, transparent 70%);
          animation: nv-glow-pulse 3s ease-in-out infinite;
        }
        @keyframes nv-glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1);   }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        .nv-empty-emoji { font-size: 52px; line-height: 1; position: relative; z-index: 1; }
        .nv-empty-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 400; color: var(--text-primary);
          line-height: 1.25;
        }
        .nv-empty-sub {
          font-size: 13px; color: var(--text-secondary); max-width: 300px; line-height: 1.6;
        }
        .nv-chips {
          display: flex; flex-wrap: wrap; gap: 10px;
          justify-content: center; max-width: 480px; margin-top: 4px;
        }
        .nv-chip {
          background: transparent;
          border: 1px solid var(--chip-border);
          color: #A78BFA;
          border-radius: 24px; padding: 9px 18px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .nv-chip:hover {
          background: var(--accent-glow);
          border-color: var(--accent);
          color: #C4B5FD;
        }

        /* ── message row ── */
        .nv-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: nv-fadein 0.22s ease both;
        }
        @keyframes nv-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .nv-row.user { justify-content: flex-end; }
        .nv-row.ai   { justify-content: flex-start; }

        /* avatars */
        .nv-avatar-ai {
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--accent-soft);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0; margin-bottom: 18px;
          border: 1px solid rgba(124,58,237,0.3);
        }
        .nv-avatar-user {
          width: 30px; height: 30px; border-radius: 50%;
          background: var(--accent);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          flex-shrink: 0; margin-bottom: 18px;
          letter-spacing: 0.02em;
        }

        /* bubble + timestamp wrapper */
        .nv-bubble-wrap { display: flex; flex-direction: column; max-width: 72%; }
        .nv-row.user .nv-bubble-wrap { align-items: flex-end; }
        .nv-row.ai   .nv-bubble-wrap { align-items: flex-start; }

        .nv-bubble {
          padding: 11px 16px;
          font-size: 14px; line-height: 1.7;
          white-space: pre-wrap; word-break: break-word;
        }
        .nv-bubble.user {
          background: var(--user-bubble);
          color: #fff;
          border-radius: 18px 18px 4px 18px;
        }
        .nv-bubble.ai {
          background: var(--ai-bubble);
          color: var(--text-primary);
          border-radius: 18px 18px 18px 4px;
          border: 1px solid var(--border);
        }
        .nv-bubble.error {
          background: rgba(239, 68, 68, 0.12);
          color: #FCA5A5;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 18px 18px 18px 4px;
        }
        .nv-ts {
          font-size: 10px; color: var(--text-secondary);
          margin-top: 4px; padding: 0 4px;
          letter-spacing: 0.03em;
        }

        /* ── typing indicator ── */
        .nv-typing-dots {
          display: flex; gap: 5px; align-items: center;
          padding: 10px 14px;
        }
        .nv-d {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--accent);
        }
        .nv-d:nth-child(1) { animation: nv-dot 1.1s 0.0s infinite ease-in-out; }
        .nv-d:nth-child(2) { animation: nv-dot 1.1s 0.18s infinite ease-in-out; }
        .nv-d:nth-child(3) { animation: nv-dot 1.1s 0.36s infinite ease-in-out; }
        @keyframes nv-dot {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.35; }
          30%            { transform: translateY(-7px); opacity: 1;   }
        }

        /* ── input bar ── */
        .nv-input-bar {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 20px 16px;
          background: var(--bg-tertiary);
          border-top: 1px solid var(--border);
        }
        .nv-input-row {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }
        .nv-usage {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nv-usage-track {
          flex: 1;
          height: 3px;
          background: var(--border);
          border-radius: 2px;
          overflow: hidden;
        }
        .nv-usage-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.4s ease, background 0.4s ease;
        }
        .nv-usage-label {
          font-size: 10px;
          color: var(--text-secondary);
          white-space: nowrap;
          letter-spacing: 0.03em;
          flex-shrink: 0;
        }
        .nv-textarea {
          flex: 1;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          resize: none;
          outline: none;
          line-height: 1.55;
          min-height: 44px;
          max-height: 96px;
          overflow-y: auto;
          scrollbar-width: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .nv-textarea::-webkit-scrollbar { display: none; }
        .nv-textarea:focus {
          border-color: rgba(124, 58, 237, 0.55);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .nv-textarea::placeholder { color: var(--text-secondary); }

        .nv-send {
          width: 44px; height: 44px;
          border-radius: 50%; border: none;
          background: var(--accent);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
        }
        .nv-send:hover:not(:disabled) {
          background: #6D28D9;
          box-shadow: 0 0 16px rgba(124, 58, 237, 0.45);
          transform: scale(1.05);
        }
        .nv-send:active:not(:disabled) { transform: scale(0.96); }
        .nv-send:disabled {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          cursor: not-allowed;
          opacity: 0.45;
        }
        .nv-send.cooling {
          background: transparent;
          border: 1.5px solid var(--accent);
          color: var(--accent);
          pointer-events: none;
          opacity: 1;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .nv-header    { padding: 0 12px; }
          .nv-messages  { padding: 20px 12px 8px; }
          .nv-input-bar { padding: 10px 12px 12px; }
          .nv-bubble-wrap { max-width: 85%; }
        }
      `}</style>

      <div className="nv-page" style={{
        "--bg-primary":     isDark ? "#0D1117"               : "#F8FAFC",
        "--bg-secondary":   isDark ? "#161B22"               : "#FFFFFF",
        "--bg-tertiary":    isDark ? "#21262D"               : "#F1F5F9",
        "--text-primary":   isDark ? "#F0F6FC"               : "#0F172A",
        "--text-secondary": isDark ? "#8B949E"               : "#64748B",
        "--ai-bubble":      isDark ? "#21262D"               : "#FFFFFF",
        "--border":         isDark ? "rgba(255,255,255,0.06)": "rgba(0,0,0,0.08)",
        "--chip-border":    isDark ? "rgba(124,58,237,0.45)" : "#DDD6FE",
        transition: "background 0.3s ease, color 0.3s ease",
      }}>

        {/* ══ HEADER ══ */}
        <header className="nv-header" style={{
          background: isDark ? "rgba(13,17,23,0.80)" : "rgba(255,255,255,0.90)",
        }}>

          {/* left — back button */}
          <button className="nv-back" onClick={goBack}>
            <svg width="14" height="14" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>

          {/* center — title */}
          <div className="nv-header-center">
            <div className="nv-title">🧠 Nirvana AI</div>
            <div className="nv-subtitle">powered by groq · llama3</div>
          </div>

          {/* right — online indicator + theme toggle */}
          <div className="nv-status">
            {isOnline === true && (
              <>
                <div className="nv-dot-wrap">
                  <div className="nv-dot-ring" />
                  <div className="nv-dot" />
                </div>
                <span className="nv-online-label">Online</span>
              </>
            )}
            <button
              className="nv-theme-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* ══ MESSAGES ══ */}
        <div className="nv-messages">

          {/* empty state */}
          {messages.length === 0 && !loading && (
            <div className="nv-empty">
              <div className="nv-empty-glow">
                <span className="nv-empty-emoji">🧠</span>
              </div>
              <h1 className="nv-empty-heading">How are you feeling today?</h1>
              <p className="nv-empty-sub">Your compassionate AI health companion.</p>
              <div className="nv-chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="nv-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* bubbles */}
          {messages.map((msg, i) => (
            <div key={i} className={`nv-row ${msg.role === "user" ? "user" : "ai"}`}>
              {msg.role === "assistant" && (
                <div className="nv-avatar-ai">🧠</div>
              )}

              <div className="nv-bubble-wrap">
                <div className={`nv-bubble ${
                  msg.role === "user" ? "user" : msg.isError ? "error" : "ai"
                }`}>
                  {msg.content}
                </div>
                {msg.ts && <span className="nv-ts">{msg.ts}</span>}
              </div>

              {msg.role === "user" && (
                <div className="nv-avatar-user">{INI}</div>
              )}
            </div>
          ))}

          {/* typing indicator */}
          {loading && (
            <div className="nv-row ai">
              <div className="nv-avatar-ai">🧠</div>
              <div className="nv-bubble-wrap">
                <div className="nv-bubble ai">
                  <div className="nv-typing-dots">
                    <div className="nv-d" />
                    <div className="nv-d" />
                    <div className="nv-d" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ══ INPUT BAR ══ */}
        <div className="nv-input-bar">

          {/* usage bar — shown once we know remaining count */}
          {remaining !== null && (
            <div className="nv-usage">
              <div className="nv-usage-track">
                <div
                  className="nv-usage-fill"
                  style={{
                    width: `${Math.max(0, (remaining / 20) * 100)}%`,
                    background: remaining <= 5
                      ? "#EF4444"
                      : remaining <= 10
                        ? "#F59E0B"
                        : "var(--accent)",
                  }}
                />
              </div>
              <span className="nv-usage-label">{remaining}/20 messages today</span>
            </div>
          )}

          <div className="nv-input-row">
            <textarea
              ref={inputRef}
              className="nv-textarea"
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
            />
            <button
              className={`nv-send${cooldown > 0 ? " cooling" : ""}`}
              onClick={() => sendMessage()}
              disabled={loading || !input.trim() || remaining === 0}
              title={cooldown > 0 ? `Wait ${cooldown}s` : remaining === 0 ? "Daily limit reached" : "Send"}
            >
              {cooldown > 0 ? (
                cooldown
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  viewBox="0 0 24 24">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              )}
            </button>
          </div>

        </div>

      </div>
    </>
  );
}
