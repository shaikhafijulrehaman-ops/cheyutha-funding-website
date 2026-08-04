import React, { useState, useEffect } from 'react';
import { RefreshCw, Image } from 'lucide-react';

const imgCache = new Set(); // Simple memory cache for loaded assets

export default function SmartImage({ src, alt, className = '', style = {} }) {
    const [loading, setLoading] = useState(!imgCache.has(src));
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        if (!src) {
            setError(true);
            setLoading(false);
            return;
        }

        if (imgCache.has(src)) {
            setLoading(false);
            setError(false);
            return;
        }

        setLoading(true);
        setError(false);

        const img = new window.Image();
        img.src = src;
        img.onload = () => {
            imgCache.add(src);
            setLoading(false);
            setError(false);
        };
        img.onerror = () => {
            setLoading(false);
            setError(true);
        };
    }, [src, retryCount]);

    const handleRetry = (e) => {
        e.stopPropagation();
        setRetryCount(prev => prev + 1);
    };

    if (error) {
        return (
            <div 
                className={`${className}`} 
                style={{ 
                    ...style, 
                    backgroundColor: '#f1f5f9', 
                    color: '#94a3b8', 
                    display: 'flex',
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px', 
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 'inherit',
                    minHeight: style.height || '180px'
                }}
            >
                <Image size={32} strokeWidth={1.5} />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Image unavailable</span>
                <button 
                    type="button"
                    onClick={handleRetry} 
                    style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    <RefreshCw size={10} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', width: style.width || '100%', height: style.height || '100%', borderRadius: 'inherit', overflow: 'hidden' }}>
            {loading && (
                <div 
                    className="skeleton" 
                    style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        zIndex: 1,
                        borderRadius: 'inherit'
                    }} 
                />
            )}
            <img 
                src={src} 
                alt={alt || "NGO Visual"} 
                className={className}
                loading="lazy"
                style={{ 
                    ...style, 
                    opacity: loading ? 0 : 1, 
                    transition: 'opacity 0.2s ease-in-out',
                    display: 'block' 
                }} 
            />
        </div>
    );
}
