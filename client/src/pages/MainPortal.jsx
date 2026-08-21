import React, { useState, useEffect, useRef } from 'react';
import { 
    Heart, ShieldCheck, Award, FileText, CheckCircle, Phone, Mail, 
    MapPin, Users, Download, ExternalLink, Calendar, MessageSquare, 
    ArrowRight, ChevronRight, ChevronLeft, MessageCircle, AlertCircle, Quote, Eye, Landmark
} from 'lucide-react';
import { api } from '../api';
import SmartImage from '../components/SmartImage';
import SectionHeader from '../components/SectionHeader';
import TransparencyCarousel from '../components/TransparencyCarousel';
import { getResolvedDocuments } from '../utils/transparencyDocs';
import logoImg from '../assets/logo.jpeg';

// Reusable horizontal category slider with smooth arrow buttons
const CategorySlider = ({ children }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = direction === 'left' ? -360 : 360;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                <button 
                    type="button"
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    type="button"
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            <div ref={scrollRef} className="horizontal-scroll-container">
                {React.Children.map(children, child => (
                    <div className="horizontal-scroll-item">
                        {child}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function MainPortal({ onDonateClick, navigateTo }) {
    // API Data States
    const [members, setMembers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [events, setEvents] = useState([]);
    const [groundActions, setGroundActions] = useState([]);
    const [settings, setSettings] = useState(null);
    const [heroSlides, setHeroSlides] = useState([]);
    const [heroLoading, setHeroLoading] = useState(true);
    const [heroImagesError, setHeroImagesError] = useState({});
    const [certificates, setCertificates] = useState([]);

    // Interaction States
    const [activeAboutTab, setActiveAboutTab] = useState('story');
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [activeHeroIndex, setActiveHeroIndex] = useState(0);
    const [slideAspects, setSlideAspects] = useState({});
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
    const [selectedGroundAction, setSelectedGroundAction] = useState(null);
    const [groundActionImgIndex, setGroundActionImgIndex] = useState(0);

    // Contact Form States
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [contactSuccess, setContactSuccess] = useState('');
    const [contactError, setContactError] = useState('');
    const [submittingContact, setSubmittingContact] = useState(false);

    // Counters Animation Ref
    const statsSectionRef = useRef(null);
    const [statsVisible, setStatsVisible] = useState(false);

    // Load initial data independently for each section in parallel
    useEffect(() => {
        // 1. Slides / Hero
        api.getSlides().then(rawSlides => {
            if (Array.isArray(rawSlides) && rawSlides.length > 0) {
                const sorted = [...rawSlides].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                setHeroSlides(sorted);
            }
        }).catch(err => console.error("Slides fetch error:", err));

        // 2. Members
        api.getMembers().then(data => setMembers(data || [])).catch(err => console.error("Members fetch error:", err));

        // 3. Programs
        api.getPrograms().then(data => setPrograms(data || [])).catch(err => console.error("Programs fetch error:", err));

        // 4. Gallery
        api.getGallery().then(data => setGallery(data || [])).catch(err => console.error("Gallery fetch error:", err));

        // 5. Sponsors
        api.getSponsors().then(data => setSponsors(data || [])).catch(err => console.error("Sponsors fetch error:", err));

        // 6. Quotes
        api.getQuotes().then(data => setQuotes(data || [])).catch(err => console.error("Quotes fetch error:", err));

        // 7. Events
        api.getEvents().then(data => setEvents(data || [])).catch(err => console.error("Events fetch error:", err));

        // 8. Settings
        api.getSettings().then(data => data && setSettings(data)).catch(err => console.error("Settings fetch error:", err));

        // 9. Ground Actions
        api.getGroundActions().then(data => setGroundActions(data || [])).catch(err => console.error("Ground actions fetch error:", err));

        // 10. Certificates
        api.getCertificates().then(data => setCertificates(data || [])).catch(err => console.error("Certificates fetch error:", err));
    }, []);

    // Real-time SSE synchronization
    useEffect(() => {
        const sseUrl = (api.API_URL || '/api').replace(/\/api$/, '') + '/api/realtime';
        const sse = new EventSource(sseUrl);
        
        sse.onmessage = (event) => {
            try {
                const { table } = JSON.parse(event.data);
                if (table === 'members') {
                    api.getMembers().then(res => setMembers(res || []));
                } else if (table === 'programs') {
                    api.getPrograms().then(res => setPrograms(res || []));
                } else if (table === 'gallery') {
                    api.getGallery().then(res => setGallery(res || []));
                } else if (table === 'sponsors') {
                    api.getSponsors().then(res => setSponsors(res || []));
                } else if (table === 'quotes') {
                    api.getQuotes().then(res => setQuotes(res || []));
                } else if (table === 'events') {
                    api.getEvents().then(res => setEvents(res || []));
                } else if (table === 'ground-actions') {
                    api.getGroundActions().then(res => setGroundActions(res || []));
                } else if (table === 'slider') {
                    api.getSlides().then(res => {
                        const sorted = [...(res || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                        setHeroSlides(sorted);
                    });
                } else if (table === 'certificates') {
                    api.getCertificates().then(res => setCertificates(res || []));
                } else if (table === 'settings') {
                    api.getSettings().then(res => setSettings(res));
                }
            } catch (err) {
                console.error("SSE parse error: ", err);
            }
        };

        sse.onerror = () => {
            sse.close();
        };

        return () => {
            sse.close();
        };
    }, []);

    // Lightbox & Ground Actions Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setSelectedActivity(null);
                setSelectedGalleryItem(null);
                setSelectedGroundAction(null);
            }
            if (e.key === 'ArrowLeft') {
                if (selectedGalleryItem) {
                    const albumImages = [
                        selectedGalleryItem.cover_image,
                        ...(Array.isArray(selectedGalleryItem.images) ? selectedGalleryItem.images.map(img => img.url) : [])
                    ].filter(Boolean);
                    setGroundActionImgIndex(prev => prev === 0 ? albumImages.length - 1 : prev - 1);
                }
                if (selectedGroundAction) {
                    const actionImages = [
                        selectedGroundAction.cover_image,
                        ...(Array.isArray(selectedGroundAction.gallery_images) ? selectedGroundAction.gallery_images.map(img => img.url) : [])
                    ].filter(Boolean);
                    setGroundActionImgIndex(prev => prev === 0 ? actionImages.length - 1 : prev - 1);
                }
            }
            if (e.key === 'ArrowRight') {
                if (selectedGalleryItem) {
                    const albumImages = [
                        selectedGalleryItem.cover_image,
                        ...(Array.isArray(selectedGalleryItem.images) ? selectedGalleryItem.images.map(img => img.url) : [])
                    ].filter(Boolean);
                    setGroundActionImgIndex(prev => prev === albumImages.length - 1 ? 0 : prev + 1);
                }
                if (selectedGroundAction) {
                    const actionImages = [
                        selectedGroundAction.cover_image,
                        ...(Array.isArray(selectedGroundAction.gallery_images) ? selectedGroundAction.gallery_images.map(img => img.url) : [])
                    ].filter(Boolean);
                    setGroundActionImgIndex(prev => prev === actionImages.length - 1 ? 0 : prev + 1);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedGalleryItem, selectedGroundAction, gallery]);

    // Quote auto-rotator
    useEffect(() => {
        if (quotes.length === 0) return;
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [quotes]);

    // Hero carousel auto-slider
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const interval = setInterval(() => {
            setActiveHeroIndex((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    // Scroll listener for stats counter trigger
    useEffect(() => {
        const handleScroll = () => {
            if (!statsSectionRef.current) return;
            const rect = statsSectionRef.current.getBoundingClientRect();
            const isVisible = (rect.top <= window.innerHeight - 100);
            if (isVisible && !statsVisible) {
                setStatsVisible(true);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [statsVisible]);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactSuccess('');
        setContactError('');
        if (!contactName || !contactEmail || !contactMessage) {
            setContactError('Please fill in name, email, and message.');
            return;
        }
        setSubmittingContact(true);
        try {
            const res = await api.submitContact({
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
                message: contactMessage
            });
            if (res.error) throw new Error(res.error);
            setContactSuccess('Your message has been received! Our team will get back to you shortly.');
            setContactName('');
            setContactEmail('');
            setContactPhone('');
            setContactMessage('');
        } catch (err) {
            setContactError(err.message || 'Failed to send message.');
        } finally {
            setSubmittingContact(false);
        }
    };

    // Local Animated Counter helper component
    const Counter = ({ endValue, duration = 2000 }) => {
        const [count, setCount] = useState(0);
        useEffect(() => {
            if (!statsVisible) return;
            let start = 0;
            const increment = Math.ceil(endValue / (duration / 30));
            const timer = setInterval(() => {
                start += increment;
                if (start >= endValue) {
                    setCount(endValue);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, 30);
            return () => clearInterval(timer);
        }, [statsVisible, endValue]);

        return <span>{count.toLocaleString()}</span>;
    };

    return (
        <div className="main-portal">
            
            {/* 1. HERO SECTION */}
            <section id="home" className="hero-slider-container">
                {heroSlides.length > 0 ? (
                    heroSlides.map((slide, index) => {
                        const isActive = activeHeroIndex === index;
                        return (
                            <div 
                                key={slide.id} 
                                className={`hero-slide ${isActive ? 'active' : ''}`}
                            >
                                {slide.image_url && (
                                    <img 
                                        src={slide.image_url} 
                                        alt={slide.title || "Hero banner"} 
                                        className={`hero-image ${slideAspects[slide.id] || 'landscape'}`}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        onLoad={(e) => {
                                            const { naturalWidth, naturalHeight } = e.target;
                                            const aspect = naturalWidth > naturalHeight ? 'landscape' : 'portrait';
                                            setSlideAspects(prev => ({ ...prev, [slide.id]: aspect }));
                                        }}
                                        onError={(err) => {
                                            console.error(`Hero image load error for "${slide.title}":`, slide.image_url, err);
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="hero-slide active">
                        <div className="hero-fallback-empty">
                            <img src={logoImg} alt="Cheyutha Helping Society" className="hero-fallback-logo" />
                        </div>
                    </div>
                )}
            </section>

            {/* 2. TRUST SECTION */}
            <section className="section" style={{ backgroundColor: '#ffffff' }}>
                <div className="container">
                    <SectionHeader 
                        badge="100% Transparent" 
                        title="Trusted & Verified Organization" 
                        description="We believe in absolute transparency. View and download our official legal certificates and compliance approvals below." 
                    />

                    <TransparencyCarousel documents={getResolvedDocuments(certificates)} />
                    
                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                        <button onClick={() => navigateTo('/transparency')} className="btn btn-secondary">
                            View Compliance Dashboard
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 3. LATEST ACTIVITIES SECTION */}
            <section id="activities" className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
                <div className="container">
                    <SectionHeader 
                        badge="News & Updates" 
                        title="Latest Activities" 
                        description="Keep up to date with our recent programs, upcoming camps, and organizational announcements." 
                    />

                    {events.length > 0 ? (
                        <CategorySlider>
                            {events.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="ground-action-card" 
                                    style={{ display: 'flex', flexDirection: 'column', padding: '16px', cursor: 'pointer', height: '100%' }}
                                    onClick={() => setSelectedActivity(item)}
                                >
                                    {item.image_url && (
                                        <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                                            <SmartImage src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                                            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '10px' }}>{item.type}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{item.date}</span>
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-dark)', margin: '0 0 6px 0', lineHeight: 1.3 }}>{item.title}</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.content}
                                        </p>
                                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            Read More <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </CategorySlider>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            No latest activities available.
                        </div>
                    )}
                </div>
            </section>

            {/* 4. PROGRAMS SECTION */}
            <section id="programs" className="section" style={{ backgroundColor: '#ffffff' }}>
                <div className="container">
                    <SectionHeader 
                        badge="What We Do" 
                        title="Our Impact Programs" 
                        description="We run structured programs that tackle specific socio-economic challenges in rural Andhra Pradesh." 
                    />

                    {programs.length > 0 ? (
                        <CategorySlider>
                            {programs.map((prog) => (
                                <div key={prog.id} className="program-card">
                                    <SmartImage src={prog.image_url} alt={prog.title} style={{ height: '220px', width: '100%', objectFit: 'cover' }} />
                                    <div className="program-info">
                                        <h3>{prog.title}</h3>
                                        <p>{prog.description}</p>
                                        <button onClick={onDonateClick} className="program-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                            Support Program
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </CategorySlider>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            No programs available.
                        </div>
                    )}
                </div>
            </section>

            {/* 5. GROUND ACTIONS SECTION */}
            <section id="ground-actions" className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
                <div className="container">
                    <SectionHeader 
                        badge="On The Ground" 
                        title="Ground Actions & Projects" 
                        description="Real-time visual reports of our ongoing initiatives and accomplished projects in rural communities." 
                    />

                    {groundActions.length > 0 ? (
                        <CategorySlider>
                            {groundActions.map((action) => (
                                <div key={action.id} className="ground-action-card">
                                    <div className="ground-action-img-container" style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                                        <SmartImage src={action.cover_image} alt={action.title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                        <div className="ground-action-category-badge">{action.category}</div>
                                    </div>
                                    <div className="ground-action-body">
                                        <div className="ground-action-meta">
                                            <span>📍 {action.location}</span>
                                            <span>📅 {action.date}</span>
                                        </div>
                                        <h3 className="ground-action-title">{action.title}</h3>
                                        <p className="ground-action-subtitle">{action.subtitle || action.description.slice(0, 75) + '...'}</p>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setSelectedGroundAction(action);
                                                setGroundActionImgIndex(0);
                                            }} 
                                            className="btn btn-primary"
                                            style={{ width: '100%', marginTop: '12px' }}
                                        >
                                            Open Gallery
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </CategorySlider>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            No ground actions available.
                        </div>
                    )}
                </div>
            </section>

            {/* 6. GALLERY ALBUMS SECTION */}
            <section id="gallery" className="section" style={{ backgroundColor: '#ffffff' }}>
                <div className="container">
                    <SectionHeader 
                        badge="Media Gallery" 
                        title="Our Project Albums" 
                        description="Visual records of our school supply distributions, medical diagnostic checkups, and vocational computer labs." 
                    />

                    {gallery.length > 0 ? (
                        <CategorySlider>
                            {gallery.map((album) => (
                                <div key={album.id} className="gallery-item-card">
                                    <SmartImage src={album.cover_image} alt={album.album_title} style={{ height: '220px', width: '100%', objectFit: 'cover' }} />
                                    <div className="gallery-item-body">
                                        <h3 className="gallery-item-title">{album.album_title}</h3>
                                        <p className="gallery-item-desc">
                                            {album.description || 'Verification compliance and community support activities.'}
                                        </p>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setSelectedGalleryItem(album);
                                                setGroundActionImgIndex(0);
                                            }} 
                                            className="btn btn-secondary btn-sm"
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}
                                        >
                                            View Album Gallery
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </CategorySlider>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            No gallery albums available.
                        </div>
                    )}
                </div>
            </section>

            {/* 7. SPONSORS SECTION */}
            {sponsors.length > 0 && (
                <section id="sponsors" className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
                    <div className="container">
                        <SectionHeader 
                            badge="Corporate Partners" 
                            title="Our Present Sponsors" 
                            description="We are supported by leading institutions and corporate social responsibility (CSR) donors." 
                        />
                        <CategorySlider>
                            {sponsors.map((spon) => (
                                <div key={spon.id} className="sponsor-highlight flex-center" style={{ gap: '12px', padding: '16px 24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', height: '100%' }}>
                                    <img src={spon.logo_url} alt={spon.name} style={{ height: '40px', objectFit: 'contain' }} />
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{spon.name}</div>
                                        {spon.website && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{spon.website}</div>}
                                    </div>
                                </div>
                            ))}
                        </CategorySlider>
                    </div>
                </section>
            )}

            {/* 8. ABOUT SECTION */}
            <section id="about" className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
                <div className="container">
                    <SectionHeader 
                        badge="Our Foundation" 
                        title="Dedicated to Raising Society's Standards" 
                        description="Learn about the milestones, story, objectives, and compliance history of our society." 
                    />
                    <div className="about-grid" style={{ marginTop: '40px' }}>
                        
                        <div className="about-info">
                            <div className="about-tabs">
                                <button className={`about-tab ${activeAboutTab === 'story' ? 'active' : ''}`} onClick={() => setActiveAboutTab('story')}>
                                    Our Story
                                </button>
                                <button className={`about-tab ${activeAboutTab === 'mission' ? 'active' : ''}`} onClick={() => setActiveAboutTab('mission')}>
                                    Mission & Vision
                                </button>
                                <button className={`about-tab ${activeAboutTab === 'objectives' ? 'active' : ''}`} onClick={() => setActiveAboutTab('objectives')}>
                                    Objectives
                                </button>
                            </div>

                            <div className="about-tab-content">
                                {activeAboutTab === 'story' && (
                                    <div className="animate-fade-in">
                                        <p style={{ marginBottom: '16px' }}>
                                            Cheyutha Helping Society is a registered NGO under section 80G & 12A, operating actively in the state of Andhra Pradesh. Incorporated in September 2025 (Registration No: 250 of 2025), we focus on ground actions rather than theoretical plans.
                                        </p>
                                        <p>
                                            We operate transparently. All tax exemption certificates, MCA registration letters, and compliance filings are open to the public to review.
                                        </p>
                                    </div>
                                )}

                                {activeAboutTab === 'mission' && (
                                    <div className="animate-fade-in">
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '16px' }}>Our Mission</h4>
                                        <p style={{ marginBottom: '16px' }}>
                                            To deploy localized education, free diagnostic healthcare, and skills development that equip rural Indian communities to lift themselves out of poverty.
                                        </p>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '8px', fontSize: '16px' }}>Our Vision</h4>
                                        <p>
                                            A society where every child has access to quality schooling, every family receives timely healthcare, and every woman is financially self-reliant.
                                        </p>
                                    </div>
                                )}

                                {activeAboutTab === 'objectives' && (
                                    <div className="animate-fade-in">
                                        <ul style={{ paddingLeft: '20px', fontSize: '15px' }}>
                                            <li style={{ marginBottom: '8px' }}>Facilitate 100% school enrollment for children in Tadigadapa and Penamaluru rural areas.</li>
                                            <li style={{ marginBottom: '8px' }}>Conduct semi-monthly free health screening camps and distribute free vital medicines.</li>
                                            <li style={{ marginBottom: '8px' }}>Provide free sewing machines and computer literacy to rural women for immediate employment.</li>
                                            <li style={{ marginBottom: '8px' }}>Operate with complete financial transparency, maintaining public records of all allocations.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Founder Message Card */}
                            <div className="founder-msg-card">
                                <p className="founder-msg-text">
                                    "Real impact begins when we stop treating charity as a handout and start designing it as an investment in human dignity. We ensure every single rupee you contribute translates directly into verifiable community empowerment."
                                </p>
                                <div className="founder-meta">
                                    {members.length > 0 ? (
                                        <>
                                            <SmartImage src={members[0].image_url} alt={members[0].name} style={{ height: '48px', width: '48px', objectFit: 'cover', borderRadius: '50%' }} />
                                            <div>
                                                <h4>{members[0].name}</h4>
                                                <span>{members[0].role}, Cheyutha Helping Society</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <h4>Dr. A. Srinivas Rao</h4>
                                            <span>Founder & President, Cheyutha Helping Society</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Milestone Timeline */}
                        <div style={{ paddingLeft: '20px' }}>
                            <h3 style={{ fontSize: '22px', marginBottom: '24px' }}>Milestone Timeline</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', borderLeft: '2px solid var(--primary)', paddingLeft: '24px', marginLeft: '12px' }}>
                                
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-33px', top: '4px', height: '16px', width: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '4px solid var(--bg-main)' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase' }}>Sept 25, 2025</span>
                                    <h4 style={{ fontSize: '16px', margin: '4px 0' }}>NGO Incorporation</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Legally incorporated under AP Societies Registration Act, 2001 (Reg No: 250 of 2025) in Vijayawada.</p>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-33px', top: '4px', height: '16px', width: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '4px solid var(--bg-main)' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase' }}>Nov 07, 2025</span>
                                    <h4 style={{ fontSize: '16px', margin: '4px 0' }}>Income Tax Exemption Approvals</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Granted provisional tax-exemption status under Section 12A and Section 80G by the Income Tax Department.</p>
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-33px', top: '4px', height: '16px', width: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '4px solid var(--bg-main)' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase' }}>Jan 30, 2026</span>
                                    <h4 style={{ fontSize: '16px', margin: '4px 0' }}>MCA CSR-1 Registration</h4>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Registered with the Ministry of Corporate Affairs (CSR00104010) to execute corporate CSR funding initiatives.</p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* OUR COMMUNITY SECTION */}
            <section id="community" className="section" style={{ backgroundColor: '#ffffff' }}>
                <div className="container">
                    <SectionHeader 
                        badge="Our People" 
                        title="Who We Are & How We Serve" 
                        description="Meet the dedicated team working on the ground to distribute resources, coordinate healthcare, and maintain strict financial audit trails." 
                    />

                    {members.length > 0 ? (
                        <CategorySlider>
                            {members.map((member) => (
                                <div key={member.id} className="community-card">
                                    <div className="community-img-wrapper">
                                        <SmartImage src={member.image_url} alt={member.name} style={{ height: '260px', width: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="community-info">
                                        <div className="community-role">{member.role}</div>
                                        <h3>{member.name}</h3>
                                        <div className="community-resp">
                                            <strong>Department:</strong> {member.department}
                                        </div>
                                        <p className="community-desc">{member.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CategorySlider>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            No community members available.
                        </div>
                    )}
                </div>
            </section>

            {/* 9. TESTIMONIALS (QUOTES) SECTION */}
            {quotes.length > 0 && (
                <section id="testimonials" className="section" style={{ backgroundColor: '#ffffff' }}>
                    <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
                        <SectionHeader 
                            badge="Words of Inspiration" 
                            title="Charity Quotes & Testimonials" 
                            description="Inspirational thoughts driving our community work." 
                        />
                        <div className="quotes-carousel" style={{ marginTop: '32px', padding: '40px', background: 'var(--bg-main)', borderRadius: 'var(--border-radius-lg)', border: '1px solid #e2e8f0', position: 'relative' }}>
                            <Quote size={40} style={{ color: 'var(--primary-light)', margin: '0 auto 16px auto', display: 'block', opacity: 0.5 }} />
                            <p style={{ fontSize: '18px', fontStyle: 'italic', color: 'var(--primary-dark)', fontWeight: '500', lineHeight: 1.6 }}>
                                "{quotes[currentQuoteIndex]?.quote}"
                            </p>
                            <h4 style={{ marginTop: '16px', fontSize: '15px', color: 'var(--accent)', fontWeight: 'bold' }}>
                                — {quotes[currentQuoteIndex]?.author}
                            </h4>
                        </div>
                    </div>
                </section>
            )}

            {/* IMPACT STATISTICS BANNER SECTION */}
            <section ref={statsSectionRef} className="stats-banner">
                <div className="container grid-4">
                    <div className="stat-item">
                        <h3><Counter endValue={parseInt(settings?.stat_children) || 0} />+</h3>
                        <p>Children Educated</p>
                    </div>
                    <div className="stat-item">
                        <h3><Counter endValue={parseInt(settings?.stat_camps) || 0} />+</h3>
                        <p>Medical Camps Done</p>
                    </div>
                    <div className="stat-item">
                        <h3><Counter endValue={parseInt(settings?.stat_women) || 0} />+</h3>
                        <p>Women Vocations Enabled</p>
                    </div>
                    <div className="stat-item">
                        <h3>₹<Counter endValue={parseInt(settings?.stat_funds) || 0} />L+</h3>
                        <p>Funds Utilized</p>
                    </div>
                </div>
            </section>

            {/* DONATION BANNER SECTION */}
            <section id="donate" className="section section-dark-header" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: '#ffffff' }}>
                <div className="container">
                    <SectionHeader 
                        badge="Make a Difference" 
                        title="Join Us in Empowering Lives Today" 
                        description="Your tax-deductible donation fuels school bag distributions, vital medical check-ups, and vocational computer labs." 
                    />
                    <div className="donate-grid" style={{ marginTop: '48px' }}>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '32px', fontSize: '16px', lineHeight: 1.6 }}>
                                Cheyutha Helping Society processes donations with 100% transparency. Indian donors are instantly issued 80G tax exemption certificates.
                            </p>
                            <button onClick={onDonateClick} className="btn btn-white btn-pulse" style={{ fontSize: '16px' }}>
                                <Heart size={18} fill="var(--primary)" />
                                Donate to Our Funds
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--border-radius-lg)', padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <ShieldCheck size={36} color="var(--accent)" />
                                    <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ color: '#ffffff', fontSize: '16px', margin: 0 }}>100% Direct Allocation</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '4px 0 0 0' }}>Every rupee directly finances materials and camps, backed by public ledger sheets.</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <Award size={36} color="var(--accent)" />
                                    <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ color: '#ffffff', fontSize: '16px', margin: 0 }}>80G Tax Deductible</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: '4px 0 0 0' }}>Claim 50% tax deductions on your donor portal immediately upon payment completion.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 10. CONTACT SECTION */}
            <section id="contact" className="section" style={{ backgroundColor: 'var(--bg-main)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <SectionHeader 
                        badge="Get In Touch" 
                        title="Contact Our Team" 
                        description="Have questions about our transparency, donation allocations, or want to volunteer? Send us a message." 
                    />
                    
                    <div className="donate-form-card contact-form-card" style={{ marginTop: '24px', background: '#ffffff', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                        {contactSuccess && (
                            <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: 'var(--border-radius-sm)', fontSize: '14px', marginBottom: '24px', fontWeight: '500', textAlign: 'center' }}>
                                {contactSuccess}
                            </div>
                        )}
                        {contactError && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--border-radius-sm)', fontSize: '14px', marginBottom: '24px', fontWeight: '500', textAlign: 'center' }}>
                                {contactError}
                            </div>
                        )}
                        <form onSubmit={handleContactSubmit} className="contact-form-grid">
                            <div className="form-group">
                                <label>Your Name</label>
                                <input type="text" className="form-control" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" className="form-control" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                            </div>
                            <div className="form-group full-width">
                                <label>Phone Number (Optional)</label>
                                <input type="text" className="form-control" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                            </div>
                            <div className="form-group full-width">
                                <label>Message</label>
                                <textarea className="form-control" rows="4" required placeholder="Type your query here..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submittingContact} style={{ margin: '12px auto 0 auto' }}>
                                {submittingContact ? 'Sending Message...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* --- DETAILS MODALS --- */}

            {/* Latest Activities Details Modal */}
            {selectedActivity && (
                <div className="lightbox-modal flex-center" onClick={() => setSelectedActivity(null)} style={{ zIndex: 100000 }}>
                    <div className="lightbox-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#ffffff', color: 'var(--text-primary)', maxWidth: '580px', borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--shadow-lg)', position: 'relative' }}>
                        <button className="lightbox-close" onClick={() => setSelectedActivity(null)} style={{ color: 'var(--text-primary)', top: '16px', right: '20px', fontSize: '24px' }}>×</button>
                        {selectedActivity.image_url && (
                            <SmartImage src={selectedActivity.image_url} alt={selectedActivity.title} style={{ height: '260px', width: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                        )}
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{selectedActivity.type}</span>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedActivity.date}</span>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-dark)', margin: 0 }}>{selectedActivity.title}</h2>
                        {selectedActivity.description && (
                            <h4 style={{ fontSize: '15px', color: 'var(--primary)', margin: 0 }}>{selectedActivity.content}</h4>
                        )}
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            {selectedActivity.description || selectedActivity.content}
                        </p>
                    </div>
                </div>
            )}

            {/* Gallery Albums Slider Modal */}
            {selectedGalleryItem && (
                <div className="lightbox-modal flex-center" onClick={() => setSelectedGalleryItem(null)} style={{ zIndex: 100000 }}>
                    <div 
                        className="lightbox-content animate-fade-in" 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ 
                            backgroundColor: '#ffffff', 
                            color: 'var(--text-primary)', 
                            maxWidth: '680px', 
                            width: '100%',
                            borderRadius: '20px', 
                            padding: '32px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px', 
                            boxShadow: 'var(--shadow-lg)', 
                            position: 'relative' 
                        }}
                    >
                        <button className="lightbox-close" onClick={() => setSelectedGalleryItem(null)} style={{ color: 'var(--text-primary)', top: '16px', right: '20px', fontSize: '24px' }}>×</button>
                        
                        {(() => {
                            const albumImages = [
                                selectedGalleryItem.cover_image,
                                ...(Array.isArray(selectedGalleryItem.images) ? selectedGalleryItem.images.map(img => img.url) : [])
                            ].filter(Boolean);
                            
                            const activeImg = albumImages[groundActionImgIndex] || selectedGalleryItem.cover_image;
                            
                            return (
                                <>
                                    <div style={{ position: 'relative', height: '360px', width: '100%', overflow: 'hidden', borderRadius: '12px' }}>
                                        <SmartImage src={activeImg} alt={selectedGalleryItem.album_title} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                        {albumImages.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGroundActionImgIndex(prev => prev === 0 ? albumImages.length - 1 : prev - 1);
                                                    }}
                                                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ‹
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGroundActionImgIndex(prev => prev === albumImages.length - 1 ? 0 : prev + 1);
                                                    }}
                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ›
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)' }}>
                                        {groundActionImgIndex + 1} of {albumImages.length} images
                                    </div>
                                    
                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-dark)', margin: 0 }}>
                                        {selectedGalleryItem.album_title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                        {selectedGalleryItem.description || 'Compliance activities conducted on the ground.'}
                                    </p>

                                    {albumImages.length > 1 && (
                                        <div className="modal-thumbnail-row">
                                            {albumImages.map((src, index) => (
                                                <img 
                                                    key={index}
                                                    src={src} 
                                                    alt="Thumbnail" 
                                                    onClick={() => setGroundActionImgIndex(index)}
                                                    className={`modal-thumbnail-img ${index === groundActionImgIndex ? 'active' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Ground Actions Modal */}
            {selectedGroundAction && (
                <div className="lightbox-modal flex-center" onClick={() => setSelectedGroundAction(null)} style={{ zIndex: 100000 }}>
                    <div 
                        className="lightbox-content animate-fade-in" 
                        onClick={(e) => e.stopPropagation()} 
                        style={{ 
                            backgroundColor: '#ffffff', 
                            color: 'var(--text-primary)', 
                            maxWidth: '680px', 
                            width: '100%',
                            borderRadius: '20px', 
                            padding: '32px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '16px', 
                            boxShadow: 'var(--shadow-lg)', 
                            position: 'relative' 
                        }}
                    >
                        <button className="lightbox-close" onClick={() => setSelectedGroundAction(null)} style={{ color: 'var(--text-primary)', top: '16px', right: '20px', fontSize: '24px' }}>×</button>
                        
                        {(() => {
                            const actionImages = [
                                selectedGroundAction.cover_image,
                                ...(Array.isArray(selectedGroundAction.gallery_images) ? selectedGroundAction.gallery_images.map(img => img.url) : [])
                            ].filter(Boolean);

                            const currentImg = actionImages[groundActionImgIndex] || selectedGroundAction.cover_image;

                            return (
                                <>
                                    <div style={{ position: 'relative', height: '360px', width: '100%', overflow: 'hidden', borderRadius: '12px' }}>
                                        <SmartImage 
                                            src={currentImg} 
                                            alt={selectedGroundAction.title} 
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                                        />
                                        
                                        {/* Prev / Next Arrows */}
                                        {actionImages.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGroundActionImgIndex(prev => prev === 0 ? actionImages.length - 1 : prev - 1);
                                                    }}
                                                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ‹
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setGroundActionImgIndex(prev => prev === actionImages.length - 1 ? 0 : prev + 1);
                                                    }}
                                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    ›
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Counter */}
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent)' }}>
                                        {groundActionImgIndex + 1} of {actionImages.length} project images
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                        <span>📍 {selectedGroundAction.location}</span>
                                        <span>📅 {selectedGroundAction.date}</span>
                                    </div>

                                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-dark)', margin: 0 }}>
                                        {selectedGroundAction.title}
                                    </h3>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                        {selectedGroundAction.description}
                                    </p>

                                    {/* Thumbnails row */}
                                    {actionImages.length > 1 && (
                                        <div className="modal-thumbnail-row">
                                            {actionImages.map((src, index) => (
                                                <img 
                                                    key={index}
                                                    src={src} 
                                                    alt="Thumbnail" 
                                                    onClick={() => setGroundActionImgIndex(index)}
                                                    className={`modal-thumbnail-img ${index === groundActionImgIndex ? 'active' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

        </div>
    );
}
