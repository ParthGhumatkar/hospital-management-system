import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LANGUAGES = [
  { label: "English", code: "en-IN" },
  { label: "Hindi", code: "hi-IN" },
  { label: "Marathi", code: "mr-IN" },
  { label: "Gujarati", code: "gu-IN" },
  { label: "Bengali", code: "bn-IN" },
];

function NirvanaChat() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const mode = state?.mode || "anonymous";
  const patientName = state?.name;
  const patientId = state?.patientId;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: mode === "verified"
        ? `Hi ${patientName} 👋 I'm Nirvana AI. This is a safe space — I'm here to listen. How are you feeling today?`
        : "Hi 👋 I'm Nirvana AI. This is a completely private space — nothing you say is saved. How are you feeling today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(false);
  const [showVerifiedSuggestion, setShowVerifiedSuggestion] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showVerifiedSuggestion]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language.code;
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [language]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported. Please use Chrome.");
      return;
    }
    setIsListening(true);
    recognitionRef.current.lang = language.code;
    recognitionRef.current.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language.code;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async (textOverride) => {
    const text = textOverride || input.trim();
    if (!text) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/nirvana/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, mode }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        speakText(data.reply);

        // Only show verified suggestion if crisis detected AND user is anonymous
        if (data.is_crisis) {
          setCrisisAlert(true);
          if (mode === "anonymous") {
            setShowVerifiedSuggestion(true);
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn}
            onClick={() => navigate("/nirvana", { state: { name: patientName, patientId } })}>
            ←
          </button>
          <div>
            <span style={styles.headerTitle}>🧠 Nirvana AI</span>
            <span style={{
              ...styles.modeBadge,
              backgroundColor: mode === "anonymous" ? "#2a2a4a" : "#1a3a2a",
              color: mode === "anonymous" ? "#a89ff5" : "#5dcaa5",
            }}>
              {mode === "anonymous" ? "🕶️ Anonymous" : `✅ ${patientName}`}
            </span>
          </div>
        </div>
        <select
          value={language.code}
          onChange={(e) => setLanguage(LANGUAGES.find(l => l.code === e.target.value))}
          style={styles.langSelect}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Crisis Alert Banner */}
      {crisisAlert && (
        <div style={styles.crisisBanner}>
          <strong>You are not alone. 💙</strong> If you are in crisis, please reach out —
          iCall helpline: <strong>9152987821</strong> (Free &amp; confidential)
          <button style={styles.crisisClose} onClick={() => setCrisisAlert(false)}>✕</button>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesArea}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.msgRow, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={styles.avatar}>🧠</div>}
            <div style={{
              ...styles.bubble,
              backgroundColor: msg.role === "user" ? "#7f77dd" : "#16213e",
              color: "#ffffff",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            }}>
              {msg.content}
              {msg.role === "assistant" && (
                <button
                  style={styles.speakBtn}
                  onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                  title={isSpeaking ? "Stop" : "Read aloud"}
                >
                  {isSpeaking ? "⏹" : "🔊"}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
            <div style={styles.avatar}>🧠</div>
            <div style={{ ...styles.bubble, backgroundColor: "#16213e" }}>
              <span style={styles.typing}>● ● ●</span>
            </div>
          </div>
        )}

        {/* Crisis-triggered verified suggestion — anonymous mode only */}
        {showVerifiedSuggestion && mode === "anonymous" && (
          <div style={styles.suggestionCard}>
            <p style={styles.suggestionHeart}>💜</p>
            <p style={styles.suggestionTitle}>You don't have to go through this alone</p>
            <p style={styles.suggestionText}>
              I'm really glad you're talking to me, and I want you to know that what you're
              feeling is completely valid. Sometimes, having a real person by your side can
              make all the difference. Would you like to connect with a counselor who truly
              cares? It's always your choice — and your privacy still comes first.
            </p>
            <div style={styles.suggestionBtns}>
              <button
                style={styles.suggYesBtn}
                onClick={() => navigate("/nirvana", { state: { name: patientName, patientId } })}
              >
                Yes, connect me with a counselor →
              </button>
              <button
                style={styles.suggNoBtn}
                onClick={() => setShowVerifiedSuggestion(false)}
              >
                I'd like to keep chatting here
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        <textarea
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "🎤 Listening..." : "Type or speak your message..."}
          rows={1}
        />
        <button
          style={{ ...styles.iconBtn, backgroundColor: isListening ? "#e74c3c" : "#1e2d4a" }}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? "Stop listening" : "Speak"}
        >
          🎤
        </button>
        <button
          style={{ ...styles.iconBtn, backgroundColor: "#7f77dd" }}
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>

    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    backgroundColor: "#0f0f1e",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    backgroundColor: "#16213e",
    padding: "14px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e2d4a",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#7f8fa4",
    fontSize: "20px",
    cursor: "pointer",
    padding: "0 8px 0 0",
  },
  headerTitle: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    marginRight: "10px",
  },
  modeBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  langSelect: {
    backgroundColor: "#1e2d4a",
    color: "#a0aec0",
    border: "1px solid #2d3748",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
  },
  crisisBanner: {
    backgroundColor: "#7b1a1a",
    color: "#ffd5d5",
    padding: "12px 20px",
    fontSize: "14px",
    textAlign: "center",
    position: "relative",
    lineHeight: "1.6",
  },
  crisisClose: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#ffd5d5",
    cursor: "pointer",
    fontSize: "16px",
  },
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  avatar: {
    fontSize: "20px",
    marginBottom: "4px",
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "70%",
    padding: "12px 16px",
    fontSize: "14px",
    lineHeight: "1.6",
    position: "relative",
  },
  speakBtn: {
    background: "none",
    border: "none",
    color: "#a0aec0",
    cursor: "pointer",
    fontSize: "12px",
    marginLeft: "8px",
    padding: "0",
    verticalAlign: "middle",
  },
  typing: {
    color: "#a0aec0",
    letterSpacing: "3px",
    fontSize: "16px",
  },
  suggestionCard: {
    backgroundColor: "#1a1535",
    border: "1px solid #3d2f6e",
    borderRadius: "16px",
    padding: "24px",
    margin: "8px 0",
    textAlign: "center",
  },
  suggestionHeart: {
    fontSize: "32px",
    margin: "0 0 10px 0",
  },
  suggestionTitle: {
    color: "#c4b5fd",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 12px 0",
  },
  suggestionText: {
    color: "#8a99b3",
    fontSize: "14px",
    lineHeight: "1.8",
    margin: "0 0 20px 0",
  },
  suggestionBtns: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
  suggYesBtn: {
    backgroundColor: "#7f77dd",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
    width: "100%",
    maxWidth: "360px",
  },
  suggNoBtn: {
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "1px solid #2d3748",
    borderRadius: "10px",
    padding: "10px 24px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
    width: "100%",
    maxWidth: "360px",
  },
  inputArea: {
    padding: "14px 16px",
    backgroundColor: "#16213e",
    borderTop: "1px solid #1e2d4a",
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#0f0f1e",
    border: "1px solid #2d3748",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#ffffff",
    fontSize: "14px",
    fontFamily: "'Segoe UI', sans-serif",
    resize: "none",
    outline: "none",
    lineHeight: "1.5",
  },
  iconBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

export default NirvanaChat;