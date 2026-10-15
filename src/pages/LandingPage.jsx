// src/pages/LandingPage.jsx - Modern Redesign with Animations
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Zap, ShieldCheck, BarChart3, Globe, Gem } from "lucide-react";

export default function LandingPage() {
  const observerRef = useRef(null);

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all elements with 'fade-in-section' class
    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8FC] via-white to-[#edf2f7] overflow-hidden">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center">
            {/* Main Headline with staggered animation */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-fade-up">
              <span className="block text-slate-900 mb-2" style={{ animationDelay: '0.1s' }}>Your Gateway to</span>
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent animate-gradient" style={{ animationDelay: '0.3s' }}>
                Gold & Crypto Trading
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 mb-10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              Trade Gold (XAU), Bitcoin, Ethereum, and 500+ assets with confidence.
              Join 20,000,000+ traders using professional tools and bank-level security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ animationDelay: '0.7s' }}>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 hover:scale-105 hover:-translate-y-1"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 hover:border-cyan-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                Create Free Account →
              </Link>
              <Link
                to="/demo"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold rounded-lg hover:from-amber-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-105 hover:-translate-y-1"
              >
                ⚡ Try Demo Account
              </Link>
            </div>

            {/* Trust Badges with stagger */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: <Zap size={32} className="text-cyan-400" />, label: "Lightning Fast", desc: "Instant execution" },
                { icon: <ShieldCheck size={32} className="text-emerald-400" />, label: "Bank-Level Security", desc: "Your assets protected" },
                { icon: <BarChart3 size={32} className="text-blue-400" />, label: "Advanced Charts", desc: "Professional tools" },
                { icon: <Globe size={32} className="text-indigo-400" />, label: "24/7 Support", desc: "Always here for you" }
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center transform hover:scale-110 transition-all duration-300 animate-fade-up flex flex-col items-center"
                  style={{ animationDelay: `${0.9 + i * 0.1}s` }}
                >
                  <div className="mb-4 animate-bounce bg-white p-4 rounded-2xl border border-slate-200 shadow-sm" style={{ animationDuration: '2s', animationDelay: `${i * 0.2}s` }}>{item.icon}</div>
                  <div className="text-slate-900 font-semibold">{item.label}</div>
                  <div className="text-slate-500 text-sm">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-white/60 fade-in-section opacity-0 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Why Choose AlphaGold Trading?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Everything you need to trade Gold & Crypto confidently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Trading",
                desc: "Execute trades instantly with live market data and professional-grade charts",
                gradient: "from-cyan-500/10 to-blue-500/10",
                icon: <Zap size={40} className="text-cyan-400" />
              },
              {
                title: "Secure & Compliant",
                desc: "Bank-level encryption and regulatory compliance to keep your funds safe",
                gradient: "from-emerald-500/10 to-cyan-500/10",
                icon: <ShieldCheck size={40} className="text-emerald-400" />
              },
              {
                title: "Low Fees",
                desc: "Competitive trading fees with no hidden charges. Trade more, pay less",
                gradient: "from-blue-500/10 to-purple-500/10",
                icon: <Gem size={40} className="text-blue-400" />
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-slate-200 hover:border-cyan-200 transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer group flex flex-col items-start bg-white shadow-sm hover:shadow-md`}
              >
                <div className="mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 bg-slate-50 p-4 rounded-2xl border border-slate-100">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 fade-in-section opacity-0 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "20M+", label: "Active Traders" },
              { value: "$2.5B+", label: "Trading Volume" },
              { value: "500+", label: "Gold & Crypto Pairs" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 transform hover:scale-110 transition-all duration-300"
              >
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 fade-in-section opacity-0 transition-all duration-1000">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-slate-600 text-lg mb-10">
            Join thousands of traders making smarter Gold & Crypto investments
          </p>
          <Link
            to="/signup"
            className="inline-block px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50 hover:scale-110 hover:-translate-y-2"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .fade-in-section.animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }

        .fade-in-section {
          transform: translateY(50px);
        }
      `}</style>

    </div>
  );
}
