// src/components/DemoBanner.jsx
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDemoMode } from "../contexts/DemoContext";
import "./DemoBanner.css";

export default function DemoBanner() {
  const { isDemo, exitDemo } = useDemoMode();
  const navigate = useNavigate();

  // Push page content down when banner is shown
  useEffect(() => {
    if (isDemo) {
      document.body.style.paddingTop = "44px";
    } else {
      document.body.style.paddingTop = "";
    }
    return () => {
      document.body.style.paddingTop = "";
    };
  }, [isDemo]);

  if (!isDemo) return null;

  const handleExit = () => {
    exitDemo();
    navigate("/login", { replace: true });
  };

  return (
    <div className="demo-banner" role="banner" aria-label="Demo mode active">
      <div className="demo-banner-left">
        <div className="demo-pulse-dot" />
        <div className="demo-banner-text">
          <span>⚡ DEMO MODE</span> — Virtual funds only. Trades are simulated. No real money at risk.
        </div>
        <div className="demo-banner-virtual-badge">$50,000 Virtual</div>
      </div>

      <div className="demo-banner-actions">
        <Link to="/signup" className="demo-btn-create" onClick={exitDemo}>
          Create Real Account
        </Link>
        <button className="demo-btn-exit" onClick={handleExit}>
          Exit Demo
        </button>
      </div>
    </div>
  );
}
