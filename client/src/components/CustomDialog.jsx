import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

let dialogShowFn = null;

export const confirmDialog = (title, message) => {
    return new Promise((resolve) => {
        if (dialogShowFn) {
            dialogShowFn({ title, message, type: 'confirm', resolve });
        } else {
            resolve(window.confirm(message));
        }
    });
};

export const alertDialog = (title, message, isSuccess = true) => {
    return new Promise((resolve) => {
        if (dialogShowFn) {
            dialogShowFn({ title, message, type: isSuccess ? 'success' : 'alert', resolve });
        } else {
            window.alert(message);
            resolve();
        }
    });
};

export default function CustomDialogProvider({ children }) {
    const [dialog, setDialog] = useState(null);

    useEffect(() => {
        dialogShowFn = setDialog;
        return () => {
            dialogShowFn = null;
        };
    }, []);

    const handleClose = (result) => {
        if (dialog) {
            dialog.resolve(result);
            setDialog(null);
        }
    };

    return (
        <>
            {children}
            {dialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    fontFamily: 'inherit'
                }}>
                    {/* Backdrop Overlay */}
                    <div 
                        onClick={() => handleClose(false)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.45)',
                            backdropFilter: 'blur(8px)',
                            animation: 'fadeIn 0.2s ease-out'
                        }}
                    />
                    
                    {/* Modal Box */}
                    <div style={{
                        position: 'relative',
                        backgroundColor: '#ffffff',
                        width: '100%',
                        maxWidth: '440px',
                        borderRadius: '20px',
                        padding: '28px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                        animation: 'dialogScaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {/* Title Row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                backgroundColor: dialog.type === 'confirm' ? '#fee2e2' : dialog.type === 'success' ? '#d1fae5' : '#fef3c7',
                                color: dialog.type === 'confirm' ? '#ef4444' : dialog.type === 'success' ? '#10b981' : '#d97706'
                            }}>
                                {dialog.type === 'confirm' ? <ShieldAlert size={24} /> : dialog.type === 'success' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '24px' }}>
                                    {dialog.title}
                                </h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: '20px' }}>
                                    {dialog.message}
                                </p>
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                            {dialog.type === 'confirm' ? (
                                <>
                                    <button 
                                        type="button"
                                        onClick={() => handleClose(false)} 
                                        className="btn btn-secondary"
                                        style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '10px', fontWeight: '600' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleClose(true)} 
                                        className="btn btn-primary"
                                        style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '10px', fontWeight: '600', backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => handleClose(true)} 
                                    className="btn btn-primary"
                                    style={{ padding: '10px 24px', fontSize: '13px', borderRadius: '10px', fontWeight: '600' }}
                                >
                                    Okay
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
