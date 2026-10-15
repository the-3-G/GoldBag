import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ParticleBackground from "../components/ParticleBackground";
import { ROLES } from "../constants/roles";
import { Eye, EyeOff, Menu, X, Mail } from "lucide-react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole, emailVerified, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      if (userRole !== ROLES.ADMIN && !emailVerified) {
        navigate("/verify-email", { replace: true });
        return;
      }
      if (userRole === ROLES.ADMIN) {
        navigate("/admin/dashboard", { replace: true });
      } else if (userRole === ROLES.AGENT) {
        navigate("/agent/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [user, userRole, emailVerified, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError("Failed to login. Please check your credentials.");
      }
      setLoading(false);
    }
  };



  return (
    <div className="login-page">
      <ParticleBackground />

      {/* TOP NAVIGATION */}
      <nav className="login-navbar">
        <div className="login-nav-container">
          <Link to="/" className="login-brand">
            <img src="/favicon.png" alt="AlphaGold Trading Logo" className="login-brand-logo" />
            <span className="login-brand-text">
              <span className="text-cyan">AlphaGold </span>
              <span className="text-green">Trading</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="login-nav-links desktop-only">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/market" className="nav-link">Market</Link>
            <Link to="/news" className="nav-link">News</Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="login-auth-buttons desktop-only">
            <Link to="/login" className="btn-outline">
              <span className="btn-icon">→</span> Login
            </Link>
            <Link to="/signup" className="btn-primary">
              <span className="btn-icon">👤</span> Sign Up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-dropdown">
            <Link to="/" className="mobile-nav-link">Home</Link>
            <Link to="/market" className="mobile-nav-link">Market</Link>
            <Link to="/news" className="mobile-nav-link">News</Link>
            <div className="mobile-auth-stack">
              <Link to="/login" className="btn-outline w-full justify-center">Login</Link>
              <Link to="/signup" className="btn-primary w-full justify-center">Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN LAYOUT */}
      <div className="login-main-container">
        {/* LOGIN FORM */}
        <div className="login-form-column">
          <div className="login-card new-login-card">
            <div className="login-header">
              <div className="login-logo-mini">
                <span className="text-cyan">AlphaGold </span>
                <span className="text-green">Trading</span>
              </div>
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to continue trading</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    className="form-input with-icon"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input with-icon with-toggle"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="forgot-password-link-container">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="login-btn-gradient" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner-mini" />
                    Signing in...
                  </>
                ) : (
                  <>Sign In →</>
                )}
              </button>
            </form>

            <div className="login-footer mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="login-link font-bold">
                Create Account
              </Link>
            </div>

            {/* Demo Account CTA */}
            <div style={{
              marginTop: "20px",
              padding: "16px",
              background: "linear-gradient(135deg, rgba(217,119,6,0.12), rgba(245,158,11,0.08))",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "12px", color: "#a8a29e", marginBottom: "10px" }}>
                🎓 Want to explore first? Try our risk-free demo
              </div>
              <Link
                to="/demo"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #d97706, #f59e0b)",
                  color: "#1c1917",
                  fontWeight: 800,
                  fontSize: "14px",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  letterSpacing: "0.3px",
                  transition: "all 0.2s",
                }}
              >
                ⚡ Try Demo Account — No signup needed
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
