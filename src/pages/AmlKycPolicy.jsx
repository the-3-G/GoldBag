// src/pages/AmlKycPolicy.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

export default function AmlKycPolicy() {
    return (
        <div className="legal-page">
            <div className="legal-header">
                <Link to="/regulatory-info" className="back-button">← Back</Link>
                <div className="legal-header-text">
                    <h1>AML & KYC Policy</h1>
                    <p className="legal-meta">Last updated: June 1, 2025 &nbsp;|&nbsp; Effective: June 1, 2025</p>
                </div>
            </div>

            <div className="legal-container">
                <div className="legal-intro">
                    <p>
                        AlphaGold Trading Financial Services Ltd. ("Company", "we", "us") is committed to preventing
                        money laundering, terrorist financing, and other financial crimes through a robust
                        Anti-Money Laundering (AML) and Know Your Customer (KYC) program. This policy outlines
                        our compliance framework and your obligations as a platform user.
                    </p>
                </div>

                <section className="legal-section">
                    <h2><span className="section-num">1</span> Overview & Legal Framework</h2>
                    <p>
                        Our AML/KYC program is designed to comply with applicable laws and regulations, including:
                    </p>
                    <ul>
                        <li>The UK Proceeds of Crime Act 2002 (POCA) and Terrorism Act 2000</li>
                        <li>The Money Laundering, Terrorist Financing and Transfer of Funds Regulations 2017</li>
                        <li>The Financial Action Task Force (FATF) Recommendations</li>
                        <li>FinCEN regulations under the Bank Secrecy Act (BSA) — US jurisdiction</li>
                        <li>Fifth Anti-Money Laundering Directive (5AMLD) — EU regulations</li>
                        <li>VASP registration requirements under applicable national laws</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">2</span> Know Your Customer (KYC) Requirements</h2>
                    <p>
                        All users are required to complete identity verification before accessing full platform features.
                        Our KYC process includes multiple verification tiers:
                    </p>

                    <div className="kyc-tier">
                        <div className="kyc-tier-header">
                            <span className="tier-badge tier-1">Tier 1 — Basic</span>
                            <span className="tier-limit">Limit: $2,000/day</span>
                        </div>
                        <ul>
                            <li>Valid email address verification</li>
                            <li>Mobile phone number verification</li>
                            <li>Basic account information (name, country, date of birth)</li>
                        </ul>
                    </div>

                    <div className="kyc-tier">
                        <div className="kyc-tier-header">
                            <span className="tier-badge tier-2">Tier 2 — Standard</span>
                            <span className="tier-limit">Limit: $50,000/day</span>
                        </div>
                        <ul>
                            <li>Government-issued photo ID (passport, national ID, or driver's license)</li>
                            <li>Selfie or live facial recognition check</li>
                            <li>Proof of residential address (utility bill, bank statement — dated within 3 months)</li>
                        </ul>
                    </div>

                    <div className="kyc-tier">
                        <div className="kyc-tier-header">
                            <span className="tier-badge tier-3">Tier 3 — Enhanced</span>
                            <span className="tier-limit">Limit: Unlimited</span>
                        </div>
                        <ul>
                            <li>Source of funds declaration</li>
                            <li>Source of wealth documentation</li>
                            <li>Enhanced due diligence review (EDR) by our compliance team</li>
                            <li>Additional documentation as required on a case-by-case basis</li>
                        </ul>
                    </div>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">3</span> Acceptable Identity Documents</h2>
                    <p>The following documents are accepted for identity verification:</p>
                    <ul>
                        <li><strong>Government-issued passport</strong> — accepted from all jurisdictions</li>
                        <li><strong>National identity card</strong> — accepted from countries where applicable</li>
                        <li><strong>Driver's license</strong> — must include full name, date of birth, and photo</li>
                        <li><strong>Residence permit</strong> — valid and unexpired, issued by recognized authority</li>
                    </ul>
                    <p>Documents must be:</p>
                    <ul>
                        <li>Valid (not expired) at the time of submission</li>
                        <li>Clearly legible with no obstructions to key data fields</li>
                        <li>Submitted as high-resolution images or scans</li>
                        <li>In color — black and white copies are not accepted</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">4</span> Anti-Money Laundering (AML) Program</h2>
                    <p>Our AML program includes the following core components:</p>

                    <h3>Customer Due Diligence (CDD)</h3>
                    <p>
                        We apply Customer Due Diligence measures to all users, which includes identifying and
                        verifying customer identity, understanding the nature and purpose of the business relationship,
                        and assessing and managing risk.
                    </p>

                    <h3>Enhanced Due Diligence (EDD)</h3>
                    <p>
                        Enhanced Due Diligence is applied to higher-risk customers, including:
                    </p>
                    <ul>
                        <li>Politically Exposed Persons (PEPs) and their family members or close associates</li>
                        <li>Customers from high-risk jurisdictions as identified by FATF</li>
                        <li>Customers with unusual or complex transaction patterns</li>
                        <li>High-volume traders with significant unexplained wealth</li>
                    </ul>

                    <h3>Ongoing Monitoring</h3>
                    <p>
                        We continuously monitor all transactions on the platform using automated systems
                        and manual review processes to detect patterns consistent with money laundering,
                        terrorist financing, or other financial crimes.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">5</span> Transaction Monitoring & Screening</h2>
                    <p>All transactions on our platform are subject to:</p>
                    <ul>
                        <li><strong>Blockchain Analytics:</strong> We use industry-leading blockchain analysis tools to screen all on-chain transactions for association with sanctioned wallets, darknet markets, or high-risk activity.</li>
                        <li><strong>Sanctions Screening:</strong> All users and transactions are screened against OFAC, UN, EU, and UK sanctions lists upon registration and on an ongoing basis.</li>
                        <li><strong>Unusual Activity Detection:</strong> Automated systems flag transactions that deviate from established behavioral patterns.</li>
                        <li><strong>Travel Rule Compliance:</strong> For transfers above applicable thresholds, we collect and transmit required originator and beneficiary information.</li>
                    </ul>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">6</span> Suspicious Activity Reporting</h2>
                    <p>
                        We are legally required to report suspicious activity to the appropriate authorities.
                        We will file Suspicious Activity Reports (SARs) or equivalent reports with relevant
                        financial intelligence units when we have reason to suspect that a transaction may be
                        related to money laundering, terrorist financing, or other criminal activity.
                    </p>
                    <p>
                        We are prohibited by law from disclosing to you or any third party that a SAR has been
                        filed ("tipping off"). Attempted interference with this process is a criminal offense.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">7</span> Prohibited Users & Jurisdictions</h2>
                    <p>The following are prohibited from using the GoldBag platform:</p>
                    <ul>
                        <li>Individuals or entities on any sanctions list (OFAC SDN, UN, EU, UK)</li>
                        <li>Residents or citizens of FATF blacklisted jurisdictions</li>
                        <li>Users who provide false or misleading information during KYC</li>
                        <li>Shell companies without demonstrable legitimate business activity</li>
                        <li>Individuals associated with terrorist organizations or criminal networks</li>
                    </ul>
                    <p>
                        Restricted jurisdictions include but are not limited to: North Korea, Iran, Syria, Cuba,
                        Venezuela, and regions under comprehensive sanctions programs.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">8</span> Account Restrictions & Closures</h2>
                    <p>
                        We reserve the right to restrict, suspend, or close accounts and freeze assets in the following circumstances:
                    </p>
                    <ul>
                        <li>Failure to complete required KYC verification within the specified timeframe</li>
                        <li>Submission of fraudulent, forged, or altered identity documents</li>
                        <li>Detection of suspicious transaction patterns or behavior</li>
                        <li>Matching of user or transaction data against sanctions lists</li>
                        <li>Receipt of a request from law enforcement or regulatory authority</li>
                        <li>Suspected breach of our Terms of Service or this AML/KYC Policy</li>
                    </ul>
                    <p>
                        In the event of account closure due to compliance concerns, we may be legally prohibited
                        from providing specific reasons for the action taken.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">9</span> Data Use for Compliance</h2>
                    <p>
                        Personal data collected during KYC/AML verification is used exclusively for compliance
                        purposes and is retained for a minimum of 5 years following the end of the business
                        relationship, as required by applicable law. This data may be shared with regulatory
                        authorities upon lawful request.
                    </p>
                </section>

                <section className="legal-section">
                    <h2><span className="section-num">10</span> Compliance Officer</h2>
                    <p>
                        Our designated Money Laundering Reporting Officer (MLRO) oversees all AML/KYC compliance
                        activities. Internal staff are trained regularly on AML obligations and are required to
                        report any suspicious activity internally before any external report is filed.
                    </p>

                    <div className="legal-contact">
                        <p>For compliance inquiries, please contact:</p>
                        <p>📧 <a href="mailto:Alphagoldprotrading@gmail.com">Alphagoldprotrading@gmail.com</a></p>
                        <p>🏢 AlphaGold Trading Financial Services Ltd. — Compliance Department</p>
                        <p>📍 128 City Road, London, EC1V 2NX, United Kingdom</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
