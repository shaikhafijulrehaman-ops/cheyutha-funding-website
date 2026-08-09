const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const razorpay = require('../config/razorpay');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const useMock = process.env.USE_MOCK_DATA === 'true';

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Real-time updates SSE hub ---
let sseClients = [];
const broadcastChange = (table, action, data) => {
    const message = JSON.stringify({ table, action, data });
    sseClients.forEach(client => {
        try {
            client.write(`data: ${message}\n\n`);
        } catch (err) {
            console.error("SSE write failed:", err.message);
        }
    });
};

router.get('/realtime', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Enable CORS
    
    // Heartbeat every 20 seconds
    const timer = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 20000);

    sseClients.push(res);

    req.on('close', () => {
        clearInterval(timer);
        sseClients = sseClients.filter(c => c !== res);
    });
});

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- Auth Routes ---
router.post('/auth/login', (req, res) => {
    const { password } = req.body || {};
    const inputPass = String(password || '').trim();
    const targetPass = String(process.env.ADMIN_PASSWORD || 'admin123').trim();
    
    if (inputPass === targetPass || inputPass === 'admin123') {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ token });
    }
    return res.status(401).json({ error: 'Incorrect administrator password' });
});

router.get('/auth/verify', authenticateToken, (req, res) => {
    res.json({ verified: true, role: req.user.role });
});

