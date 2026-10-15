// src/pages/PrivacyPolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function PrivacyPolicy() {
    return (
        <div className="legal-page">
            <div className="legal-header">
                <Link to="/regulatory-info" className="back-button">← Back</Link>
                <div className="legal-header-text">
                    <h1>Privacy Policy</h1>
                    <p className="legal-meta">Last updated: June 1, 2025 &nbsp;|&nbsp; Effective: June 1, 2025</p>
                </div>
            </div>

            <div className="legal-container">
                <div className="legal-intro">
                    <p>
                        AlphaGold Trading Financial Services Ltd. ("we", "our", or "us") is committed to protecting
                        your personal information. This Privacy Policy explains how we collect, use, disclose, and
                        safeguard your data when you use the GoldBag platform. Please read this policy carefully.
                        If you disagree with its terms, please discontinue use of the platform.
                    </p>
                </div>

                <section className="legal-section">
                    <h2><span className="section-num">1</span> Information We Collect</h2>
                    <p>We collect several types of information in connection with the services we provide:</p>

                    <h3>Personal Information</h3>
                    <ul>
                        <li>Full name and date of birth</li>
                        <li>Email address and phone number</li>
                        <li>Government-issued identification documents (for KYC verification)</li>
                        <li>Residential address and country of residence</li>
                        <li>Financial information, including bank account and payment card details</li>
                    </ul>

                    <h3>Account & Transaction Data</h3>
                    <ul>
                        <li>Account login credentials (passwords are encrypted and never stored in plain text)</li>
                        <li>Transaction history, including deposits, withdrawals, and trades</li>
                        <li>Asset balances and portfolio information</li>
                        <li>Communication history with our support team</li>
                    </ul>

                    <h3>Technical Data</h3>
                    <ul>
                        <li>IP address and geolocation data</li>
                        <li>Device type, operating system, and browser information</li>
                        <li>Platform usage patterns and click-stream data</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">2</span> How We Use Your Information</h2>
                    <p>We use the information we collect for the following purposes:</p>
                    <ul>
                        <li><strong>Service Provision:</strong> To provide, operate, and maintain our platform and services.</li>
                        <li><strong>Identity Verification:</strong> To verify your identity and comply with KYC/AML regulations.</li>
                        <li><strong>Transaction Processing:</strong> To process deposits, withdrawals, and trades.</li>
                        <li><strong>Security:</strong> To detect, prevent, and address fraud, abuse, and security incidents.</li>
                        <li><strong>Communication:</strong> To send transactional notifications, security alerts, and support messages.</li>
                        <li><strong>Compliance:</strong> To comply with legal obligations, regulatory requirements, and law enforcement requests.</li>
                        <li><strong>Improvement:</strong> To analyze usage patterns and improve our platform and user experience.</li>
                        <li><strong>Marketing:</strong> To send promotional content and offers (only with your explicit consent).</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">3</span> Legal Basis for Processing</h2>
                    <p>We process your personal data based on the following legal grounds:</p>
                    <ul>
                        <li><strong>Contractual Necessity:</strong> Processing required to provide our services under our Terms of Service.</li>
                        <li><strong>Legal Obligation:</strong> Processing required to comply with applicable laws and regulations.</li>
                        <li><strong>Legitimate Interest:</strong> Processing for fraud prevention, security, and platform improvement.</li>
                        <li><strong>Consent:</strong> Processing based on your explicit consent, which you may withdraw at any time.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">4</span> Data Sharing and Disclosure</h2>
                    <p>We do not sell your personal information. We may share your data with:</p>
                    <ul>
                        <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform (payment processors, cloud hosting, analytics providers).</li>
                        <li><strong>Regulatory Authorities:</strong> Government bodies, financial regulators, or law enforcement when required by law.</li>
                        <li><strong>Business Partners:</strong> Partners who assist in providing specific features of our service, subject to confidentiality agreements.</li>
                        <li><strong>Corporate Transactions:</strong> In connection with a merger, acquisition, or sale of assets, subject to standard confidentiality protections.</li>
                    </ul>
                    <p>All third-party partners are bound by strict data protection agreements and are prohibited from using your data for any purpose other than providing services to us.</p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">5</span> Data Retention</h2>
                    <p>
                        We retain your personal information for as long as necessary to provide our services and comply with
                        our legal obligations. Specifically:
                    </p>
                    <ul>
                        <li>Account data is retained for the duration of your account and for 7 years after account closure.</li>
                        <li>Transaction records are retained for a minimum of 5 years as required by financial regulations.</li>
                        <li>KYC documents are retained for 5 years after the end of the business relationship.</li>
                        <li>Marketing data is retained until you withdraw consent or request deletion.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">6</span> Data Security</h2>
                    <p>We implement industry-standard security measures to protect your personal information, including:</p>
                    <ul>
                        <li>256-bit AES encryption for data at rest</li>
                        <li>TLS 1.3 encryption for data in transit</li>
                        <li>Multi-factor authentication (MFA) for account access</li>
                        <li>Regular security audits and penetration testing</li>
                        <li>Strict access controls and employee data access policies</li>
                        <li>Cold storage for the majority of digital assets</li>
                    </ul>
                    <p>
                        Despite these measures, no method of transmission over the Internet is 100% secure.
                        We cannot guarantee absolute security of your data.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">7</span> Your Rights</h2>
                    <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                        <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                        <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten").</li>
                        <li><strong>Portability:</strong> Request transfer of your data to another service provider.</li>
                        <li><strong>Restriction:</strong> Request restriction of processing of your personal data.</li>
                        <li><strong>Objection:</strong> Object to processing of your personal data for direct marketing.</li>
                        <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
                    </ul>
                    <p>To exercise any of these rights, please contact us at <a href="mailto:Alphagoldprotrading@gmail.com">Alphagoldprotrading@gmail.com</a>. We will respond within 30 days.</p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">8</span> Cookies Policy</h2>
                    <p>
                        We use cookies and similar tracking technologies to track activity on our platform and hold
                        certain information. You can instruct your browser to refuse all cookies or to indicate when
                        a cookie is being sent. Types of cookies we use:
                    </p>
                    <ul>
                        <li><strong>Essential Cookies:</strong> Necessary for the platform to function properly.</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our platform.</li>
                        <li><strong>Security Cookies:</strong> Protect against fraudulent activity and account hijacking.</li>
                        <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">9</span> International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries other than your country of residence.
                        These countries may have different data protection laws. When we transfer data internationally,
                        we use appropriate safeguards such as Standard Contractual Clauses approved by the European Commission.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">10</span> Contact & Complaints</h2>
                    <p>For privacy-related inquiries or to exercise your rights, please contact our Data Protection Officer:</p>
                    <div className="legal-contact">
                        <p>📧 <a href="mailto:Alphagoldprotrading@gmail.com">Alphagoldprotrading@gmail.com</a></p>
                        <p>🏢 AlphaGold Trading Financial Services Ltd. — Data Protection Officer</p>
                        <p>📍 128 City Road, London, EC1V 2NX, United Kingdom</p>
                    </div>
                    <p style={{ marginTop: '16px' }}>
                        You also have the right to lodge a complaint with your local data protection authority.
                        In the UK, this is the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}
