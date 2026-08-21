import React, { useState, useEffect } from 'react';
import { Menu, X, Heart } from 'lucide-react';
import logoImg from '../assets/logo.jpeg';
import SmartImage from './SmartImage';

export default function Header({ activeSection, onDonateClick, currentPath, navigateTo }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (sectionId) => {
        setIsMobileMenuOpen(false);
        if (currentPath !== '/') {
            navigateTo('/');
            setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const navItems = [
        { label: 'Home', target: 'home' },
        { label: 'About', target: 'about' },
        { label: 'Community', target: 'community' },
        { label: 'Programs', target: 'programs' },
        { label: 'Gallery', target: 'gallery' },
        { label: 'Sponsors', target: 'sponsors' },
        { label: 'Contact', target: 'contact' }
    ];

    const showSolidHeader = isScrolled || currentPath !== '/';

    return (
        <>
            <header className="header-wrapper scrolled">
                <div className="container flex-between" style={{ height: '100%' }}>
                    {/* Logo & Brand */}
                    <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => navigateTo('/')}>
                        <img src={logoImg} alt="Cheyutha Helping Society Logo" style={{ height: '36px', width: '36px', objectFit: 'cover', borderRadius: '50%' }} />
                        <div>
                            <h1 className="logo-text" style={{ margin: 0, lineHeight: 1.1 }}>
                                CHEYUTHA
                                <span className="logo-subtext">HELPING SOCIETY</span>
                            </h1>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav>
                        <ul className="nav-menu">
                            {navItems.map((item) => (
                                <li key={item.target}>
                                    <button
                                        onClick={() => handleNavClick(item.target)}
                                        className={`nav-link ${activeSection === item.target && currentPath === '/' ? 'active' : ''}`}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontInherit: true }}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => navigateTo('/transparency')}
                                    className={`nav-link ${currentPath === '/transparency' ? 'active' : ''}`}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontInherit: true }}
                                >
                                    Transparency
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Header CTA Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={onDonateClick} className="btn btn-primary btn-pulse btn-sm">
                            <Heart size={15} fill="white" />
                            Donate Now
                        </button>

                        {/* Inline Hamburger for tablet */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Bottom-Right Floating Action Button (FAB) Menu Toggle on Mobile */}
            <button
                className="mobile-floating-menu-fab"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Drawer"
            >
                {isMobileMenuOpen ? (
                    <X size={26} color="#ffffff" />
                ) : (
                    <SmartImage src={logoImg} alt="NGO Logo Menu" style={{ height: '42px', width: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
            </button>

            {/* Fullscreen Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="mobile-fullscreen-drawer flex-center">
                    <button className="drawer-close-btn" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                        <X size={28} />
                    </button>

                    <div className="drawer-inner" style={{ textAlign: 'center', width: '100%', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                            <SmartImage src={logoImg} alt="NGO Logo" style={{ height: '48px', width: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                        
                        <ul className="drawer-menu-list">
                            {navItems.map((item) => (
                                <li key={item.target}>
                                    <button
                                        onClick={() => handleNavClick(item.target)}
                                        className={`drawer-link ${activeSection === item.target && currentPath === '/' ? 'active' : ''}`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                            <li>
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigateTo('/transparency');
                                    }}
                                    className={`drawer-link ${currentPath === '/transparency' ? 'active' : ''}`}
                                >
                                    Transparency
                                </button>
                            </li>
                        </ul>

                        <div style={{ marginTop: '28px' }}>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    onDonateClick();
                                }}
                                className="btn btn-primary btn-pulse"
                                style={{ width: '100%', minHeight: '48px', justifyContent: 'center', fontSize: '15px' }}
                            >
                                <Heart size={18} fill="white" />
                                Donate Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
