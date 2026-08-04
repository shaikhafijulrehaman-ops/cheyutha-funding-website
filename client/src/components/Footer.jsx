import React from 'react';
import { Phone, Mail, MapPin, Heart, ShieldAlert } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';
import SmartImage from './SmartImage';

export default function Footer({ navigateTo, settings }) {
    const handleLinkClick = (sectionId) => {
        navigateTo('/');
        setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <footer className="footer-wrapper">
            <div className="container">
                <div className="footer-grid">
                    {/* 1. NGO About column */}
                    <div className="footer-col footer-about-col">
                        <div className="footer-about-logo">
                            <SmartImage src={logoImg} alt="Cheyutha Helping Society Logo" style={{ height: '42px', width: '42px', objectFit: 'cover', borderRadius: '50%' }} />
                            <h3 style={{ margin: 0, fontSize: '18px' }}>Cheyutha Helping Society</h3>
                        </div>
                        <p style={{ fontSize: '13.5px', lineHeight: '1.5', marginBottom: '14px' }}>
                            A registered non-profit organization dedicated to education, healthcare camps, and women empowerment with 100% financial transparency.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <span className="tax-badge-info" style={{ margin: 0, padding: '5px 12px', fontSize: '11px' }}>
                                <ShieldAlert size={14} />
                                80G & 12A Exempted
                            </span>
                        </div>
                    </div>

                    {/* 2-Column Links Grid Wrapper for Mobile */}
                    <div className="footer-links-mobile-grid">
                        {/* Quick links */}
                        <div className="footer-col">
                            <h3>Quick Links</h3>
                            <ul className="footer-links">
                                <li><a href="#home" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>Home</a></li>
                                <li><a href="#about" onClick={(e) => { e.preventDefault(); handleLinkClick('about'); }}>About Us</a></li>
                                <li><a href="#community" onClick={(e) => { e.preventDefault(); handleLinkClick('community'); }}>Community</a></li>
                                <li><a href="#programs" onClick={(e) => { e.preventDefault(); handleLinkClick('programs'); }}>Programs</a></li>
                                <li><a href="#gallery" onClick={(e) => { e.preventDefault(); handleLinkClick('gallery'); }}>Gallery</a></li>
                                <li><a href="/transparency" onClick={(e) => { e.preventDefault(); navigateTo('/transparency'); }}>Transparency</a></li>
                            </ul>
                        </div>

                        {/* Legal Trust Links */}
                        <div className="footer-col">
                            <h3>Trust & Legal</h3>
                            <ul className="footer-links">
                                <li><a href="/transparency" onClick={(e) => { e.preventDefault(); navigateTo('/transparency'); }}>CSR Registration</a></li>
                                <li><a href="/transparency" onClick={(e) => { e.preventDefault(); navigateTo('/transparency'); }}>12A Tax Status</a></li>
                                <li><a href="/transparency" onClick={(e) => { e.preventDefault(); navigateTo('/transparency'); }}>80G Certificate</a></li>
                                <li><a href="/transparency" onClick={(e) => { e.preventDefault(); navigateTo('/transparency'); }}>Society Bylaws</a></li>
                                <li><a href="/admin" onClick={(e) => { e.preventDefault(); navigateTo('/admin'); }}>Admin Login</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* 4. Contact details */}
                    <div className="footer-col footer-contact-col">
                        <h3>Contact Info</h3>
                        <div className="footer-contact-item">
                            <MapPin size={16} />
                            <span style={{ fontSize: '13px' }}>
                                {settings?.address || '20-1062, Muralinagar, Tadigadapa, Penamaluru, Vijayawada - 520007'}
                            </span>
                        </div>
                        <div className="footer-contact-item">
                            <Phone size={16} />
                            <a href={`tel:${settings?.phone || '+919876543210'}`} style={{ fontSize: '13px' }}>
                                {settings?.phone || '+91 98765 43210'}
                            </a>
                        </div>
                        <div className="footer-contact-item">
                            <Mail size={16} />
                            <a href={`mailto:${settings?.email || 'info@cheyutha.org'}`} style={{ fontSize: '13px' }}>
                                {settings?.email || 'info@cheyuthahelpingsociety.org'}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom copyright block */}
                <div className="footer-bottom">
                    <p>{settings?.footer_text || '© 2026 Cheyutha Helping Society. All rights reserved. Reg No: 250/2025 (AP Societies Registration Act).'}</p>
                </div>
            </div>
        </footer>
    );
}
