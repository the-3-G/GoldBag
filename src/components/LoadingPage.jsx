
import React, { useEffect, useState, useRef } from 'react';
import './LoadingPage.css';

const LETTERS = ['A','l','p','h','a','G','o','l','d','\u00A0','T','r','a','d','i','n','g'];

const statusSteps = [
  { title: "Securing trading session",   desc: "Connection encrypted and verified" },
  { title: "Syncing wallet balances",    desc: "Balances verified on the network" },
  { title: "Loading live order books",   desc: "Fetching order book depth and trades" },
  { title: "Checking market liquidity",  desc: "Analyzing liquidity across markets" },
  { title: "Preparing trade execution",  desc: "Optimizing engine for fastest execution" },
];

const COINS_DATA = [
  { sym: 'BTC/USDT',  name: 'Bitcoin',  val: '67,432.10', chg: '+2.14%', up: true,  prices: [66800, 67100, 67250, 67432], icon: '₿', iconBg: '#f7931a' },
  { sym: 'ETH/USDT',  name: 'Ethereum', val: '3,521.88',  chg: '+1.07%', up: true,  prices: [3480, 3505, 3510, 3521],    icon: 'Ξ', iconBg: '#627eea' },
  { sym: 'SOL/USDT',  name: 'Solana',   val: '172.44',    chg: '+4.51%', up: true,  prices: [165, 168, 170, 172.44],     icon: 'S', iconBg: '#9945ff' },
  { sym: 'USDT/ETB',  name: 'Tether',   val: '126.50',    chg: '+0.32%', up: true,  prices: [125.9, 126.1, 126.3, 126.5],icon: '₮', iconBg: '#26a17b' },
  { sym: 'USDC/USDT', name: 'USD Coin', val: '0.9998',    chg: '-0.01%', up: false, prices: [1.001, 1.000, 0.9999, 0.9998], icon: '$', iconBg: '#2775ca' },
];

