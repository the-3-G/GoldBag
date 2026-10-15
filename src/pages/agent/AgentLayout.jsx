import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import AgentSidebar from './AgentSidebar';
import './AgentLayout.css';

const PAGE_TITLES = {
    '/admin/dashboard': 'Dashboard',
    '/admin/users': 'Users',
    '/admin/chats': 'Chats',
    '/admin/agents': 'Agents',
    '/admin/create-agent': 'Create Agent',
    '/admin/deposits': 'Deposits',
    '/admin/withdrawals': 'Withdrawals',
    '/admin/trades': 'Trades',
    '/admin/trade-settings': 'Trade Settings',
    '/admin/commissions': 'Commissions',
    '/admin/verifications': 'ID Verifications',
    '/admin/balance-history': 'Balance History',
    '/admin/settings': 'Settings',
    '/agent/dashboard': 'Dashboard',
    '/agent/referrals': 'Referrals',
    '/agent/chats': 'Chats',
    '/agent/agents': 'Agents',
    '/agent/orders/delivery': 'Delivery Orders',
    '/agent/orders/contract': 'Contract Orders',
    '/agent/deposits': 'Deposits',
    '/agent/withdrawals': 'Withdrawals',
    '/agent/withdraw': 'Withdrawals',
    '/agent/settings': 'Settings',
    '/agent/commissions': 'Commissions',
};

const AgentLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

    return (
        <div className="agent-layout">
            <AgentSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="agent-main-content">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <button
                        className="mobile-toggle-btn"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        ☰
                    </button>
                    <span className="mobile-title">{pageTitle}</span>
                </header>

                <div className="content-scrollable">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AgentLayout;
