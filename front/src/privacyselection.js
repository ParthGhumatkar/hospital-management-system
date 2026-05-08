import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PrivacySelection() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const patientName = state?.name || "Patient";
  const patientId = state?.patientId;

  const [mode, setMode] = useState("");

  const continueToChat = () => {
    if (!mode) return;

    navigate("/nirvanachat", {
      state: {
        name: patientName,
        patientId,
        privacyMode: mode,
      },
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.icon}>🛡️</div>

        <h1 style={styles.title}>
          Choose Your Privacy Mode
        </h1>

        <p style={styles.subtitle}>
          Select how you'd like to continue your conversation.
        </p>

        <div style={styles.options}>

          <button
            onClick={() => setMode("anonymous")}
            style={{
              ...styles.option,
              ...(mode === "anonymous" ? styles.selected : {}),
            }}
          >
            <h3>Anonymous</h3>
            <p>Your identity will remain hidden.</p>
          </button>

          <button
            onClick={() => setMode("verified")}
            style={{
              ...styles.option,
              ...(mode === "verified" ? styles.selected : {}),
            }}
          >
            <h3>Verified</h3>
            <p>Your patient identity will be visible.</p>
          </button>

        </div>

        <button
          disabled={!mode}
          onClick={continueToChat}
          style={{
            ...styles.continueBtn,
            opacity: mode ? 1 : 0.5,
          }}
        >
          Continue
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0D1117",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    color: "white",
    fontFamily: "DM Sans, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 500,
    background: "#161B22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 32,
    textAlign: "center",
  },

  icon: {
    fontSize: 52,
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    marginBottom: 10,
  },

  subtitle: {
    color: "#8B949E",
    marginBottom: 30,
    lineHeight: 1.6,
  },

  options: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
  },

  option: {
    background: "#21262D",
    border: "2px solid transparent",
    borderRadius: 18,
    padding: 20,
    textAlign: "left",
    cursor: "pointer",
    transition: "0.2s",
    color: "white",
  },

  selected: {
    border: "2px solid #7C3AED",
    background: "rgba(124,58,237,0.15)",
  },

  continueBtn: {
    width: "100%",
    background: "#7C3AED",
    color: "white",
    border: "none",
    borderRadius: 14,
    padding: "14px 20px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
  },
};