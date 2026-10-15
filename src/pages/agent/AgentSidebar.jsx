import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AgentSidebar.css';

const AgentSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { logout, isAdmin } = useAuth();

    // State for expandable menus
    const [expanded, setExpanded] = useState({
        users: true,
        orders: false,
        finance: false
    });

    const toggleMenu = (menu) => {
        setExpanded(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Backdrop */}
            <div className={`sidebar-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>

            <div className={`agent-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">{isAdmin() ? "Admin Desk" : "Agent Desk"}</div>
                </div>

                <div className="sidebar-content">
                    {/* Dashboard */}
                    <div className="menu-group">
                        <Link to={isAdmin() ? "/admin/dashboard" : "/agent/dashboard"} onClick={onClose} className={`menu-item ${isActive(isAdmin() ? '/admin/dashboard' : '/agent/dashboard') ? 'active' : ''}`}>
                            <span className="menu-icon">🏠</span>
                            <span className="menu-text">Home</span>
                        </Link>
                    </div>

                    {/* Chat with Users */}
                    <div className="menu-group">
                        <Link to={isAdmin() ? "/admin/chats" : "/agent/chats"} onClick={onClose} className={`menu-item ${isActive(isAdmin() ? '/admin/chats' : '/agent/chats') ? 'active' : ''}`}>
                            <span className="menu-icon">💬</span>
                            <span className="menu-text">Chats</span>
                        </Link>
                    </div>

                    {/* User Management */}
                    <div className="menu-group">
                        <div className="menu-item has-submenu" onClick={() => toggleMenu('users')}>
                            <span className="menu-icon">👥</span>
                            <span className="menu-text">User Management</span>
                            <span className={`arrow ${expanded.users ? 'down' : ''}`}>▼</span>
                        </div>
                        {expanded.users && (
                            <div className="submenu">
                                <Link to={isAdmin() ? "/admin/users" : "/agent/referrals"} onClick={onClose} className={`submenu-item ${isActive(isAdmin() ? '/admin/users' : '/agent/referrals') ? 'active' : ''}`}>
                                    User List
                                </Link>
                                <Link to={isAdmin() ? "/admin/agents" : "/agent/agents"} onClick={onClose} className={`submenu-item ${isActive(isAdmin() ? '/admin/agents' : '/agent/agents') ? 'active' : ''}`}>
                                    {isAdmin() ? "Agent List" : "Agent Management"}
                                </Link>
                                {isAdmin() && (
                                    <Link to="/admin/create-agent" onClick={onClose} className={`submenu-item ${isActive('/admin/create-agent') ? 'active' : ''}`}>
                                        Create Agent
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Order / Trade Management */}
                    <div className="menu-group">
                        <div className="menu-item has-submenu" onClick={() => toggleMenu('orders')}>
                            <span className="menu-icon">📄</span>
                            <span className="menu-text">{isAdmin() ? "Trade Management" : "Order Management"}</span>
                            <span className={`arrow ${expanded.orders ? 'down' : ''}`}>▼</span>
                        </div>
                        {expanded.orders && (
                            <div className="submenu">
                                {isAdmin() ? (
                                    <>
                                        <Link to="/admin/trades" onClick={onClose} className={`submenu-item ${isActive('/admin/trades') ? 'active' : ''}`}>
                                            Active Trades
                                        </Link>
                                        <Link to="/admin/trade-settings" onClick={onClose} className={`submenu-item ${isActive('/admin/trade-settings') ? 'active' : ''}`}>
                                            Trade Settings
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/agent/orders/delivery" onClick={onClose} className={`submenu-item ${isActive('/agent/orders/delivery') ? 'active' : ''}`}>
                                            Delivery Orders
                                        </Link>
                                        <Link to="/agent/orders/contract" onClick={onClose} className={`submenu-item ${isActive('/agent/orders/contract') ? 'active' : ''}`}>
                                            Contract Orders
                                        </Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Finance Management */}
                    <div className="menu-group">
                        <div className="menu-item has-submenu" onClick={() => toggleMenu('finance')}>
                            <span className="menu-icon">💸</span>
                            <span className="menu-text">Finance</span>
                            <span className={`arrow ${expanded.finance ? 'down' : ''}`}>▼</span>
                        </div>
                        {expanded.finance && (
                            <div className="submenu">
                                <Link to={isAdmin() ? "/admin/deposits" : "/agent/deposits"} onClick={onClose} className={`submenu-item ${isActive(isAdmin() ? '/admin/deposits' : '/agent/deposits') ? 'active' : ''}`}>
                                    User Deposits
                                </Link>
                                <Link to={isAdmin() ? "/admin/withdrawals" : "/agent/withdrawals"} onClick={onClose} className={`submenu-item ${isActive(isAdmin() ? '/admin/withdrawals' : '/agent/withdrawals') ? 'active' : ''}`}>
                                    User Withdrawals
                                </Link>
                                {isAdmin() ? (
                                    <>
                                        <Link to="/admin/commissions" onClick={onClose} className={`submenu-item ${isActive('/admin/commissions') ? 'active' : ''}`}>
                                            Commissions
                                        </Link>
                                        <Link to="/admin/balance-history" onClick={onClose} className={`submenu-item ${isActive('/admin/balance-history') ? 'active' : ''}`}>
                                            Balance Log
                                        </Link>
                                    </>
                                ) : (
                                    <Link to="/agent/withdraw" onClick={onClose} className={`submenu-item ${isActive('/agent/withdraw') ? 'active' : ''}`}>
                                        My Withdrawals
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ID Verifications (Admin only) */}
                    {isAdmin() && (
                        <div className="menu-group">
                            <Link to="/admin/verifications" onClick={onClose} className={`menu-item ${isActive('/admin/verifications') ? 'active' : ''}`}>
                                <span className="menu-icon">🆔</span>
                                <span className="menu-text">ID Verifications</span>
                            </Link>
                        </div>
                    )}

                    {/* Settings */}
                    <div className="menu-group">
                        <Link to={isAdmin() ? "/admin/settings" : "/agent/settings"} onClick={onClose} className={`menu-item ${isActive(isAdmin() ? '/admin/settings' : '/agent/settings') ? 'active' : ''}`}>
                            <span className="menu-icon">⚙️</span>
                            <span className="menu-text">Settings</span>
                        </Link>
                    </div>

                    {/* Logout */}
                    <div className="sidebar-logout-group">
                        <button className="menu-item logout-btn" onClick={logout}>
                            <span className="menu-icon">🚪</span>
                            <span className="menu-text">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AgentSidebar;
