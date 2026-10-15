import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import AgentLayout from './AgentLayout';
import { useAuth } from "../../contexts/AuthContext";
import DataTable from "../../components/DataTable";
import { getReferredUserTrades } from "../../services/agentService";
import "./Referrals.css";

const AgentOrderList = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");
    const [searchQuery, setSearchQuery] = useState(location.state?.userEmail || "");

    const isContract = location.pathname.includes('contract');
    const tradeType = isContract ? "perpetual" : "delivery";
    const title = isContract ? "Contract Orders" : "Delivery Orders";
    const subtitle = isContract
        ? "Active and historical perpetual trades from your referrals"
        : "Active and historical delivery trades from your referrals";

    const loadData = React.useCallback(async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            const status = activeTab === "active" ? "active" : "closed";
            const data = await getReferredUserTrades(user.uid, { status, tradeType });
            setOrders(data);
        } catch (error) {
            console.error("Error loading agent orders:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.uid, activeTab, tradeType]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter((trade) =>
            (trade.userEmail?.toLowerCase() || "").includes(q) ||
            (trade.userName?.toLowerCase() || "").includes(q) ||
            (trade.asset?.toLowerCase() || "").includes(q) ||
            (trade.uid?.toLowerCase() || "").includes(q)
        );
    }, [orders, searchQuery]);

    const columns = [
        {
            header: "User",
            key: "userEmail",
            render: (value, row) => (
                <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                        {value || row.uid}
                    </div>
                    {row.userName && (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.userName}</div>
                    )}
                </div>
            ),
        },
        {
            header: "Asset",
            key: "asset",
            render: (value) => <span style={{ fontWeight: 600 }}>{value}</span>,
        },
        {
            header: "Side",
            key: "side",
            render: (value) => (
                <span className={`badge badge-${value === 'buy' ? 'success' : 'danger'}`}>
                    {value?.toUpperCase()}
                </span>
            ),
        },
        {
            header: "Amount",
            key: "amount",
            render: (value) => `$${value?.toFixed(2)}`,
        },
        {
            header: "Entry",
            key: "entryPrice",
            render: (value) => value ? `$${value.toFixed(2)}` : '—',
        },
        {
            header: "Status",
            key: "status",
            render: (value) => (
                <span className={`badge badge-${value === 'active' ? 'warning' : 'info'}`}>
                    {value}
                </span>
            ),
        },
        {
            header: "P&L",
            key: "pnl",
            render: (value, row) => {
                if (row.status === 'active') return '—';
                return (
                    <span style={{ color: value >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                        {value >= 0 ? '+' : ''}${value?.toFixed(2)}
                    </span>
                );
            },
        },
        {
            header: activeTab === "active" ? "Opened" : "Closed",
            key: activeTab === "active" ? "createdAt" : "closedAt",
            render: (value, row) => {
                const date = value || row.createdAt;
                return date ? new Date(date).toLocaleString() : '—';
            },
        },
    ];

    return (
        <AgentLayout>
            <div className="referrals-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title gradient-text">{title}</h1>
                        <p className="page-subtitle">{subtitle}</p>
                    </div>
                    <div className="header-stats">
                        <div className="stat-item">
                            <span className="stat-label">{activeTab === "active" ? "Active" : "History"}</span>
                            <span className="stat-value">{filteredOrders.length}</span>
                        </div>
                    </div>
                </div>

                <div className="filter-tabs" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className={`filter-tab ${activeTab === "active" ? "active" : ""}`}
                            onClick={() => setActiveTab("active")}
                        >
                            Active Trades
                        </button>
                        <button
                            type="button"
                            className={`filter-tab ${activeTab === "history" ? "active" : ""}`}
                            onClick={() => setActiveTab("history")}
                        >
                            Trade History
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={loadData}
                        className="action-btn action-btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                        ↻ Refresh
                    </button>
                </div>

                <div className="search-bar glass-card" style={{ marginBottom: '24px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by user email, name, or asset..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="search-clear"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="loading-state">Loading trades...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state-card glass-card">
                        <div className="empty-icon">📄</div>
                        <h3>No {activeTab === "active" ? "Active" : "Historical"} Trades</h3>
                        <p>
                            {searchQuery
                                ? "No trades match your search."
                                : `No ${isContract ? "contract" : "delivery"} ${activeTab === "active" ? "active" : "closed"} trades from your referrals yet.`}
                        </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={filteredOrders} />
                )}
            </div>
        </AgentLayout>
    );
};

export default AgentOrderList;
