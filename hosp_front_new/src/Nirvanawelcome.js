import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function NirvanaWelcome() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const patientName = state?.name;
  const patientId = state?.patientId;

  const handleAnonymous = () => {
    navigate("/nirvana/chat", {
      state: { mode: "anonymous" },
    });
  };

  const handleVerified = () => {
    navigate("/nirvana/chat", {
      state: { mode: "verified", name: patientName, patientId },
    });
  };

  return (
    <div style={styles.page}>

      {/* Back button */}
      <button style={styles.backBtn} onClick={() => navigate("/home/patient", { state: { name: patientName, patientId } })}>
        ← Back to Dashboard
      </button>

      {/* Logo + heading */}
      <div style={styles.hero}>
        <div style={styles.logoCircle}>🧠</div>
        <h1 style={styles.title}>Nirvana AI</h1>
        <p style={styles.subtitle}>
          A safe space to talk. No judgment, no pressure — just support.
        </p>
      </div>

      {/* Mode cards */}
      <div style={styles.cardRow}>

        {/* Anonymous */}
        <div style={styles.modeCard} onClick={handleAnonymous}>
          <div style={styles.modeIcon}>🕶️</div>
          <h2 style={styles.modeTitle}>Anonymous</h2>
          <p style={styles.modeDesc}>
            No name. No data saved. Your conversation stays completely private — nothing is stored or linked to your profile.
          </p>
          <div style={styles.modeTag}>
            <span style={{ ...styles.tag, backgroundColor: "#2a2a4a", color: "#a89ff5" }}>
              Full privacy
            </span>
            <span style={{ ...styles.tag, backgroundColor: "#2a2a4a", color: "#a89ff5" }}>
              No login required
            </span>
          </div>
          <button style={{ ...styles.modeBtn, backgroundColor: "#7f77dd" }}>
            Continue Anonymously →
          </button>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Verified */}
        <div style={styles.modeCard} onClick={handleVerified}>
          <div style={styles.modeIcon}>✅</div>
          <h2 style={styles.modeTitle}>Verified</h2>
          <p style={styles.modeDesc}>
            Uses your hospital profile. Your wellness progress is tracked, and if needed, support can be escalated to a counselor with your consent.
          </p>
          <div style={styles.modeTag}>
            <span style={{ ...styles.tag, backgroundColor: "#1a3a2a", color: "#5dcaa5" }}>
              Progress tracked
            </span>
            <span style={{ ...styles.tag, backgroundColor: "#1a3a2a", color: "#5dcaa5" }}>
              Consent-based escalation
            </span>
          </div>
          <button style={{ ...styles.modeBtn, backgroundColor: "#1d9e75" }}>
            Continue as {patientName || "Verified User"} →
          </button>
        </div>

      </div>

      {/* Footer note */}
      <p style={styles.footerNote}>
        🔒 All conversations are encrypted. You can switch modes anytime.
      </p>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0f0f1e",
    fontFamily: "'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 20px 60px",
  },
  backBtn: {
    alignSelf: "flex-start",
    background: "none",
    border: "none",
    color: "#7f8fa4",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "20px",
    padding: "0",
    fontFamily: "'Segoe UI', sans-serif",
  },
  hero: {
    textAlign: "center",
    marginBottom: "48px",
  },
  logoCircle: {
    fontSize: "52px",
    marginBottom: "16px",
    display: "block",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "36px",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: 0,
    fontSize: "16px",
    color: "#7f8fa4",
    maxWidth: "420px",
    lineHeight: "1.6",
  },
  cardRow: {
    display: "flex",
    alignItems: "stretch",
    gap: "0",
    width: "100%",
    maxWidth: "780px",
  },
  modeCard: {
    flex: 1,
    backgroundColor: "#16213e",
    borderRadius: "16px",
    padding: "32px 28px",
    cursor: "pointer",
    border: "1px solid #1e2d4a",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  modeIcon: {
    fontSize: "36px",
  },
  modeTitle: {
    margin: "0",
    fontSize: "22px",
    fontWeight: "600",
    color: "#ffffff",
  },
  modeDesc: {
    margin: "0",
    fontSize: "14px",
    color: "#8a99b3",
    lineHeight: "1.7",
    flexGrow: 1,
  },
  modeTag: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tag: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
  },
  modeBtn: {
    marginTop: "8px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Segoe UI', sans-serif",
    textAlign: "left",
  },
  divider: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 20px",
    gap: "10px",
  },
  dividerLine: {
    width: "1px",
    flex: 1,
    backgroundColor: "#1e2d4a",
  },
  dividerText: {
    color: "#3a4a60",
    fontSize: "13px",
    fontWeight: "500",
  },
  footerNote: {
    marginTop: "40px",
    fontSize: "13px",
    color: "#3a4a60",
    textAlign: "center",
  },
};

export default NirvanaWelcome;