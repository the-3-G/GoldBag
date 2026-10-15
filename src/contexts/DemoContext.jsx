// src/contexts/DemoContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const DemoContext = createContext(null);
export const useDemoMode = () => useContext(DemoContext);

const DEMO_SESSION_KEY = "gb_demo_active";

// Pre-filled demo data
const DEMO_USER = {
  uid: "demo-user-001",
  email: "demo@upholdtradingpro.com",
  name: "Demo Trader",
  displayName: "Demo Trader",
  role: "user",
  kycStatus: "verified",
  isDemo: true,
  verification: { status: "verified" },
  createdAt: new Date("2024-01-15"),
  photoURL: null,
};

const DEMO_WALLET = {
  uid: "demo-user-001",
  mainBalance: 32450.00,
  tradingBalance: 17550.00,
  balance: 50000.00,
  commissionBalance: 0,
  assets: {
    USDT: { name: "Tether", symbol: "USDT", total: 32450, networks: { TRC20: 20000, ERC20: 8450, BEP20: 4000 } },
    BTC:  { name: "Bitcoin", symbol: "BTC", total: 0.1812, networks: { Bitcoin: 0.1812 } },
    ETH:  { name: "Ethereum", symbol: "ETH", total: 2.45, networks: { Ethereum: 2.0, Arbitrum: 0.45 } },
    SOL:  { name: "Solana", symbol: "SOL", total: 18.6, networks: { Solana: 18.6 } },
    BNB:  { name: "BNB", symbol: "BNB", total: 15.4, networks: { "BSC (BEP20)": 15.4 } },
    XRP:  { name: "XRP", symbol: "XRP", total: 420.0, networks: { Ripple: 420.0 } },
    DOGE: { name: "Dogecoin", symbol: "DOGE", total: 1800.0, networks: { Dogecoin: 1800.0 } },
  },
};

const DEMO_TRANSACTIONS = [
  { id: "dt1", type: "Deposit",    amount: 50000, date: new Date(Date.now() - 86400000 * 5).toISOString(), status: "Completed", currency: "USDT", note: "Initial deposit"  },
  { id: "dt2", type: "Trade",      amount: -1250, date: new Date(Date.now() - 86400000 * 4).toISOString(), status: "Completed", currency: "USDT", note: "BTC Long"         },
  { id: "dt3", type: "Trade",      amount: 1875, date: new Date(Date.now() - 86400000 * 3).toISOString(), status: "Completed", currency: "USDT", note: "ETH Short closed"  },
  { id: "dt4", type: "Transfer",   amount: -500,  date: new Date(Date.now() - 86400000 * 2).toISOString(), status: "Completed", currency: "USDT", note: "To Trading Wallet" },
  { id: "dt5", type: "Trade",      amount: 2300,  date: new Date(Date.now() - 86400000 * 1).toISOString(), status: "Completed", currency: "USDT", note: "SOL Long closed"   },
];

const DEMO_POSITIONS = [
  { id: "dp1", coin: "BTC",  coinName: "Bitcoin",  side: "LONG",  entryPrice: 61200, size: 1200, leverage: 10, pnl: +2.34, pnlUsd: +280.8,  openTime: new Date(Date.now() - 3600000 * 6) },
  { id: "dp2", coin: "ETH",  coinName: "Ethereum", side: "SHORT", entryPrice: 3320,  size: 500,  leverage: 5,  pnl: -0.82, pnlUsd: -41.0,   openTime: new Date(Date.now() - 3600000 * 2) },
  { id: "dp3", coin: "SOL",  coinName: "Solana",   side: "LONG",  entryPrice: 148.5, size: 800,  leverage: 20, pnl: +5.11, pnlUsd: +408.8,  openTime: new Date(Date.now() - 3600000 * 1) },
];

export function DemoProvider({ children }) {
  const [isDemo, setIsDemo] = useState(() => {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === "true";
  });

  const [demoWallet, setDemoWallet] = useState(DEMO_WALLET);
  const [demoPositions, setDemoPositions] = useState(DEMO_POSITIONS);

  // Simulate live P&L fluctuation for open positions
  useEffect(() => {
    if (!isDemo) return;
    const interval = setInterval(() => {
      setDemoPositions(prev => prev.map(pos => {
        const delta = (Math.random() - 0.48) * 0.15;
        const newPnl = +(pos.pnl + delta).toFixed(2);
        const newPnlUsd = +(pos.pnlUsd + delta * pos.size / 100).toFixed(2);
        return { ...pos, pnl: newPnl, pnlUsd: newPnlUsd };
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [isDemo]);

  const enterDemo = useCallback(() => {
    sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    // Reset demo balance to initial
    setDemoWallet(DEMO_WALLET);
    setDemoPositions(DEMO_POSITIONS);
    setIsDemo(true);
  }, []);

  const exitDemo = useCallback(() => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    // Also clear TradeForm demo localStorage
    localStorage.removeItem("demo_balance_v4");
    localStorage.removeItem("demo_orders_v4");
    localStorage.removeItem("demo_trades_v4");
    setIsDemo(false);
  }, []);

  const value = {
    isDemo,
    demoUser: isDemo ? DEMO_USER : null,
    demoWallet: isDemo ? demoWallet : null,
    demoTransactions: isDemo ? DEMO_TRANSACTIONS : [],
    demoPositions: isDemo ? demoPositions : [],
    enterDemo,
    exitDemo,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