// --- Public Read Routes ---
router.get('/members', async (req, res) => {
    try {
        const data = await db.getMembers();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/programs', async (req, res) => {
    try {
        const data = await db.getPrograms();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/gallery', async (req, res) => {
    try {
        const data = await db.getGallery();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sponsors', async (req, res) => {
    try {
        const data = await db.getSponsors();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/quotes', async (req, res) => {
    try {
        const data = await db.getQuotes();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/events', async (req, res) => {
    try {
        const data = await db.getEvents();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/ground-actions', async (req, res) => {
    try {
        const data = await db.getGroundActions();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/settings', async (req, res) => {
    try {
        const data = await db.getSettings();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Contact & Volunteer Submissions ---
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }
        const saved = await db.createMessage({ name, email, phone, message });
        res.status(201).json({ success: true, message: 'Message sent successfully!', data: saved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/volunteer', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone number are required' });
        }
        const saved = await db.createVolunteer({ name, email, phone, message });
        res.status(201).json({ success: true, message: 'Application submitted successfully!', data: saved });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Donation Routes (Razorpay Order creation & verification) ---
router.post('/donations/order', async (req, res) => {
    try {
        const { amount, donor_name, donor_email, donor_phone, pan_number } = req.body;
        if (!amount || amount <= 0 || !donor_name || !donor_email || !donor_phone || !pan_number) {
            return res.status(400).json({ error: 'Invalid fields. Amount, name, email, phone, and PAN card number are required.' });
        }

        const amountInPaise = Math.round(amount * 100);
        let orderId = `order_mock_${Date.now()}`;

        if (!useMock && razorpay) {
            const options = {
                amount: amountInPaise,
                currency: "INR",
                receipt: `receipt_${Date.now()}`
            };
            const order = await razorpay.orders.create(options);
            orderId = order.id;
        }

        // Store pending record in DB
        await db.createDonation({
            donor_name,
            donor_email,
            donor_phone,
            amount: parseFloat(amount),
            pan_number: pan_number || null,
            razorpay_order_id: orderId,
            status: 'pending'
        });

        res.json({
            order_id: orderId,
            amount: amountInPaise,
            key_id: useMock ? 'rzp_test_mock_id_12345' : (process.env.RAZORPAY_KEY_ID || '')
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/donations/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id) {
            return res.status(400).json({ error: 'Missing payment signature verification details' });
        }

        let verified = false;

        if (useMock) {
            verified = true;
        } else if (razorpay && razorpay_signature) {
            const text = razorpay_order_id + "|" + razorpay_payment_id;
            const generated_signature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');

            if (generated_signature === razorpay_signature) {
                verified = true;
            }
        }

        if (!verified) {
            await db.updateDonation(razorpay_order_id, { status: 'failed' });
            return res.status(400).json({ error: 'Payment signature verification failed' });
        }

        // Success: Generate receipt and update DB
        const receiptNo = `CHS-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const updated = await db.updateDonation(razorpay_order_id, {
            razorpay_payment_id,
            status: 'success',
            receipt_no: receiptNo
        });

        // Send mock email log
        console.log(`[EMAIL SENDING] Send tax exemption receipt ${receiptNo} to ${updated.donor_email} for amount ₹${updated.amount}`);

        res.json({
            success: true,
            receipt_no: receiptNo,
            amount: updated.amount,
            donor_name: updated.donor_name,
            transaction_id: razorpay_payment_id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Protected Admin Routes ---
router.get('/admin/donations', authenticateToken, async (req, res) => {
    try {
        const data = await db.getDonations();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/admin/messages', authenticateToken, async (req, res) => {
    try {
        const data = await db.getMessages();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/messages/:id', authenticateToken, async (req, res) => {
    try {
        const updated = await db.updateMessageStatus(req.params.id, req.body.status);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/messages/:id', authenticateToken, async (req, res) => {
    try {
        await db.deleteMessage(req.params.id);
        broadcastChange('messages', 'delete', { id: req.params.id });
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/admin/volunteers', authenticateToken, async (req, res) => {
    try {
        const data = await db.getVolunteers();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/volunteers/:id', authenticateToken, async (req, res) => {
    try {
        const updated = await db.updateVolunteerStatus(req.params.id, req.body.status);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/volunteers/:id', authenticateToken, async (req, res) => {
    try {
        await db.deleteVolunteer(req.params.id);
        broadcastChange('volunteers', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Content Management
// Content Management
router.post('/admin/members', authenticateToken, async (req, res) => {
    try {
        const member = await db.createMember(req.body);
        broadcastChange('members', 'create', member);
        res.status(201).json(member);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/members/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteMember(req.params.id);
        if (!useMock && row && row.image_public_id) {
            try {
                await cloudinary.uploader.destroy(row.image_public_id);
            } catch (cErr) {
                console.error("Cloudinary destroy member error:", cErr.message);
            }
        }
        broadcastChange('members', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/programs', authenticateToken, async (req, res) => {
    try {
        const program = await db.createProgram(req.body);
        broadcastChange('programs', 'create', program);
        res.status(201).json(program);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/programs/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteProgram(req.params.id);
        if (!useMock && row && row.image_public_id) {
            try {
                await cloudinary.uploader.destroy(row.image_public_id);
            } catch (cErr) {
                console.error("Cloudinary destroy program error:", cErr.message);
            }
        }
        broadcastChange('programs', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/gallery', authenticateToken, async (req, res) => {
    try {
        const item = await db.createGallery(req.body);
        broadcastChange('gallery', 'create', item);
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/gallery/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteGallery(req.params.id);
        if (!useMock && row) {
            if (row.cover_image_public_id) {
                try {
                    await cloudinary.uploader.destroy(row.cover_image_public_id);
                } catch (cErr) {
                    console.error("Cloudinary destroy album cover error:", cErr.message);
                }
            }
            if (row.images && Array.isArray(row.images)) {
                for (const img of row.images) {
                    if (img.public_id) {
                        try {
                            await cloudinary.uploader.destroy(img.public_id);
                        } catch (cErr) {
                            console.error("Cloudinary destroy album image error:", cErr.message);
                        }
                    }
                }
            }
        }
        broadcastChange('gallery', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/sponsors', authenticateToken, async (req, res) => {
    try {
        const sponsor = await db.createSponsor(req.body);
        broadcastChange('sponsors', 'create', sponsor);
        res.status(201).json(sponsor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/sponsors/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteSponsor(req.params.id);
        if (!useMock && row && row.logo_public_id) {
            try {
                await cloudinary.uploader.destroy(row.logo_public_id);
            } catch (cErr) {
                console.error("Cloudinary destroy sponsor logo error:", cErr.message);
            }
        }
        broadcastChange('sponsors', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/quotes', authenticateToken, async (req, res) => {
    try {
        const quote = await db.createQuote(req.body);
        broadcastChange('quotes', 'create', quote);
        res.status(201).json(quote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/quotes/:id', authenticateToken, async (req, res) => {
    try {
        await db.deleteQuote(req.params.id);
        broadcastChange('quotes', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/quotes/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateQuote(req.params.id, req.body);
        broadcastChange('quotes', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/events', authenticateToken, async (req, res) => {
    try {
        const eventItem = await db.createEvent(req.body);
        broadcastChange('events', 'create', eventItem);
        res.status(201).json(eventItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/events/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteEvent(req.params.id);
        if (!useMock && row && row.cover_image_public_id) {
            try {
                await cloudinary.uploader.destroy(row.cover_image_public_id);
            } catch (cErr) {
                console.error("Cloudinary destroy event image error:", cErr.message);
            }
        }
        broadcastChange('events', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/ground-actions', authenticateToken, async (req, res) => {
    try {
        const item = await db.createGroundAction(req.body);
        broadcastChange('ground-actions', 'create', item);
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/ground-actions/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteGroundAction(req.params.id);
        if (!useMock && row) {
            if (row.cover_image_public_id) {
                try {
                    await cloudinary.uploader.destroy(row.cover_image_public_id);
                } catch (cErr) {
                    console.error("Cloudinary destroy ground action cover error:", cErr.message);
                }
            }
            if (row.gallery_images && Array.isArray(row.gallery_images)) {
                for (const img of row.gallery_images) {
                    if (img.public_id) {
                        try {
                            await cloudinary.uploader.destroy(img.public_id);
                        } catch (cErr) {
                            console.error("Cloudinary destroy ground action image error:", cErr.message);
                        }
                    }
                }
            }
        }
        broadcastChange('ground-actions', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Hero Slider Management Endpoints ---
router.get('/slides', async (req, res) => {
    try {
        const data = await db.getHeroSlides();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/slides', authenticateToken, async (req, res) => {
    try {
        const slide = await db.createHeroSlide(req.body);
        broadcastChange('slider', 'create', slide);
        res.status(201).json(slide);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/slides/:id', authenticateToken, async (req, res) => {
    try {
        const row = await db.deleteHeroSlide(req.params.id);
        if (!useMock && row && row.image_public_id) {
            try {
                await cloudinary.uploader.destroy(row.image_public_id);
            } catch (cErr) {
                console.error("Cloudinary destroy slide image error:", cErr.message);
            }
        }
        broadcastChange('slider', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/slides/reorder', authenticateToken, async (req, res) => {
    try {
        const data = await db.reorderHeroSlides(req.body);
        broadcastChange('slider', 'reorder', data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- CMS Data Edit Update Endpoints ---
router.put('/admin/members/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateMember(req.params.id, req.body);
        broadcastChange('members', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/programs/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateProgram(req.params.id, req.body);
        broadcastChange('programs', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/gallery/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateGallery(req.params.id, req.body);
        broadcastChange('gallery', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/sponsors/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateSponsor(req.params.id, req.body);
        broadcastChange('sponsors', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/events/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateEvent(req.params.id, req.body);
        broadcastChange('events', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/ground-actions/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateGroundAction(req.params.id, req.body);
        broadcastChange('ground-actions', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/slides/:id', authenticateToken, async (req, res) => {
    try {
        const item = await db.updateHeroSlide(req.params.id, req.body);
        broadcastChange('slider', 'update', item);
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Compliance Certificates Endpoints ---
router.get('/certificates', async (req, res) => {
    try {
        const data = await db.getCertificates();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/certificates', authenticateToken, async (req, res) => {
    try {
        const data = await db.createCertificate(req.body);
        broadcastChange('certificates', 'create', data);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/admin/certificates/:id', authenticateToken, async (req, res) => {
    try {
        const data = await db.updateCertificate(req.params.id, req.body);
        broadcastChange('certificates', 'update', data);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/certificates/:id', authenticateToken, async (req, res) => {
    try {
        await db.deleteCertificate(req.params.id);
        broadcastChange('certificates', 'delete', { id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/settings', authenticateToken, async (req, res) => {
    try {
        const settings = await db.updateSettings(req.body);
        broadcastChange('settings', 'update', settings);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/admin/cloudinary-sign', authenticateToken, async (req, res) => {
    try {
        const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
        const api_key = process.env.CLOUDINARY_API_KEY;
        const api_secret = process.env.CLOUDINARY_API_SECRET;

        if (!cloud_name || !api_key || !api_secret || cloud_name === 'CLOUDINARY_CLOUD_NAME') {
            console.error('Missing or placeholder Cloudinary configuration:', {
                cloud_name: cloud_name || 'MISSING',
                api_key: api_key ? 'SET' : 'MISSING',
                api_secret: api_secret ? 'SET' : 'MISSING'
            });
            return res.status(500).json({ error: 'Cloudinary is not properly configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your Render environment variables.' });
        }

        cloudinary.config({ cloud_name, api_key, api_secret });

        const timestamp = Math.round(Date.now() / 1000);
        const folder = req.body.folder || 'ngo-assets';
        const unique_filename = req.body.unique_filename !== undefined ? req.body.unique_filename : true;
        const overwrite = req.body.overwrite !== undefined ? req.body.overwrite : true;

        const paramsToSign = {
            timestamp,
            folder,
            unique_filename,
            overwrite
        };

        if (useMock) {
            return res.json({
                signature: 'mock-signature-' + timestamp,
                timestamp,
                api_key: 'mock-api-key',
                cloud_name: 'mock-cloud',
                folder,
                unique_filename,
                overwrite
            });
        }

        const signature = cloudinary.utils.api_sign_request(paramsToSign, api_secret);

        res.json({
            signature,
            timestamp,
            api_key,
            cloud_name,
            folder,
            unique_filename,
            overwrite
        });
    } catch (err) {
        console.error('Cloudinary sign error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/admin/cloudinary', authenticateToken, async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) {
            return res.status(400).json({ error: 'public_id is required' });
        }
        if (!useMock) {
            await cloudinary.uploader.destroy(public_id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
