import React, { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';

export default function ImageUpload({ value, onChange, label = "Select Image File", multiple = false }) {
    const [previews, setPreviews] = useState([]);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Sync previews with database value or local files
    useEffect(() => {
        if (!value) {
            setPreviews([]);
        } else if (Array.isArray(value)) {
            setPreviews(value.map(val => typeof val === 'object' ? val.url : val));
        } else {
            setPreviews([typeof value === 'object' ? value.url : value]);
        }
    }, [value]);

    const processFiles = (filesList) => {
        setError('');
        const validFiles = [];
        const localPreviews = [];

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB limit

        for (let i = 0; i < filesList.length; i++) {
            const file = filesList[i];
            if (!allowedTypes.includes(file.type)) {
                setError('Only JPG, JPEG, PNG, WEBP, and PDF formats are allowed.');
                return;
            }
            if (file.size > maxSize) {
                setError('File size must not exceed 10MB.');
                return;
            }
            validFiles.push(file);
            localPreviews.push(URL.createObjectURL(file));
        }

        if (multiple) {
            onChange(validFiles);
            setPreviews((prev) => [...prev, ...localPreviews]);
        } else {
            onChange(validFiles[0]);
            setPreviews(localPreviews);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (index) => {
        setPreviews((prev) => prev.filter((_, idx) => idx !== index));
        if (multiple) {
            onChange((prev) => {
                const arr = Array.isArray(prev) ? prev : [];
                return arr.filter((_, idx) => idx !== index);
            });
        } else {
            onChange(null);
        }
    };

    const clearSelection = () => {
        setPreviews([]);
        setError('');
        onChange(multiple ? [] : null);
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                {label} {multiple && "(Supports Multiple Selection)"}
            </label>

            {error && (
                <div style={{ color: '#b91c1c', backgroundColor: '#fee2e2', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', fontSize: '12px', marginBottom: '10px', fontWeight: '500' }}>
                    {error}
                </div>
            )}

            {previews.length === 0 ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        border: dragOver ? '2px dashed var(--accent)' : '2px dashed #cbd5e1',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '32px',
                        textAlign: 'center',
                        backgroundColor: dragOver ? 'var(--accent-light)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'var(--transition-smooth)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}
                >
                    <Upload size={36} color={dragOver ? 'var(--accent)' : 'var(--text-secondary)'} />
                    <div>
                        <strong style={{ display: 'block', fontSize: '15px', color: dragOver ? 'var(--accent-dark)' : 'var(--text-primary)' }}>
                            Choose Asset file
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Drag & Drop file here, or click to browse (Max 10MB)
                        </span>
                    </div>
                </div>
            ) : (
                <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid #cbd5e1', borderRadius: 'var(--border-radius-md)', padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                        {previews.map((src, index) => {
                            const isPdf = typeof src === 'string' && src.toLowerCase().includes('.pdf');
                            return (
                                <div key={index} style={{ position: 'relative', height: '80px', width: '80px', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                                    {isPdf ? (
                                        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-secondary)', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                            📄 PDF Doc
                                        </div>
                                    ) : (
                                        <img src={src} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                    )}
                                    <button 
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        style={{ position: 'absolute', top: '4px', right: '4px', height: '18px', width: '18px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', zIndex: 10 }}
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444', borderColor: '#ef4444' }}
                            onClick={clearSelection}
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            )}

            <input 
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                multiple={multiple}
                onChange={handleFileChange}
            />
        </div>
    );
}
