import React, { useEffect, useState, useCallback } from "react";

/**
 * Toast notification — bottom-right, auto-dismisses in 3 s.
 *
 * Props:
 *   message  {string}             Text to display
 *   type     {"success"|"error"}  Visual style (default: "success")
 *   onDismiss {() => void}        Called after the exit animation finishes
 */
export default function Toast({ message, type = "success", onDismiss }) {
  const [phase, setPhase] = useState("enter"); // "enter" | "visible" | "exit"

  const dismiss = useCallback(() => {
    setPhase("exit");
    setTimeout(() => onDismiss && onDismiss(), 280);
  }, [onDismiss]);

  useEffect(() => {
    /* tick past first render so the browser registers the starting opacity */
    const t0 = setTimeout(() => setPhase("visible"), 10);
    const t1 = setTimeout(dismiss, 3000);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [dismiss]);

  const isSuccess = type === "success";

  const palette = isSuccess
    ? {
        bg: "#F0FDF4",
        border: "#86EFAC",
        text: "#15803D",
        iconBg: "#DCFCE7",
        iconColor: "#16A34A",
      }
    : {
        bg: "#FEF2F2",
        border: "#FECACA",
        text: "#DC2626",
        iconBg: "#FEE2E2",
        iconColor: "#EF4444",
      };

  const visible = phase === "visible";

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 99999,
        minWidth: 280,
        maxWidth: 400,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.10)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        pointerEvents: "auto",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: palette.iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isSuccess ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={palette.iconColor} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke={palette.iconColor} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>

      {/* Message */}
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: palette.text,
          lineHeight: 1.4,
        }}
      >
        {message}
      </span>

      {/* Close button */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: palette.text,
          opacity: 0.55,
          padding: "2px 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
          flexShrink: 0,
          fontSize: 18,
          lineHeight: 1,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
      >
        ×
      </button>
    </div>
  );
}
