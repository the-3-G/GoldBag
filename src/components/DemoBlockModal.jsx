// src/components/DemoBlockModal.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useDemoMode } from "../contexts/DemoContext";

const overlayStyle = {
  position: "fixed", inset: 0, zIndex: 99999,
  background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "20px",
};

const cardStyle = {
  background: "linear-gradient(135deg, #1e1b18 0%, #292524 100%)",
  border: "1px solid rgba(245, 158, 11, 0.35)",
  borderRadius: "20px",
  padding: "40px 32px",
  maxWidth: "420px",
  width: "100%",
  textAlign: "center",
  boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.1)",
  position: "relative",
};

const iconWrapStyle = {
  width: "72px", height: "72px", borderRadius: "50%",
  background: "linear-gradient(135deg, #d97706, #f59e0b)",
  display: "flex", alignItems: "center", justifyContent: "center",
  margin: "0 auto 20px", fontSize: "32px",
  boxShadow: "0 8px 32px rgba(245,158,11,0.4)",
};

const badgeStyle = {
  display: "inline-block",
  background: "rgba(245,158,11,0.15)",
  color: "#f59e0b",
  fontSize: "11px", fontWeight: 700,
  letterSpacing: "1.5px", textTransform: "uppercase",
  padding: "4px 12px", borderRadius: "20px",
  border: "1px solid rgba(245,158,11,0.3)",
  marginBottom: "16px",
};

export default function DemoBlockModal({ feature = "This feature", onClose }) {
  const { exitDemo } = useDemoMode();
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={e => e.stopPropagation()}>
        <div style={iconWrapStyle}>🔒</div>
        <div style={badgeStyle}>Demo Mode</div>
        <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>
          Real Account Required
        </h2>
        <p style={{ color: "#a8a29e", fontSize: "14px", lineHeight: 1.7, marginBottom: "28px" }}>
          <strong style={{ color: "#fbbf24" }}>{feature}</strong> is only available with a real account.
          Your demo has <strong style={{ color: "#34d399" }}>$50,000 virtual funds</strong> — create a real account to start trading with actual money.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            to="/signup"
            onClick={exitDemo}
            style={{
              background: "linear-gradient(135deg, #d97706, #f59e0b)",
              color: "#1c1917", fontWeight: 800, fontSize: "15px",
              padding: "14px 24px", borderRadius: "12px",
              textDecoration: "none", display: "block",
              transition: "all 0.2s", letterSpacing: "0.3px",
            }}
          >
            🚀 Create Free Account
          </Link>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)", color: "#a8a29e",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
              padding: "12px 24px", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            Continue Exploring Demo
          </button>
        </div>
      </div>
    </div>
  );
}
