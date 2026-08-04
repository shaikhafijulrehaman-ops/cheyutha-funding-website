const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return '/api';
    }
    return 'http://localhost:5000/api';
};

export const API_URL = getApiUrl();

const headers = (token) => {
    const h = { 'Content-Type': 'application/json' };
    if (token) {
        h['Authorization'] = `Bearer ${token}`;
    }
    return h;
};

export const api = {
    // Public Reads
    getMembers: () => fetch(`${API_URL}/members`).then(res => res.json()),
    getPrograms: () => fetch(`${API_URL}/programs`).then(res => res.json()),
    getGallery: () => fetch(`${API_URL}/gallery`).then(res => res.json()),
    getSponsors: () => fetch(`${API_URL}/sponsors`).then(res => res.json()),
    getQuotes: () => fetch(`${API_URL}/quotes`).then(res => res.json()),
    getEvents: () => fetch(`${API_URL}/events`).then(res => res.json()),
    getGroundActions: () => fetch(`${API_URL}/ground-actions`).then(res => res.json()),
    getSettings: () => fetch(`${API_URL}/settings`).then(res => res.json()),

    // Contact & Volunteers
    submitContact: (data) => fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    submitVolunteer: (data) => fetch(`${API_URL}/volunteer`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    // Donations & Razorpay
    createDonationOrder: (data) => fetch(`${API_URL}/donations/order`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    verifyDonation: (data) => fetch(`${API_URL}/donations/verify`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    // Admin Auth
    login: (password) => fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ password })
    }).then(async res => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'Failed to authenticate');
        return body;
    }),

    verifyToken: (token) => fetch(`${API_URL}/auth/verify`, {
        headers: headers(token)
    }).then(res => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
    }),

    // Admin Content Management
    getDonations: (token) => fetch(`${API_URL}/admin/donations`, { headers: headers(token) }).then(res => res.json()),
    getMessages: (token) => fetch(`${API_URL}/admin/messages`, { headers: headers(token) }).then(res => res.json()),
    updateMessage: (id, status, token) => fetch(`${API_URL}/admin/messages/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({ status })
    }).then(res => res.json()),
    deleteMessage: (id, token) => fetch(`${API_URL}/admin/messages/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),
    
    getVolunteers: (token) => fetch(`${API_URL}/admin/volunteers`, { headers: headers(token) }).then(res => res.json()),
    updateVolunteer: (id, status, token) => fetch(`${API_URL}/admin/volunteers/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({ status })
    }).then(res => res.json()),

    createMember: (data, token) => fetch(`${API_URL}/admin/members`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteMember: (id, token) => fetch(`${API_URL}/admin/members/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    createProgram: (data, token) => fetch(`${API_URL}/admin/programs`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteProgram: (id, token) => fetch(`${API_URL}/admin/programs/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    createGallery: (data, token) => fetch(`${API_URL}/admin/gallery`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteGallery: (id, token) => fetch(`${API_URL}/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    createSponsor: (data, token) => fetch(`${API_URL}/admin/sponsors`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteSponsor: (id, token) => fetch(`${API_URL}/admin/sponsors/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    createQuote: (data, token) => fetch(`${API_URL}/admin/quotes`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteQuote: (id, token) => fetch(`${API_URL}/admin/quotes/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    createEvent: (data, token) => fetch(`${API_URL}/admin/events`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteEvent: (id, token) => fetch(`${API_URL}/admin/events/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    createGroundAction: (data, token) => fetch(`${API_URL}/admin/ground-actions`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteGroundAction: (id, token) => fetch(`${API_URL}/admin/ground-actions/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    updateSettings: (data, token) => fetch(`${API_URL}/admin/settings`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    getSlides: () => fetch(`${API_URL}/slides`).then(res => res.json()),
    createSlide: (data, token) => fetch(`${API_URL}/admin/slides`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteSlide: (id, token) => fetch(`${API_URL}/admin/slides/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),
    reorderSlides: (data, token) => fetch(`${API_URL}/admin/slides/reorder`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    updateMember: (id, data, token) => fetch(`${API_URL}/admin/members/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateProgram: (id, data, token) => fetch(`${API_URL}/admin/programs/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateGallery: (id, data, token) => fetch(`${API_URL}/admin/gallery/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateSponsor: (id, data, token) => fetch(`${API_URL}/admin/sponsors/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateEvent: (id, data, token) => fetch(`${API_URL}/admin/events/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateGroundAction: (id, data, token) => fetch(`${API_URL}/admin/ground-actions/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateSlide: (id, data, token) => fetch(`${API_URL}/admin/slides/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),

    getCertificates: () => fetch(`${API_URL}/certificates`).then(res => res.json()),
    createCertificate: (data, token) => fetch(`${API_URL}/admin/certificates`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    updateCertificate: (id, data, token) => fetch(`${API_URL}/admin/certificates/${id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(data)
    }).then(res => res.json()),
    deleteCertificate: (id, token) => fetch(`${API_URL}/admin/certificates/${id}`, {
        method: 'DELETE',
        headers: headers(token)
    }).then(res => res.json()),

    uploadImage: async (file, token, options = {}) => {
        // 1. Fetch secure signature from backend
        const signRes = await fetch(`${API_URL}/admin/cloudinary-sign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                folder: options.folder || 'ngo-assets',
                unique_filename: options.unique_filename !== undefined ? options.unique_filename : true,
                overwrite: options.overwrite !== undefined ? options.overwrite : true
            })
        });
        const signData = await signRes.json();
        if (!signRes.ok || signData.error) {
            throw new Error(signData.error || 'Failed to sign upload parameters');
        }

        // Mock mode client fallback
        if (signData.cloud_name === 'mock-cloud') {
            if (import.meta.env.DEV) {
                console.log('[Cloudinary Client Upload] MOCK MODE: returning mock assets');
            }
            return {
                url: `/uploads/${file.name || 'mock-file.jpg'}`,
                public_id: `mock-${Date.now()}`
            };
        }

        // 2. Perform direct upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signData.api_key);
        formData.append('timestamp', signData.timestamp);
        formData.append('signature', signData.signature);
        formData.append('folder', signData.folder);
        formData.append('unique_filename', signData.unique_filename ? 'true' : 'false');
        formData.append('overwrite', signData.overwrite ? 'true' : 'false');

        if (import.meta.env.DEV) {
            console.log('[Cloudinary Client Upload] Parameters:', {
                api_key: signData.api_key,
                timestamp: signData.timestamp,
                signature: signData.signature,
                folder: signData.folder,
                unique_filename: signData.unique_filename,
                overwrite: signData.overwrite
            });
        }

        const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/auto/upload`;
        const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
            throw new Error(uploadData.error?.message || 'Direct Cloudinary upload failed');
        }

        if (import.meta.env.DEV) {
            console.log('[Cloudinary Client Upload] Response:', uploadData);
        }

        return {
            url: uploadData.secure_url,
            public_id: uploadData.public_id
        };
    },

    deleteCloudinaryImage: (public_id, token) => {
        return fetch(`${API_URL}/admin/cloudinary`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ public_id })
        }).then(res => {
            if (!res.ok) return res.json().then(e => { throw new Error(e.error || 'Delete failed') });
            return res.json();
        });
    }
};
