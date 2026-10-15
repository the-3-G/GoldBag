// src/pages/RiskDisclosure.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function RiskDisclosure() {
    return (
        <div className="legal-page">
            <div className="legal-header">
                <Link to="/regulatory-info" className="back-button">← Back</Link>
                <div className="legal-header-text">
                    <h1>Risk Disclosure</h1>
                    <p className="legal-meta">Last updated: June 1, 2025 &nbsp;|&nbsp; Effective: June 1, 2025</p>
                </div>
            </div>

            <div className="legal-container">
                <div className="legal-intro risk-warning">
                    <div className="warning-icon">⚠️</div>
                    <p>
                        <strong>IMPORTANT NOTICE:</strong> Trading digital assets involves significant risk of loss and is not suitable
                        for everyone. Before trading, please read this Risk Disclosure Statement carefully.
                        You should not invest money that you cannot afford to lose. Past performance is not
                        indicative of future results.
                    </p>
                </div>

                <section className="legal-section">
                    <h2><span className="section-num">1</span> Market Risk</h2>
                    <p>
                        Digital asset markets are highly volatile. The price of cryptocurrencies and other digital
                        assets can fluctuate dramatically within very short periods of time, including within a single
                        trading day. These fluctuations may result from factors such as:
                    </p>
                    <ul>
                        <li>Regulatory announcements and changes in government policy worldwide.</li>
                        <li>Media coverage, social media sentiment, and market speculation.</li>
                        <li>Technological developments, including network upgrades, forks, and security incidents.</li>
                        <li>Macroeconomic factors and global financial market conditions.</li>
                        <li>Large-scale purchases or sales by institutional investors ("whales").</li>
                        <li>Manipulation, wash trading, and other fraudulent market activities by third parties.</li>
                    </ul>
                    <p>
                        The value of your investment can go down as well as up, and you may receive back
                        less than you originally invested, including losing your entire investment.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">2</span> Leverage and Derivatives Risk</h2>
                    <p>
                        Our platform offers leveraged trading products including futures and perpetual contracts.
                        <strong> Leveraged trading significantly amplifies both potential gains and potential losses.</strong>
                    </p>
                    <ul>
                        <li>A small adverse price movement may result in a loss greater than your initial investment.</li>
                        <li>Margin calls may require you to deposit additional funds on short notice.</li>
                        <li>If you are unable to meet a margin call, your position may be automatically liquidated.</li>
                        <li>Liquidation may occur at prices unfavorable to you due to market conditions.</li>
                        <li>You are responsible for all losses including amounts exceeding your initial deposit.</li>
                    </ul>
                    <div className="risk-callout">
                        <p>Example: With 10x leverage, a 10% adverse price move results in a 100% loss of your position margin.</p>
                    </div>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">3</span> Liquidity Risk</h2>
                    <p>
                        Not all digital assets have the same level of liquidity. Illiquid markets may result in:
                    </p>
                    <ul>
                        <li>Significant slippage between expected and actual execution prices.</li>
                        <li>Difficulty closing positions in adverse market conditions.</li>
                        <li>Wider bid-ask spreads that increase transaction costs.</li>
                        <li>Inability to execute trades at desired price levels during high volatility.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">4</span> Technology and Cybersecurity Risk</h2>
                    <p>Digital asset trading involves significant technology risks, including:</p>
                    <ul>
                        <li><strong>Platform Downtime:</strong> Our platform may experience outages during which you cannot access or manage your account.</li>
                        <li><strong>Cyberattacks:</strong> Despite our security measures, our platform may be subject to hacking, phishing attacks, or other cyber threats.</li>
                        <li><strong>Smart Contract Risk:</strong> Code vulnerabilities in blockchain protocols or smart contracts may result in asset losses.</li>
                        <li><strong>Network Congestion:</strong> Blockchain network congestion may delay transaction confirmations and affect trade execution.</li>
                        <li><strong>Internet Connectivity:</strong> Loss of internet connectivity may prevent you from accessing your account during critical market events.</li>
                        <li><strong>Key Management:</strong> Loss of private keys or seed phrases results in permanent loss of access to digital assets.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">5</span> Regulatory and Legal Risk</h2>
                    <p>
                        The regulatory environment for digital assets is rapidly evolving and varies significantly
                        across jurisdictions. Changes in regulation may:
                    </p>
                    <ul>
                        <li>Restrict or prohibit digital asset trading in your jurisdiction without warning.</li>
                        <li>Require additional compliance steps that may limit your access to our services.</li>
                        <li>Affect the legality of specific digital assets or trading activities.</li>
                        <li>Result in taxation of digital asset gains, including retroactive taxation.</li>
                        <li>Require disclosure of your trading activities to tax and regulatory authorities.</li>
                    </ul>
                    <p>
                        You are solely responsible for understanding and complying with all laws and regulations
                        applicable to your use of the platform in your jurisdiction.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">6</span> Operational Risk</h2>
                    <p>Operational risks include but are not limited to:</p>
                    <ul>
                        <li>Errors in order entry, including incorrect price, quantity, or asset selection.</li>
                        <li>System failures that may prevent timely execution of orders.</li>
                        <li>Communication failures between our servers and your device.</li>
                        <li>Third-party service provider failures affecting deposits, withdrawals, or data feeds.</li>
                        <li>Fork events that may result in duplicate or invalid transactions.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">7</span> Counterparty Risk</h2>
                    <p>
                        When trading on our platform, you are subject to counterparty risk, which includes:
                    </p>
                    <ul>
                        <li>The risk that the Company may become insolvent or cease operations.</li>
                        <li>The risk that other platform users may default on their trading obligations.</li>
                        <li>The risk associated with third-party custodians holding your assets.</li>
                    </ul>
                    <p>
                        Digital assets held on the platform may not be protected by government-backed deposit
                        insurance schemes such as FDIC or FSCS. In the event of insolvency, you may lose all
                        assets held on the platform.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">8</span> Risk Management Recommendations</h2>
                    <p>We strongly recommend the following risk management practices:</p>
                    <ul>
                        <li>Never invest more than you can afford to lose entirely.</li>
                        <li>Diversify your portfolio across different asset classes.</li>
                        <li>Use stop-loss orders to limit potential downside.</li>
                        <li>Avoid using excessive leverage, especially if you are a beginner.</li>
                        <li>Keep the majority of your long-term holdings in personal wallets, not on exchanges.</li>
                        <li>Enable all available security features including 2FA on your account.</li>
                        <li>Stay informed about regulatory changes in your jurisdiction.</li>
                        <li>Never trade under emotional duress or with borrowed money.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">9</span> No Financial Advice</h2>
                    <p>
                        Nothing on the GoldBag platform constitutes financial, investment, legal, or tax advice.
                        All information provided is for informational purposes only. We strongly encourage you to
                        seek independent financial advice from a qualified professional before making any investment
                        decisions. The platform does not take into account your individual investment objectives,
                        financial situation, or particular needs.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">10</span> Acknowledgement</h2>
                    <p>
                        By using the GoldBag platform, you acknowledge that:
                    </p>
                    <ul>
                        <li>You have read and understood this Risk Disclosure Statement.</li>
                        <li>You accept all risks associated with digital asset trading.</li>
                        <li>You are solely responsible for your trading decisions and any resulting losses.</li>
                        <li>You are not relying on any information from the platform as financial advice.</li>
                    </ul>

                    <div className="legal-contact" style={{ marginTop: '24px' }}>
                        <p>If you have questions about the risks involved in trading, please contact us before using our services:</p>
                        <p>📧 <a href="mailto:Alphagoldprotrading@gmail.com">Alphagoldprotrading@gmail.com</a></p>
                    </div>
                </section>
            </div>
        </div>
    );
}