export default function LoadingPage({ onDone }) {
  const [progress,       setProgress]       = useState(0);
  const [statusIndex,    setStatusIndex]    = useState(0);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [metrics,        setMetrics]        = useState({ latency: '12ms', health: '98.4%', node: 'SG-2' });
  const [leaving,        setLeaving]        = useState(false);
  const doneFired = useRef(false);

  // Letter-by-letter logo reveal
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setVisibleLetters(i);
      if (i >= LETTERS.length) clearInterval(t);
    }, 120);
    return () => clearInterval(t);
  }, []);

  // Progress bar — runs to 100 over ~1.5 seconds
  useEffect(() => {
    const t = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(t); return 100; }
        return Math.min(prev + Math.floor(Math.random() * 14) + 8, 100);
      });
    }, 80);
    return () => clearInterval(t);
  }, []);

  // Status step cycling
  useEffect(() => {
    const t = setInterval(() => {
      setStatusIndex(prev => prev < statusSteps.length - 1 ? prev + 1 : prev);
    }, 300);
    return () => clearInterval(t);
  }, []);

  // Live metrics flicker
  useEffect(() => {
    const t = setInterval(() => {
      setMetrics({
        latency: `${Math.floor(Math.random() * 8) + 8}ms`,
        health:  `${(98.2 + Math.random() * 1.5).toFixed(1)}%`,
        node:    `SG-${Math.floor(Math.random() * 4) + 1}`,
      });
    }, 1400);
    return () => clearInterval(t);
  }, []);

  // When progress hits 100, fade out then call onDone
  useEffect(() => {
    if (progress >= 100 && !doneFired.current) {
      doneFired.current = true;
      setTimeout(() => {
        setLeaving(true);
        setTimeout(() => {
          if (onDone) onDone();
        }, 250); // matches CSS fade-out duration
      }, 150); // show 100% briefly before fading
    }
  }, [progress, onDone]);

  return (
    <div className={`lp-root ${leaving ? 'lp-leaving' : ''}`}>
      {/* Background layers */}
      <div className="lp-bg-grid" />
      <div className="lp-scan-beam" />
      <div className="lp-orb lp-orb-a" />
      <div className="lp-orb lp-orb-b" />

      {/* Header */}
      <header className="lp-header">
        <div className="lp-logo-wrap">
          {LETTERS.map((ch, i) => (
            <span
              key={i}
              className={`lp-letter ${i < visibleLetters ? 'lp-letter-visible' : ''} ${i < 9 ? 'lp-letter-accent' : ''}`}
              style={{ transitionDelay: `${i * 0.05}s` }}
            >{ch}</span>
          ))}
        </div>
        <div className="lp-status-indicator">
          <span className="lp-pulse-dot" />
          <span>Secure Session</span>
        </div>
      </header>

      {/* ── Mobile Hero ── hidden on desktop, visible ≤768px */}
      <div className="lp-mobile-hero">
        <h2 className="lp-hero-title">Preparing Trading Dashboard</h2>
        <p className="lp-hero-subtitle">
          Syncing live market data, order books, balances, and secure trade routes.
        </p>
        <div className="lp-hero-pct">{progress}%</div>
        <div className="lp-hero-bar-track">
          <div className="lp-hero-bar-fill" style={{ width: `${progress}%` }}>
            <div className="lp-progress-glint" />
          </div>
        </div>
      </div>

      {/* Split layout */}
      <main className="lp-main-split">

        {/* Left: Market Watch */}
        <section className="lp-split-pane lp-left-pane">
          <div className="lp-pane-header">
            <h3>MARKET WATCH</h3>
            <span className="lp-pane-meta lp-live-badge">
              <span className="lp-live-dot" />Live
            </span>
          </div>
          <div className="lp-coin-list">
            {COINS_DATA.map((coin, index) => (
              <div key={coin.sym} className="lp-coin-row" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="lp-coin-icon" style={{ background: coin.iconBg }}>
                  {coin.icon}
                </div>
                <div className="lp-coin-info">
                  <span className="lp-coin-sym">{coin.sym}</span>
                  <span className="lp-coin-name">{coin.name}</span>
                </div>
                <div className="lp-coin-spark">
                  <svg viewBox="0 0 100 30" width="80" height="24" className="lp-spark-svg">
                    <path
                      d={`M 0,${coin.prices[0] % 30} L 30,${coin.prices[1] % 30} L 60,${coin.prices[2] % 30} L 100,${coin.prices[3] % 30}`}
                      fill="none"
                      stroke={coin.up ? '#00f5a0' : '#ff3366'}
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="lp-coin-pricing">
                  <span className="lp-coin-val">${coin.val}</span>
                  <span className={`lp-coin-chg ${coin.up ? 'lp-up' : 'lp-dn'}`}>{coin.chg}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-market-stats">
            <div><strong>$2.48M</strong><span>24h Volume</span></div>
            <div><strong>1,284</strong><span>Active Traders</span></div>
            <div><strong>2.1s</strong><span>Avg. Execution</span></div>
            <div><strong>High</strong><span>Liquidity</span></div>
          </div>
        </section>

        {/* Right: Trading Engine */}
        <section className="lp-split-pane lp-right-pane">
          <div className="lp-pane-header">
            <h3>TRADING ENGINE</h3>
            <span className="lp-pane-meta">{metrics.latency} RTT</span>
          </div>

          <div className="lp-console-content">
            {/* Big percentage — hidden on mobile (shown in lp-mobile-hero instead) */}
            <div className="lp-big-pct-wrap">
              <span className="lp-big-pct-label">PREPARING TRADING DASHBOARD</span>
              <span className="lp-big-pct-value">{progress}%</span>
              <p className="lp-loading-subtitle">
                Syncing live market data, order books, balances, and secure trade routes.
              </p>
            </div>

            <div className="lp-status-sequence">
              {statusSteps.map((step, idx) => {
                const isDone   = idx < statusIndex;
                const isActive = idx === statusIndex;
                return (
                  <div key={idx} className={`lp-seq-line ${isDone ? 'lp-seq-done' : ''} ${isActive ? 'lp-seq-active' : ''}`}>
                    <span className="lp-seq-bullet">{isDone ? '✓' : '○'}</span>
                    <div className="lp-seq-copy">
                      <span className="lp-seq-title">{step.title}</span>
                      <span className="lp-seq-desc">{step.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Trust Badges */}
      <section className="lp-trust-row">
        <div className="lp-trust-card">
          <span>🛡</span>
          <div>
            <strong>Escrow Protected</strong>
            <p>Your trades are secured with multi-layer escrow.</p>
          </div>
        </div>
        <div className="lp-trust-card">
          <span>✅</span>
          <div>
            <strong>Verified Merchants</strong>
            <p>Merchants are KYC verified and monitored.</p>
          </div>
        </div>
        <div className="lp-trust-card">
          <span>🔒</span>
          <div>
            <strong>Encrypted Connection</strong>
            <p>Your data and funds are protected end-to-end.</p>
          </div>
        </div>
      </section>

      {/* Footer progress bar */}
      <footer className="lp-footer">
        <div className="lp-progress-track">
          <div className="lp-progress-fill" style={{ width: `${progress}%` }}>
            <div className="lp-progress-glint" />
          </div>
        </div>
        <div className="lp-footer-row">
          <span className="lp-footer-loading">
            <span className="lp-pulse-dot lp-pulse-dot-sm" />
            LOADING DASHBOARD...
          </span>
          <span className="lp-footer-metric">
            NODE: {metrics.node}&nbsp;|&nbsp;HEALTH: <span className="lp-up">{metrics.health}</span>
          </span>
          <span className="lp-footer-pct lp-up">{progress}%</span>
        </div>
      </footer>
    </div>
  );
}
