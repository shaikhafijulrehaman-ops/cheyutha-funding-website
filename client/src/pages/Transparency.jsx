import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Download, Award, CheckCircle, ExternalLink, HelpCircle, Landmark, Eye } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { api } from '../api';
import { getResolvedDocuments, getDocIcon } from '../utils/transparencyDocs';

export default function Transparency() {
    const [dbCerts, setDbCerts] = useState([]);

    useEffect(() => {
        api.getCertificates().then(res => setDbCerts(res || [])).catch(console.error);

        // SSE Realtime Subscription
        const sse = new EventSource((import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api/realtime');
        sse.onmessage = (event) => {
            try {
                const { table } = JSON.parse(event.data);
                if (table === 'certificates') {
                    api.getCertificates().then(res => setDbCerts(res || []));
                }
            } catch (err) {
                console.error("SSE error: ", err);
            }
        };
        return () => sse.close();
    }, []);

    const documents = getResolvedDocuments(dbCerts);

    return (
        <div style={{ paddingTop: '100px' }}>
            {/* Header banner */}
            <div className="section-dark-header" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', padding: '60px 0 80px 0' }}>
                <div className="container">
                    <SectionHeader 
                        badge="Compliance & Audits" 
                        title="Transparency & Governance" 
                        description="Cheyutha Helping Society maintains complete alignment with Indian regulatory frameworks. All registrations are verified and open for public validation." 
                    />
                </div>
            </div>

            {/* Document details section */}
            <div className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
                <div className="container">
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '950px', margin: '0 auto' }}>
                        {documents.map((doc) => (
                            <div key={doc.id} className="admin-card animate-fade-in-up" style={{ margin: 0, padding: '28px', display: 'grid', gridTemplateColumns: '70px 1fr', gap: '24px', alignItems: 'start' }}>
                                {/* Icon */}
                                <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '16px', borderRadius: 'var(--border-radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    {getDocIcon(doc.iconType, 32)}
                                </div>

                                {/* Text and Info */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                        <div>
                                            <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {doc.category}
                                            </span>
                                            <h3 style={{ fontSize: '20px', margin: '4px 0', color: 'var(--primary-dark)' }}>{doc.title}</h3>
                                        </div>
                                        <span className={`admin-badge ${doc.isUploaded ? 'admin-badge-success' : 'admin-badge-pending'}`} style={{ padding: '6px 12px', fontSize: '11px' }}>
                                            {doc.status}
                                        </span>
                                    </div>

                                    {/* Document Details Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                        <div><strong>Reference URN:</strong> {doc.urn}</div>
                                        <div><strong>Authority:</strong> {doc.authority}</div>
                                        {doc.created_at && <div><strong>Uploaded On:</strong> {new Date(doc.created_at).toLocaleDateString('en-IN')}</div>}
                                    </div>

                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                                        {doc.description}
                                    </p>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {doc.isUploaded ? (
                                            <>
                                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                                                    <Eye size={14} />
                                                    View PDF
                                                </a>
                                                <a href={doc.file_url} download target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                                                    <Download size={14} />
                                                    Download PDF
                                                </a>
                                            </>
                                        ) : (
                                            <>
                                                <button type="button" disabled className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '13px', opacity: 0.5, cursor: 'not-allowed' }}>
                                                    <Eye size={14} />
                                                    View PDF
                                                </button>
                                                <button type="button" disabled className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px', opacity: 0.5, cursor: 'not-allowed' }}>
                                                    <Download size={14} />
                                                    Download PDF
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Transparency Charter Section */}
                    <div className="admin-card" style={{ maxWidth: '950px', margin: '56px auto 0 auto', padding: '40px', borderLeft: '6px solid var(--primary)' }}>
                        <h3 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--primary-dark)' }}>NGO Financial Integrity Charter</h3>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.7' }}>
                            We operate on the principle that charity is a trust contract between the donor and the community. To safeguard this trust:
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                            <div>
                                <h4 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Landmark size={18} color="var(--primary)" />
                                    Audited Accounts
                                </h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    All books of accounts are updated monthly and reviewed by independent chartered accountants. Annual balance sheets are filed with the Income Tax Department.
                                </p>
                            </div>
                            
                            <div>
                                <h4 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HelpCircle size={18} color="var(--primary)" />
                                    Right to Inspect
                                </h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    Donors contributing more than ₹25,000 can request to inspect our material invoice files, ground receipts, and bank transaction summaries by scheduling a visit.
                                </p>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ExternalLink size={18} color="var(--primary)" />
                                    No Admin Overhead from Small Funds
                                </h4>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    100% of individual public donations are spent on programs (books, kits, medical check-ups). Admin salaries and office rents are covered by executive board contributions.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
