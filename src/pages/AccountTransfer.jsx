import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useDemoMode } from '../contexts/DemoContext';
import DemoBlockModal from '../components/DemoBlockModal';
import { transferBetweenAccounts } from '../services/walletService';
import coinList from '../data/coinList';
import './AccountTransfer.css';

const ACCOUNT_LABELS = {
    funding: 'Funding Account',
    spot: 'Spot Account',
    futures: 'Futures Account',
    earn: 'Earn Account',
    contract: 'Contract Account',
    fiat: 'Fiat Account',
};

export default function AccountTransfer() {
    const { user } = useAuth();
    const { isDemo } = useDemoMode();
    const [showDemoBlock, setShowDemoBlock] = useState(isDemo);
    const [amount, setAmount] = useState('');
    const [selectedCoin, setSelectedCoin] = useState('USDT');
    const [fromAccount, setFromAccount] = useState('funding');
    const [toAccount, setToAccount] = useState('spot');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [balances, setBalances] = useState({});
    const [history, setHistory] = useState([]);

    // Real-time balance
    useEffect(() => {
        if (!user) return;
        const unsubscribe = onSnapshot(doc(db, 'wallets', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBalances({
                    funding: data.mainBalance !== undefined ? data.mainBalance : (data.balance || 0),
                    spot: data.spotBalance || 0,
                    futures: data.tradingBalance || 0,
                    earn: data.earnBalance || 0,
                    contract: data.contractBalance || 0,
                    fiat: data.fiatBalance || 0,
                });
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Load transfer history (no composite index needed — sort client-side)
    useEffect(() => {
        if (!user) return;
        const fetchHistory = async () => {
            try {
                const snap = await getDocs(
                    query(
                        collection(db, 'transfers'),
                        where('userId', '==', user.uid),
                        limit(20)
                    )
                );
                const sorted = snap.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .sort((a, b) => {
                        const ta = a.createdAt?.toDate?.() ?? new Date(0);
                        const tb = b.createdAt?.toDate?.() ?? new Date(0);
                        return tb - ta;
                    })
                    .slice(0, 10);
                setHistory(sorted);
            } catch (e) {
                console.warn('Transfer history fetch failed:', e.message);
            }
        };
        fetchHistory();
    }, [user, success]);

    const handleTransfer = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            await transferBetweenAccounts(user.uid, fromAccount, toAccount, parseFloat(amount));
            setSuccess(`Successfully transferred ${amount} ${selectedCoin}`);
            setAmount('');
        } catch (err) {
            setError(err.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    const availableBalance = balances[fromAccount] ?? 0;

    const allAccounts = Object.entries(ACCOUNT_LABELS);

    return (
        <div className="account-transfer-page">
            {showDemoBlock && (
                <DemoBlockModal feature="Account Transfers" onClose={() => setShowDemoBlock(false)} />
            )}

            {/* Header */}
            <div className="at-header">
                <Link to="/wallet" className="at-back">‹</Link>
                <h1 className="at-title">transfer</h1>
                <div style={{ width: 32 }} />
            </div>

            <div className="transfer-container">

                {/* From / To card */}
                <div className="at-accounts-card">
                    <div className="at-account-row">
                        <span className="at-dot at-dot--from" />
                        <span className="at-account-label">from</span>
                        <select
                            className="at-account-select"
                            value={fromAccount}
                            onChange={e => setFromAccount(e.target.value)}
                        >
                            {allAccounts.map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="at-divider-line" />
                    <div className="at-account-row">
                        <span className="at-dot at-dot--to" />
                        <span className="at-account-label">to</span>
                        <select
                            className="at-account-select"
                            value={toAccount}
                            onChange={e => setToAccount(e.target.value)}
                        >
                            {allAccounts
                                .filter(([val]) => val !== fromAccount)
                                .map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                        </select>
                    </div>
                </div>

                {/* Messages */}
                {error && <div className="error-message" style={{ marginTop: 12 }}>{error}</div>}
                {success && <div className="success-message" style={{ marginTop: 12 }}>{success}</div>}

                {/* Amount card */}
                <div className="at-amount-card">
                    <div className="at-amount-label">Transfer amount</div>
                    <div className="at-amount-input-row">
                        <input
                            className="at-amount-input"
                            type="number"
                            placeholder="Please enter the transfer number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                        <div className="at-amount-right">
                            <select
                                className="at-coin-select"
                                value={selectedCoin}
                                onChange={e => setSelectedCoin(e.target.value)}
                            >
                                <option value="USDT">USDT</option>
                                {Object.values(coinList).map(c =>
                                    c.symbol.toUpperCase() !== 'USDT' && (
                                        <option key={c.symbol} value={c.symbol.toUpperCase()}>
                                            {c.symbol.toUpperCase()}
                                        </option>
                                    )
                                )}
                            </select>
                            <span className="at-divider-v">|</span>
                            <button
                                type="button"
                                className="at-all-btn"
                                onClick={() => setAmount(availableBalance.toString())}
                            >
                                All
                            </button>
                        </div>
                    </div>
                    <div className="at-available">
                        available:&nbsp;
                        <span>{availableBalance.toFixed(8)}</span>
                        &nbsp;{selectedCoin}
                    </div>
                </div>

                {/* Transfer button */}
                <button
                    className="transfer-button"
                    onClick={handleTransfer}
                    disabled={!amount || loading}
                >
                    {loading ? 'Processing...' : 'transfer'}
                </button>

                {/* Transfer record */}
                <div className="at-history">
                    <h3 className="at-history-title">transfer record</h3>
                    <div className="at-history-header">
                        <span>Amount</span>
                        <span>Record</span>
                        <span>Time</span>
                    </div>
                    {history.length > 0 ? history.map(tx => (
                        <div className="at-history-row" key={tx.id}>
                            <span className="at-history-amount">{tx.amount?.toLocaleString()}</span>
                            <span className="at-history-record">
                                change_account-{tx.toAccount || 'account'}
                            </span>
                            <span className="at-history-time">
                                {tx.createdAt?.toDate
                                    ? tx.createdAt.toDate().toLocaleString()
                                    : '—'}
                            </span>
                        </div>
                    )) : (
                        <div className="at-history-empty">No more data yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
