import React, { useState } from 'react';
import { X, ShieldCheck, Heart, Download, CheckCircle, Mail, Phone, User, FileText } from 'lucide-react';
import { api } from '../api';
import logoImg from '../assets/logo.jpeg';

export default function DonateModal({ isOpen, onClose }) {
    const [amount, setAmount] = useState(1000);
    const [isCustom, setIsCustom] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [pan, setPan] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentResult, setPaymentResult] = useState(null); // stores receipt details on success

    if (!isOpen) return null;

    const presetAmounts = [500, 1000, 2500, 5000, 10000];

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePresetClick = (val) => {
        setAmount(val);
        setIsCustom(false);
    };

    const handleCustomChange = (e) => {
        const val = parseFloat(e.target.value);
        setAmount(isNaN(val) ? 0 : val);
        setIsCustom(true);
    };

    const handleDonateSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!amount || amount <= 0) {
            setError('Please enter a valid donation amount.');
            return;
        }
        if (!name || !email || !phone || !pan) {
            setError('Please fill in your name, email, phone number, and PAN card number.');
            return;
        }

        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(pan)) {
            setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F).');
            return;
        }

        setLoading(true);

        try {
            // 1. Load Razorpay Script dynamically
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                throw new Error('Razorpay SDK failed to load. Are you connected to the internet?');
            }

            // 2. Create order on Express server
            const orderRes = await api.createDonationOrder({
                amount,
                donor_name: name,
                donor_email: email,
                donor_phone: phone,
                pan_number: pan || null
            });

            if (orderRes.error) {
                throw new Error(orderRes.error);
            }

            const { order_id, key_id } = orderRes;

            // 3. Configure Razorpay modal options
            const options = {
                key: key_id,
                amount: orderRes.amount,
                currency: "INR",
                name: "Cheyutha Helping Society",
                description: "Tax-exempt Donation (80G Benefit)",
                image: logoImg,
                order_id: order_id,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        // 4. Verify payment signature on backend
                        const verification = await api.verifyDonation({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature || 'mock_signature'
                        });

                        if (verification.error) {
                            throw new Error(verification.error);
                        }

                        // Success! Update UI
                        setPaymentResult(verification);
                    } catch (err) {
                        setError(err.message);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: name,
                    email: email,
                    contact: phone
                },
                notes: {
                    pan: pan || 'Not Provided'
                },
                theme: {
                    color: "#0f5132"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError(err.message || 'Something went wrong while initiating checkout.');
            setLoading(false);
        }
    };

    return (
        <div className="lightbox-modal flex-center" style={{ backgroundColor: 'rgba(9, 51, 30, 0.45)', backdropFilter: 'blur(8px)' }}>
            <div className="donate-form-card" style={{ width: '100%', maxWidth: '500px', position: 'relative', overflowY: 'auto', maxHeight: '90vh' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                    <X size={24} />
                </button>

                {!paymentResult ? (
                    // Donation Form Step
                    <form onSubmit={handleDonateSubmit}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div className="trust-card-icon" style={{ margin: '0 auto 12px auto' }}>
                                <Heart size={28} fill="var(--accent)" color="var(--accent)" />
                            </div>
                            <h3>Support Our Mission</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Your support funds education, community health camps, and rural welfare.
                            </p>
                        </div>

                        {error && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--border-radius-sm)', fontSize: '13px', marginBottom: '16px', fontWeight: '500' }}>
                                {error}
                            </div>
                        )}

                        {/* Amount presets */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                                Select Amount (INR)
                            </label>
                            <div className="preset-amounts-grid">
                                {presetAmounts.map((val) => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={`preset-btn ${amount === val && !isCustom ? 'active' : ''}`}
                                        onClick={() => handlePresetClick(val)}
                                    >
                                        ₹{val}
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    placeholder="Other"
                                    className="form-control"
                                    style={{ textAlign: 'center', fontWeight: '700', padding: '10px' }}
                                    value={isCustom ? amount : ''}
                                    onChange={handleCustomChange}
                                />
                            </div>
                        </div>

                        {/* Donor Details */}
                        <div className="form-group">
                            <label><User size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter your full name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><Mail size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="name@domain.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><Phone size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="10-digit mobile number"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label><FileText size={13} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> PAN Card Number (Required - For Section 80G Tax Exemption)</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                required
                                style={{ textTransform: 'uppercase' }}
                                value={pan}
                                onChange={(e) => setPan(e.target.value.toUpperCase())}
                            />
                        </div>

                        <div className="tax-badge-info">
                            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                            <span>Donations are 100% secure. You will receive an immediate tax exemption receipt under Section 80G.</span>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary donate-submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Processing Payment...' : `Donate ₹${amount.toLocaleString('en-IN')}`}
                        </button>
                    </form>
                ) : (
                    // Successful Transaction Page
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ color: '#0f5132', marginBottom: '16px' }}>
                            <CheckCircle size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Thank You for Your Support!</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px' }}>
                            Dear <strong>{paymentResult.donor_name}</strong>, your donation of <strong>₹{parseFloat(paymentResult.amount).toLocaleString('en-IN')}</strong> was received successfully.
                        </p>

                        <div style={{ backgroundColor: 'var(--bg-main)', border: '1px solid #e2e8f0', borderRadius: 'var(--border-radius-md)', padding: '20px', textAlign: 'left', marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
                                Transaction Receipt details
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Receipt No:</span>
                                <strong>{paymentResult.receipt_no}</strong>

                                <span style={{ color: 'var(--text-secondary)' }}>Transaction ID:</span>
                                <strong>{paymentResult.transaction_id}</strong>

                                <span style={{ color: 'var(--text-secondary)' }}>Tax Status:</span>
                                <strong style={{ color: '#0f5132' }}>80G Exemption Eligible</strong>

                                {pan && (
                                    <>
                                        <span style={{ color: 'var(--text-secondary)' }}>PAN Number:</span>
                                        <strong>{pan}</strong>
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setPaymentResult(null);
                                onClose();
                            }}
                            className="btn btn-primary"
                            style={{ width: '100%', gap: '8px' }}
                        >
                            <Download size={16} />
                            Download Receipt & Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
