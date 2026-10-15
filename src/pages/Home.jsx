// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDemoMode } from "../contexts/DemoContext";
import MarketCard from "../components/MarketCard";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getUserTransactions } from "../services/transactionService";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightLeft,
  RefreshCw,
  LineChart,
  Clock,
  Wallet,
  Headset,
  Mail,
  ArrowRight,
  ChevronDown,
  Activity,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { getGoldMarketData } from "../services/priceService";
import "./Home.css";

export default function Home() {
  const { user } = useAuth();
  const { isDemo, demoWallet, demoTransactions } = useDemoMode();

  const [trending, setTrending] = useState([]);
  const [news, setNews] = useState([]);
  const [top, setTop] = useState([]);
  const [balanceHidden, setBalanceHidden] = useState(true);
  const [balance, setBalance] = useState(0);
  const [mainBalance, setMainBalance] = useState(0);
  const [tradingBalance, setTradingBalance] = useState(0);
  const [kycStatus, setKycStatus] = useState("unverified");
  const [assets, setAssets] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [, setLoading] = useState(true);
  const [dailyPL, setDailyPL] = useState(1.24); // Simulated initial P/L


  // Quick Trade State
  const [qtPair, setQtPair] = useState("XAU/USDT");
  const [qtAmount, setQtAmount] = useState("");
  const [qtType, setQtType] = useState("market");

  // In demo mode, seed balances & transactions from DemoContext
  useEffect(() => {
    if (isDemo && demoWallet) {
      setMainBalance(demoWallet.mainBalance);
      setTradingBalance(demoWallet.tradingBalance);
      setBalance(demoWallet.mainBalance + demoWallet.tradingBalance);
      setKycStatus("verified");
      setRecentTransactions(demoTransactions.slice(0, 4));
      setLoadingTransactions(false);
      setLoading(false);
    }
  }, [isDemo, demoWallet, demoTransactions]);

  // Subscribe to Firebase Wallet and User KYC Status (real users only)
  useEffect(() => {
    if (isDemo || !user?.uid) return;

    // Subscribe to Wallet Balance changes
    const unsubWallet = onSnapshot(doc(db, "wallets", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const main = data.mainBalance !== undefined ? data.mainBalance : (data.balance || 0);
        const trading = data.tradingBalance !== undefined ? data.tradingBalance : 0;
        setMainBalance(main);
        setTradingBalance(trading);
        setBalance(main + trading);
        // Load coin holdings
        if (data.assets) setAssets(data.assets);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching wallet:", error);
      setLoading(false);
    });

    // Subscribe to User profile/KYC changes
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        const status = userData.verification?.status || userData.kycStatus || "unverified";
        setKycStatus(status);
      }
    });

    return () => {
      unsubWallet();
      unsubUser();
    };
  }, [isDemo, user]);

  // Load Recent Transactions (real users only)
  useEffect(() => {
    if (isDemo || !user?.uid) return;

    const fetchTx = async () => {
      try {
        setLoadingTransactions(true);
        const data = await getUserTransactions(user.uid);
        setRecentTransactions(data.slice(0, 4));
      } catch (error) {
        console.error("Error loading recent transactions:", error);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTx();
  }, [isDemo, user, balance]);

  // Fetch Gecko Trending Coins
  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/search/trending")
      .then((r) => r.json())
      .then((d) => {
        if (d?.coins) setTrending(d.coins.slice(0, 4));
      })
      .catch(() => { });
  }, []);

  // Fetch News Feeds via RSS
  useEffect(() => {
    fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fcointelegraph.com%2Frss")
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "ok" && d.items) {
          const formattedNews = d.items.map((item) => ({
            title: item.title,
            body: item.description ? item.description.replace(/<[^>]+>/g, '') : '',
            source: "Cointelegraph",
            url: item.link,
            imageurl: item.thumbnail || (item.enclosure && item.enclosure.link) || "",
            published_on: new Date(item.pubDate).getTime() / 1000
          }));
          setNews(formattedNews.slice(0, 3));
        }
      })
      .catch(() => { });
  }, []);

  // Fetch initial prices from CoinGecko, then tick all pairs every 2s (incl. gold)
  useEffect(() => {
    const TICK_MS = 2000;
    const ANCHOR_MS = 30000;
    let tickInterval;
    let anchorInterval;
    let cancelled = false;

    const tickCoin = (coin) => {
      const price = coin.current_price;
      if (!price || price <= 0) return coin;

      const volatility = price > 10000 ? 0.0008
        : price > 100 ? 0.0012
          : price > 1 ? 0.002
            : 0.004;

      const change = price * volatility * (Math.random() * 2 - 1);
      const newPrice = Math.max(price * 0.98, price + change);
      const direction = newPrice > price ? "up" : "down";

      return {
        ...coin,
        current_price: parseFloat(newPrice.toFixed(price > 1 ? 4 : 8)),
        price_direction: direction,
        flash_key: Date.now() + Math.random(),
      };
    };

    async function fetchMarketRows() {
      const [marketsRes, goldObj] = await Promise.all([
        fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=15&page=1&order=market_cap_desc"
        ),
        getGoldMarketData(true),
      ]);

      const d = await marketsRes.json();
      if (!Array.isArray(d)) throw new Error("Invalid market data");

      d.splice(1, 0, goldObj);
      return d;
    }

    async function loadMarketData() {
      try {
        const rows = await fetchMarketRows();
        if (!cancelled) setTop(rows);
      } catch {
        if (!cancelled) {
          getGoldMarketData(true).then((goldObj) => setTop([goldObj])).catch(() => { });
        }
      }
    }

    loadMarketData();

    // Live tick — all pairs including XAU/USDT
    tickInterval = setInterval(() => {
      setTop((prev) => (prev.length ? prev.map(tickCoin) : prev));
      setDailyPL((prev) => parseFloat((prev + (Math.random() * 0.1 - 0.04)).toFixed(2)));
    }, TICK_MS);

    // Periodically re-anchor to real API prices without slowing the tick
    anchorInterval = setInterval(async () => {
      if (cancelled) return;
      try {
        const rows = await fetchMarketRows();
        if (!cancelled) setTop(rows);
      } catch { /* keep ticking on last known prices */ }
    }, ANCHOR_MS);

    return () => {
      cancelled = true;
      clearInterval(tickInterval);
      clearInterval(anchorInterval);
    };
  }, []);

  return (
    <div className="fx-home">
      <div className="fx-dashboard-layout full-width-layout">

        {/* LEFT COLUMN - MAIN TRADING VIEW */}
        <div className="fx-main-content">

          {/* BALANCE CARD */}
          <section className="fx-balance">
            <div className="fx-balance-premium-card">
              <div className="fx-balance-inner">
                <div className="fx-balance-header">
                  <h3 className="section-title">Total Assets</h3>
                  <span className="balance-live-badge">Live Portfolio</span>
                </div>

                <div className="total-assets-extended">
                  <div className="bal-main-row">
                    <div className="bal-amount">
                      {balanceHidden ? "******* **" : `${Number(balance).toFixed(2)}`}
                      <span className="bal-currency">USDT</span>
                      <button
                        className="eye-btn"
                        title={balanceHidden ? "Show balance" : "Hide balance"}
                        onClick={() => setBalanceHidden(!balanceHidden)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </button>
                    </div>
                    <div className="bal-fiat-eq">
                      ≈ {balanceHidden ? "***.**" : `$${Number(balance).toFixed(2)}`}
                    </div>
                  </div>
                  <div className="bal-stats-row">
                    <div className="bal-stat">
                      <span className="b-label">Today's P/L</span>
                      <span className={`b-value ${dailyPL >= 0 ? 'positive' : 'negative'}`}>
                        {dailyPL >= 0 ? '+' : ''}{dailyPL.toFixed(2)}%
                      </span>
                    </div>
                    <div className="bal-stat">
                      <span className="b-label">Available</span>
                      <span className="b-value">{balanceHidden ? "***.**" : Number(mainBalance).toFixed(2)}</span>
                    </div>
                    <div className="bal-stat">
                      <span className="b-label">Locked</span>
                      <span className="b-value">0.00</span>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <Link to="/deposit" className="btn deposit">
                    <ArrowDownToLine size={20} /> Deposit
                  </Link>
                  <Link to="/withdraw" className="btn withdraw">
                    <ArrowUpFromLine size={20} /> Withdraw
                  </Link>
                  <Link to="/account-transfer" className="btn transfer">
                    <ArrowRightLeft size={20} /> Transfer
                  </Link>
                  <Link to="/exchange" className="btn convert">
                    <RefreshCw size={20} /> Convert
                  </Link>
                </div>
              </div>

              <div className="fx-balance-graphic" aria-hidden="true">
                <div className="graphic-orb orb-1" />
                <div className="graphic-orb orb-2" />
                <div className="graphic-orb orb-3" />
                <div className="graphic-grid" />
              </div>
            </div>
          </section>

          {/* QUICK ACTIONS */}
          <section className="fx-quick">
            <h3>Quick Actions</h3>
            <div className="qa-grid">
              <Link to="/trade" className="qa-card">
                <div className="qa-ico qa-ico--green"><LineChart size={26} /></div>
                <div className="qa-title">Trade Now</div>
                <div className="qa-subtitle">Open positions</div>
              </Link>

              <Link to="/transactions" className="qa-card">
                <div className="qa-ico qa-ico--cyan"><Clock size={26} /></div>
                <div className="qa-title">Orders</div>
                <div className="qa-subtitle">View history</div>
              </Link>

              <Link to="/wallet" className="qa-card">
                <div className="qa-ico qa-ico--blue"><Wallet size={26} /></div>
                <div className="qa-title">Wallet</div>
                <div className="qa-subtitle">Manage funds</div>
              </Link>

              <div className="qa-card qa-support-card">
                <div className="qa-ico qa-ico--purple"><Headset size={24} /></div>
                <div className="qa-title">Support</div>
                <div className="qa-subtitle">Get help</div>
                <div className="qa-support-btns">
                  <Link to="/chat" className="qa-support-btn">
                    <Headset size={13} /> Live Chat
                  </Link>
                  <a href="mailto:Alphagoldprotrading@gmail.com" className="qa-support-btn qa-support-btn--email">
                    <Mail size={13} /> Email
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* TOP GOLD & CRYPTOS */}
          <section className="fx-top">
            <h3>Market Overview</h3>

            <div className="market-table-container">
              <table className="crypto-table">
                <thead>
                  <tr>
                    <th>Trading Pair</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th className="hide-mobile">24h Volume</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {top.length ? (
                    top.slice(0, 8).map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="pair-cell">
                            <img src={c.image} alt={c.name} />
                            <span className="pair-name">{c.symbol.toUpperCase()}/USDT</span>
                          </div>
                        </td>
                        <td className="price-cell">
                          <span
                            className={c.price_direction === 'up' ? 'price-up' : c.price_direction === 'down' ? 'price-down' : 'price-neutral'}
                          >
                            ${c.current_price ? Number(c.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : "—"}
                          </span>
                        </td>
                        <td className={`change-cell ${c.price_change_percentage_24h >= 0 ? "up" : "down"}`}>
                          {c.price_change_percentage_24h > 0 ? "+" : ""}{c.price_change_percentage_24h?.toFixed(2)}%
                        </td>
                        <td className="hide-mobile vol-cell">
                          {c.total_volume ? `$${(c.total_volume / 1000000).toFixed(2)}M` : "—"}
                        </td>
                        <td>
                          <Link to={`/trade?coin=${c.id}`} className="btn-trade-sm">
                            Trade
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="placeholder-row">
                        <td><div className="placeholder-blob" /></td>
                        <td><div className="placeholder-blob" /></td>
                        <td><div className="placeholder-blob" /></td>
                        <td className="hide-mobile"><div className="placeholder-blob" /></td>
                        <td><div className="placeholder-blob btn" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* MARKET INSIGHTS */}
          <section className="fx-market">
            <div className="mi-head">
              <h3>Market Insights</h3>
              <Link to="/news" className="view-all">
                View All <ArrowRight size={14} style={{ marginLeft: '4px' }} />
              </Link>
            </div>

            <div className="mi-carousel">
              {news.length ? (
                news.map((n, idx) => <MarketCard key={idx} item={n} />)
              ) : (
                <>
                  <MarketCard placeholder />
                  <MarketCard placeholder />
                  <MarketCard placeholder />
                </>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - ACCOUNT DETAILS SIDEBAR */}
        <aside className="fx-sidebar">

          {/* QUICK TRADE WIDGET */}
          <div className="sidebar-card fx-quick-trade-sidebar-card glass-card">
            <h4>Quick Trade</h4>
            <div className="quick-trade-form">
              <div className="qt-field">
                <label>Pair</label>
                <div className="qt-select-wrap">
                  <select value={qtPair} onChange={(e) => setQtPair(e.target.value)} className="qt-select">
                    <option value="XAU/USDT">XAU/USDT</option>
                    <option value="BTC/USDT">BTC/USDT</option>
                    <option value="ETH/USDT">ETH/USDT</option>
                    <option value="SOL/USDT">SOL/USDT</option>
                    <option value="BNB/USDT">BNB/USDT</option>
                    <option value="XRP/USDT">XRP/USDT</option>
                  </select>
                  <ChevronDown size={16} className="sel-icon" />
                </div>
              </div>

              <div className="qt-row">
                <div className="qt-field flex-1">
                  <label>Order Type</label>
                  <div className="qt-type-toggle">
                    <button
                      className={`qt-type-btn ${qtType === 'market' ? 'active' : ''}`}
                      onClick={() => setQtType('market')}
                    >
                      Market
                    </button>
                    <button
                      className={`qt-type-btn ${qtType === 'limit' ? 'active' : ''}`}
                      onClick={() => setQtType('limit')}
                    >
                      Limit
                    </button>
                  </div>
                </div>
              </div>

              <div className="qt-field">
                <label>Amount</label>
                <div className="qt-input-wrap">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={qtAmount}
                    onChange={(e) => setQtAmount(e.target.value)}
                    className="qt-input"
                  />
                  <span className="qt-currency">USDT</span>
                </div>
              </div>

              <Link to={`/trade?pair=${qtPair.replace('/', '-')}`} className="qt-submit-btn">
                <Activity size={18} /> Open Trade
              </Link>
            </div>
          </div>
          <div className="sidebar-card fx-security-sidebar-card glass-card">
            <div className="sidebar-card-header">
              <h4>Account Security</h4>
              {kycStatus === "verified" ? (
                <span className="sec-badge verified">
                  <ShieldCheck size={14} /> Verified
                </span>
              ) : (
                <span className="sec-badge unverified">
                  <ShieldAlert size={14} /> Unverified
                </span>
              )}
            </div>
            <div className="sec-content">
              <div className="sec-level-row">
                <span>Security Level:</span>
                <span className={`sec-level-val ${kycStatus === 'verified' ? 'high' : 'medium'}`}>
                  {kycStatus === 'verified' ? 'High' : 'Medium'}
                </span>
              </div>
              <div className="sec-limits-row">
                <span>Daily Withdrawal Limit:</span>
                <span className="limit-val">
                  {kycStatus === 'verified' ? '$1,000,000' : '$10,000'}
                </span>
              </div>
              {kycStatus !== 'verified' && (
                <Link to="/profile?tab=kyc" className="sec-action-btn">
                  Verify Identity
                </Link>
              )}
            </div>
          </div>

          {/* PORTFOLIO SUMMARY */}
          <div className="sidebar-card fx-portfolio-sidebar-card glass-card">
            <div className="sidebar-card-header">
              <h4>Portfolio Summary</h4>
              <Link to="/wallet" className="view-all-sidebar">View All</Link>
            </div>
            <div className="portfolio-breakdown">
              <div className="portfolio-row">
                <div className="p-label-group">
                  <span className="p-icon">₮</span>
                  <div>
                    <div className="p-symbol">USDT</div>
                    <div className="p-name">Tether</div>
                  </div>
                </div>
                <div className="p-amount-group">
                  <div className="p-val">{balanceHidden ? '****' : Number(mainBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className="p-usd">{balanceHidden ? '***' : `≈ $${Number(mainBalance).toFixed(2)}`}</div>
                </div>
              </div>
              {Object.entries(assets)
                .filter(([sym]) => sym !== 'USDT')
                .filter(([, data]) => (data.total || 0) > 0)
                .map(([sym, data]) => {
                  const marketCoin = top.find(c => c.symbol.toUpperCase() === sym.toUpperCase());
                  const usdVal = marketCoin ? (data.total || 0) * marketCoin.current_price : 0;
                  const iconChar = sym === 'BTC' ? '₿' : sym === 'ETH' ? 'Ξ' : sym === 'BNB' ? 'B' : sym[0];
                  return (
                    <div key={sym} className="portfolio-row">
                      <div className="p-label-group">
                        <span className="p-icon p-icon--accent">{iconChar}</span>
                        <div>
                          <div className="p-symbol">{sym}</div>
                          <div className="p-name">{data.name || sym}</div>
                        </div>
                      </div>
                      <div className="p-amount-group">
                        <div className="p-val">{balanceHidden ? '****' : Number(data.total || 0).toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
                        <div className="p-usd">{balanceHidden ? '***' : `≈ $${usdVal.toFixed(2)}`}</div>
                      </div>
                    </div>
                  );
                })
              }
              {Object.keys(assets).filter(s => s !== 'USDT').filter(s => (assets[s]?.total || 0) > 0).length === 0 && (
                <div className="sidebar-empty">No crypto holdings yet</div>
              )}
            </div>

            <div className="portfolio-ratio-bar-container">
              <div
                className="portfolio-ratio-bar main-fill"
                style={{
                  width: `${balance > 0 ? (mainBalance / balance) * 100 : 50}%`,
                  transition: 'width 0.4s ease'
                }}
              />
              <div
                className="portfolio-ratio-bar trading-fill"
                style={{
                  width: `${balance > 0 ? (tradingBalance / balance) * 100 : 50}%`,
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <div className="portfolio-ratio-labels">
              <span>{balance > 0 ? ((mainBalance / balance) * 100).toFixed(0) : 50}% Main</span>
              <span>{balance > 0 ? ((tradingBalance / balance) * 100).toFixed(0) : 50}% Trade</span>
            </div>

            <Link to="/account-transfer" className="transfer-shortcut-btn">
              Transfer Funds <ArrowRightLeft size={14} style={{ marginLeft: '6px' }} />
            </Link>
          </div>

          {/* WATCHLIST / TRENDING */}
          <div className="sidebar-card fx-watchlist-sidebar-card glass-card">
            <h4>🔥 Trending Watchlist</h4>
            <div className="trend-list-sidebar">
              {trending.length > 0 ? (
                trending.map((t) => (
                  <Link to={`/trade?coin=${t.item.id}`} key={t.item.coin_id} className="trend-mini-sidebar" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img src={t.item.small} alt={t.item.name} />
                    <div className="t-name-group">
                      <div className="t-symbol">{t.item.symbol.toUpperCase()}</div>
                      <div className="t-name">{t.item.name}</div>
                    </div>
                    <div className="t-rank">Rank #{t.item.market_cap_rank}</div>
                  </Link>
                ))
              ) : (
                <div className="sidebar-empty">Loading watchlist...</div>
              )}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="sidebar-card fx-activity-sidebar-card glass-card">
            <div className="sidebar-card-header">
              <h4>Recent Activity</h4>
              <Link to="/transactions" className="view-all-sidebar">
                History
              </Link>
            </div>
            <div className="activity-list">
              {loadingTransactions ? (
                <div className="sidebar-empty">Loading activity...</div>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div className="activity-item" key={tx.id}>
                    <div className={`activity-icon-circle ${tx.type.toLowerCase()}`}>
                      {tx.type === "Deposit" ? "↓" : tx.type === "Withdrawal" ? "↑" : tx.type === "Transfer" ? "⇄" : "⇄"}
                    </div>
                    <div className="activity-info">
                      <span className="activity-title">{tx.type}</span>
                      <span className="activity-date">
                        {tx.date ? new Date(tx.date).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <div className={`activity-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                      {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="sidebar-empty">No recent activity.</div>
              )}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
