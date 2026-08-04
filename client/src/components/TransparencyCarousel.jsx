import React, { useState, useEffect, useRef } from 'react';
import { Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDocIcon } from '../utils/transparencyDocs';

export default function TransparencyCarousel({ documents = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef(null);
    const isDraggingRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);

    // Left-to-Right smooth continuous sliding every 3.2s
    useEffect(() => {
        if (isPaused || !documents || documents.length === 0) return;

        const interval = setInterval(() => {
            if (containerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
                // If reached near right end, smoothly reset scroll to start (Left: 0)
                if (scrollLeft + clientWidth >= scrollWidth - 20) {
                    containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    setCurrentIndex(0);
                } else {
                    containerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
                    setCurrentIndex((prev) => (prev + 1) % documents.length);
                }
            }
        }, 3200);

        return () => clearInterval(interval);
    }, [isPaused, documents.length]);

    const handlePrev = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
            setCurrentIndex((prev) => (prev - 1 + documents.length) % documents.length);
        }
    };

    const handleNext = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
            setCurrentIndex((prev) => (prev + 1) % documents.length);
        }
    };

    // Mouse drag handlers for desktop
    const handleMouseDown = (e) => {
        if (!containerRef.current) return;
        isDraggingRef.current = true;
        startXRef.current = e.pageX - containerRef.current.offsetLeft;
        scrollLeftRef.current = containerRef.current.scrollLeft;
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        isDraggingRef.current = false;
        setIsPaused(false);
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
        setIsPaused(false);
    };

    const handleMouseMove = (e) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1.5;
        containerRef.current.scrollLeft = scrollLeftRef.current - walk;
    };

    if (!documents || documents.length === 0) return null;

    return (
        <div 
            className="transparency-carousel-wrapper" 
            style={{ position: 'relative', margin: '24px 0', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
            {/* Carousel Navigation Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Official NGO Compliance Documents
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous document"
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
                        onClick={handleNext}
                        aria-label="Next document"
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
            </div>

            {/* Scrollable Track (Left to Right) */}
            <div
                ref={containerRef}
                className="transparency-carousel-track"
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    scrollSnapType: 'x mandatory',
                    paddingBottom: '16px',
                    WebkitOverflowScrolling: 'touch',
                    cursor: isDraggingRef.current ? 'grabbing' : 'grab',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                {documents.map((doc, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                        <div
                            key={doc.id || idx}
                            className="transparency-card-item"
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '16px',
                                border: isCurrent ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                boxShadow: isCurrent ? '0 8px 24px rgba(15, 81, 50, 0.12)' : '0 2px 10px rgba(0,0,0,0.04)',
                                transition: 'all 0.3s ease',
                                boxSizing: 'border-box'
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                                        {getDocIcon(doc.iconType, 22)}
                                    </div>
                                    <span className="admin-badge admin-badge-success" style={{ fontSize: '11px', padding: '4px 10px' }}>
                                        Verified
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '4px', lineHeight: 1.3, wordBreak: 'break-word' }}>
                                    {doc.title}
                                </h3>

                                <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '10px', display: 'inline-block' }}>
                                    {doc.category}
                                </span>

                                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {doc.description}
                                </p>

                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px', fontWeight: '600' }}>
                                    {doc.urn}
                                    {doc.created_at && (
                                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '11px' }}>
                                            Uploaded: {new Date(doc.created_at).toLocaleDateString('en-IN')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1, padding: '8px 4px', fontSize: '11px', justifyContent: 'center', minHeight: '38px' }}>
                                    <Eye size={13} /> View
                                </a>
                                <a href={doc.file_url} download target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '8px 4px', fontSize: '11px', justifyContent: 'center', minHeight: '38px' }}>
                                    <Download size={13} /> Download
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
