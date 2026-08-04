import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toasts Floating Stack */}
            <div 
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 200000, // Make sure it floats above modal slides and overlays
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxWidth: '400px',
                    width: 'calc(100% - 48px)',
                    pointerEvents: 'none'
                }}
            >
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    const isError = toast.type === 'error';
                    const borderColor = isSuccess ? '#10b981' : isError ? '#ef4444' : '#3b82f6';
                    const Icon = isSuccess ? CheckCircle : isError ? XCircle : Info;

                    return (
                        <div
                            key={toast.id}
                            className="toast-item animate-toast-slide"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px 20px',
                                backgroundColor: 'rgba(26, 38, 30, 0.95)', // Deep dark forest-green backing
                                backdropFilter: 'blur(8px)',
                                color: '#f3f4f6',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${borderColor}`,
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderLeftWidth: '4px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                                pointerEvents: 'auto',
                                transition: 'all 0.3s ease',
                                transform: 'translateY(0)',
                                opacity: 1
                            }}
                        >
                            <Icon size={20} color={borderColor} style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, flexGrow: 1, lineHeight: 1.4 }}>
                                {toast.message}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px',
                                    transition: 'color 0.2s',
                                    marginLeft: '8px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
