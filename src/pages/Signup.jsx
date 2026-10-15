// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ParticleBackground from "../components/ParticleBackground";
import { ROLES } from "../constants/roles";
import { Eye, EyeOff, Menu, X, Mail, User, Lock, Gift } from "lucide-react";
import "./Login.css"; // Reuse Login.css for consistent styling

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userRole, emailVerified, signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      if (!emailVerified && userRole === ROLES.USER) {
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

  // Auto-fill invitation code from URL
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setInvitationCode(refCode);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const referralCode = invitationCode.trim() || null;
      await signup(email, password, referralCode, name);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
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

          <div className="login-nav-links desktop-only">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/market" className="nav-link">Market</Link>
            <Link to="/news" className="nav-link">News</Link>
          </div>

          <div className="login-auth-buttons desktop-only">
            <Link to="/login" className="btn-outline">
              <span className="btn-icon">→</span> Login
            </Link>
            <Link to="/signup" className="btn-primary">
              <span className="btn-icon">👤</span> Sign Up
            </Link>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

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

        {/* SIGNUP FORM */}
        <div className="login-form-column">
          <div className="login-card new-login-card">
            <div className="login-header">
              <div className="login-logo-mini">
                <span className="text-cyan">AlphaGold </span>
                <span className="text-green">Trading</span>
              </div>
              <h2 className="login-title">Create Account</h2>
              <p className="login-subtitle">Start your trading journey today</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input with-icon"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-input with-icon with-toggle"
                    placeholder="Min. 6 characters"
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

              <div className="form-group">
                <label className="form-label">
                  Invitation Code <span style={{ color: '#64748b', fontSize: '12px' }}>(Optional)</span>
                </label>
                <div className="input-wrapper">
                  <Gift size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-input with-icon"
                    placeholder="Enter invitation code if you have one"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                  />
                </div>
                {invitationCode && (
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                    ✓ You'll be registered under this referral
                  </div>
                )}
              </div>

              <button type="submit" className="login-btn-gradient" disabled={loading}>
                {loading ? (
                  <>
                    <div className="spinner-mini" />
                    Creating Account...
                  </>
                ) : (
                  <>Create Account →</>
                )}
              </button>
            </form>

            <div className="login-footer mt-6">
              Already have an account?{" "}
              <Link to="/login" className="login-link font-bold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

