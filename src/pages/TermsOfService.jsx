// src/pages/TermsOfService.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function TermsOfService() {
    return (
        <div className="legal-page">
            <div className="legal-header">
                <Link to="/regulatory-info" className="back-button">← Back</Link>
                <div className="legal-header-text">
                    <h1>Terms of Service</h1>
                    <p className="legal-meta">Last updated: June 1, 2025 &nbsp;|&nbsp; Effective: June 1, 2025</p>
                </div>
            </div>

            <div className="legal-container">
                <div className="legal-intro">
                    <p>
                        Please read these Terms of Service ("Terms") carefully before using the GoldBag platform
                        operated by <strong>AlphaGold Trading Financial Services Ltd.</strong> ("Company", "we", "us", or "our").
                        By accessing or using our platform, you agree to be bound by these Terms. If you disagree with
                        any part of the Terms, you may not access the platform.
                    </p>
                </div>

                <section className="legal-section">
                    <h2><span className="section-num">1</span> Acceptance of Terms</h2>
                    <p>By creating an account or using any part of the GoldBag platform, you confirm that:</p>
                    <ul>
                        <li>You are at least 18 years of age or the legal age of majority in your jurisdiction.</li>
                        <li>You have the legal authority to enter into this agreement.</li>
                        <li>You are not located in, or a citizen or resident of, any country subject to international sanctions.</li>
                        <li>Your use of the platform does not violate any laws or regulations applicable to you.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">2</span> Account Registration</h2>
                    <p>
                        To access certain features of our platform, you must register for an account. When creating your
                        account, you agree to:
                    </p>
                    <ul>
                        <li>Provide accurate, current, and complete information during registration.</li>
                        <li>Maintain and promptly update your account information to keep it accurate.</li>
                        <li>Maintain the security of your password and accept responsibility for all activities that occur under your account.</li>
                        <li>Immediately notify us of any unauthorized use of your account or any other breach of security.</li>
                        <li>Not share your login credentials with any third party.</li>
                    </ul>
                    <p>
                        We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel
                        orders at our sole discretion.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">3</span> Platform Services</h2>
                    <p>GoldBag provides the following services:</p>
                    <ul>
                        <li><strong>Spot Trading:</strong> Buy and sell digital assets at current market prices.</li>
                        <li><strong>Futures Trading:</strong> Trade contracts based on the future price of digital assets.</li>
                        <li><strong>Asset Management:</strong> View and manage your digital asset portfolio.</li>
                        <li><strong>Deposits & Withdrawals:</strong> Fund your account and withdraw earnings.</li>
                        <li><strong>Exchange Services:</strong> Convert between different digital assets.</li>
                    </ul>
                    <p>
                        We reserve the right to modify, suspend, or discontinue any service at any time without prior notice.
                        We shall not be liable to you or any third party for any such modification, suspension, or discontinuation.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">4</span> Fees and Charges</h2>
                    <p>
                        The use of certain platform services may be subject to fees. All applicable fees will be disclosed
                        to you prior to executing any transaction. By completing a transaction, you agree to pay all
                        associated fees.
                    </p>
                    <ul>
                        <li>Trading fees are charged on each completed transaction and vary by trading pair and volume tier.</li>
                        <li>Withdrawal fees are applied based on the asset and network used.</li>
                        <li>Deposit fees may apply for certain payment methods.</li>
                        <li>We reserve the right to change our fee structure with 30 days' notice.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">5</span> Prohibited Activities</h2>
                    <p>You agree not to engage in any of the following activities:</p>
                    <ul>
                        <li>Using the platform for any unlawful purpose or in violation of any regulations.</li>
                        <li>Attempting to manipulate market prices or engage in fraudulent trading practices.</li>
                        <li>Using automated tools, bots, or scripts without express written permission.</li>
                        <li>Impersonating any person or entity, or falsely stating your affiliation with any person or entity.</li>
                        <li>Engaging in money laundering, terrorist financing, or any other financial crimes.</li>
                        <li>Interfering with or disrupting the integrity or performance of the platform.</li>
                        <li>Attempting to gain unauthorized access to any portion of the platform.</li>
                        <li>Collecting or harvesting any personally identifiable information from the platform.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">6</span> Intellectual Property</h2>
                    <p>
                        The platform and its original content, features, and functionality are and will remain the
                        exclusive property of AlphaGold Trading Financial Services Ltd. and its licensors. Our trademarks
                        and trade dress may not be used in connection with any product or service without the prior
                        written consent of the Company.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">7</span> Disclaimer of Warranties</h2>
                    <p>
                        THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY WARRANTIES OF ANY KIND,
                        EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
                        OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </p>
                    <p>
                        We do not warrant that the platform will be uninterrupted, timely, secure, or error-free. We are
                        not responsible for any losses resulting from technical failures, network disruptions, or system
                        outages.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">8</span> Limitation of Liability</h2>
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY BE LIABLE FOR
                        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION,
                        LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                    </p>
                    <ul>
                        <li>Your access to or use of (or inability to access or use) the platform.</li>
                        <li>Any conduct or content of any third party on the platform.</li>
                        <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
                        <li>Market fluctuations and trading losses.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">9</span> Termination</h2>
                    <p>
                        We may terminate or suspend your account and access to the platform immediately, without prior
                        notice or liability, for any reason, including if you breach these Terms. Upon termination,
                        your right to use the platform will immediately cease.
                    </p>
                    <p>
                        You may terminate your account at any time by contacting our support team. Upon termination,
                        all provisions of these Terms that by their nature should survive termination shall survive.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">10</span> Governing Law</h2>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of England and Wales,
                        without regard to its conflict of law provisions. Any disputes arising under these Terms shall
                        be subject to the exclusive jurisdiction of the courts of England and Wales.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">11</span> Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will provide notice of any significant
                        changes by updating the "Last updated" date at the top of this page and, where appropriate,
                        notifying you by email. Your continued use of the platform after any changes constitutes your
                        acceptance of the new Terms.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">12</span> Contact Us</h2>
                    <p>If you have any questions about these Terms, please contact us:</p>
                    <div className="legal-contact">
                        <p>📧 <a href="mailto:Alphagoldprotrading@gmail.com">Alphagoldprotrading@gmail.com</a></p>
                        <p>🏢 AlphaGold Trading Financial Services Ltd.</p>
                        <p>📍 128 City Road, London, EC1V 2NX, United Kingdom</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
