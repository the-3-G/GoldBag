// src/pages/Exchange.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exchangeCryptoAssets, getCryptoBalance } from '../services/walletService';
import { subscribeLivePrices, getConversionRate, getUsdPrice } from '../services/priceService';
import coinList from '../data/coinList';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeftRight } from 'lucide-react';
import './Exchange.css';

const CONVERT_SYMBOLS = ['USDT', ...Object.values(coinList).map((c) => c.symbol)];

export default function Exchange() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [fromCurrency, setFromCurrency] = useState('USDT');
    const [toCurrency, setToCurrency] = useState('BTC');
    const [amount, setAmount] = useState('');
    const [prices, setPrices] = useState({});
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const cleanup = subscribeLivePrices(setPrices);
        return cleanup;
    }, []);

    useEffect(() => {
        if (!user?.uid) return;

        const unsub = onSnapshot(doc(db, 'wallets', user.uid), (snap) => {
            setWalletData(snap.exists() ? snap.data() : null);
        });

        return () => unsub();
    }, [user]);

    const conversionRate = useMemo(() => {
        if (!Object.keys(prices).length) return 0;
        return getConversionRate(prices, fromCurrency, toCurrency);
    }, [prices, fromCurrency, toCurrency]);

    const displayRate = useMemo(() => {
        if (!Object.keys(prices).length) return '0.0000';
        const toUsd = getUsdPrice(prices, toCurrency);
        const fromUsd = getUsdPrice(prices, fromCurrency);
        if (fromCurrency === 'USDT' && toCurrency !== 'USDT') {
            return toUsd.toFixed(4);
        }
        if (toCurrency === 'USDT' && fromCurrency !== 'USDT') {
            return fromUsd.toFixed(4);
        }
        return conversionRate.toFixed(8);
    }, [prices, fromCurrency, toCurrency, conversionRate]);

    const availableBalance = walletData ? getCryptoBalance(walletData, fromCurrency) : 0;

    const expectedAmount = useMemo(() => {
        const qty = parseFloat(amount);
        if (!qty || qty <= 0 || !conversionRate) return 0;
        return qty * conversionRate;
    }, [amount, conversionRate]);

    const expectedDecimals = toCurrency === 'USDT' ? 2 : 8;

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setAmount('');
        setError('');
        setSuccess('');
    };

    const handleExchangeAll = () => {
        if (availableBalance > 0) {
            setAmount(String(availableBalance));
        }
    };

    const handleExchange = async () => {
        const qty = parseFloat(amount);
        if (!qty || qty <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (qty > availableBalance) {
            setError(`Insufficient ${fromCurrency} balance`);
            return;
        }

        if (!conversionRate || expectedAmount <= 0) {
            setError('Exchange rate unavailable. Please wait a moment.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const result = await exchangeCryptoAssets(
                user.uid,
                fromCurrency,
                toCurrency,
                qty,
                expectedAmount
            );

            setSuccess(
                `Exchanged ${qty} ${fromCurrency} → ${result.convertedAmount.toFixed(expectedDecimals)} ${toCurrency}`
            );
            setAmount('');
        } catch (err) {
            setError(err.message || 'Exchange failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="exchange-page">
            <div className="exchange-mobile-header">
                <button type="button" className="exchange-back" onClick={() => navigate(-1)} aria-label="Go back">
                    ←
                </button>
                <h1>Exchange</h1>
                <div className="exchange-header-spacer" />
            </div>

            <div className="exchange-container">
                <div className="exchange-card">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="exchange-pair-row">
                        <div className="exchange-pair-box">{fromCurrency}</div>
                        <button type="button" className="exchange-swap-btn" onClick={swapCurrencies} aria-label="Swap currencies">
                            <ArrowLeftRight size={20} />
                        </button>
                        <div className="exchange-pair-box">{toCurrency}</div>
                    </div>

                    <div className="exchange-pair-selects">
                        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                            {CONVERT_SYMBOLS.map((sym) => (
                                <option key={`from-${sym}`} value={sym}>{sym}</option>
                            ))}
                        </select>
                        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                            {CONVERT_SYMBOLS.filter((sym) => sym !== fromCurrency).map((sym) => (
                                <option key={`to-${sym}`} value={sym}>{sym}</option>
                            ))}
                        </select>
                    </div>

                    <div className="exchange-quantity-section">
                        <label>Exchange quantity</label>
                        <div className="exchange-quantity-input">
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="0"
                                step="any"
                            />
                            <div className="exchange-quantity-meta">
                                <span>{fromCurrency}</span>
                                <button type="button" onClick={handleExchangeAll}>Exchange all</button>
                            </div>
                        </div>
                    </div>

                    <div className="exchange-stats-grid">
                        <div className="exchange-stat">
                            <span className="exchange-stat-label">Current exchange rate</span>
                            <span className="exchange-stat-value">{displayRate}</span>
                        </div>
                        <div className="exchange-stat">
                            <span className="exchange-stat-label">Available {fromCurrency}</span>
                            <span className="exchange-stat-value">
                                {availableBalance.toFixed(fromCurrency === 'USDT' ? 2 : 8)}
                            </span>
                        </div>
                        <div className="exchange-stat">
                            <span className="exchange-stat-label">Expected to get {toCurrency}</span>
                            <span className="exchange-stat-value exchange-stat-highlight">
                                {expectedAmount.toFixed(expectedDecimals)}
                            </span>
                        </div>
                    </div>

                    <button
                        className="exchange-button"
                        disabled={!amount || loading || !conversionRate}
                        onClick={handleExchange}
                    >
                        {loading ? 'Processing...' : 'Exchange'}
                    </button>

                    <Link to="/wallet" className="exchange-desktop-back">← Back to Wallet</Link>
                </div>
            </div>
        </div>
    );
}
