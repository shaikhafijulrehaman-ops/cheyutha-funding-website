const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const useMock = process.env.USE_MOCK_DATA === 'true';
let supabase = null;

if (!useMock) {
    supabase = createClient(
        process.env.SUPABASE_URL || '',
        process.env.SUPABASE_KEY || ''
    );
}

// Local mock database file path
const mockDbPath = path.join(__dirname, '../../mock_db.json');

// Helper to read mock DB
const readMockDb = () => {
    if (!fs.existsSync(mockDbPath)) {
        // Initialize with completely clean state (empty states)
        const initialData = {
            donations: [],
            community_members: [],
            programs: [],
            gallery: [],
            sponsors: [],
            quotes: [],
            news: [],
            events: [],
            ground_actions: [],
            contact_messages: [],
            volunteers: [],
            website_settings: {
                organization_name: "Cheyutha Helping Society",
                phone: "",
                email: "",
                address: "",
                gmaps_link: "",
                social_facebook: "",
                social_twitter: "",
                social_instagram: "",
                meta_title: "Cheyutha Helping Society | Trusted Legal NGO in Andhra Pradesh",
                meta_description: "Cheyutha Helping Society is a registered NGO under section 80G & 12A.",
                footer_text: "© 2026 Cheyutha Helping Society. All rights reserved. Registered under AP Societies Registration Act, 2001 (Reg No: 250/2025)."
            }
        };
        fs.writeFileSync(mockDbPath, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(mockDbPath, 'utf8'));
};

const writeMockDb = (data) => {
    fs.writeFileSync(mockDbPath, JSON.stringify(data, null, 2));
};

// Strip frontend-only fields that don't exist in the database
const stripLocalFields = (obj) => {
    const clean = { ...obj };
    delete clean.localFile;
    delete clean.localCover;
    delete clean.localImages;
    return clean;
};

const db = {
    // 1. Donations
    getDonations: async () => {
        if (useMock) {
            return readMockDb().donations;
        }
        const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    createDonation: async (donation) => {
        if (useMock) {
            const data = readMockDb();
            const newDonation = { id: `don-${Date.now()}`, created_at: new Date().toISOString(), ...donation };
            data.donations.push(newDonation);
            writeMockDb(data);
            return newDonation;
        }
        const { data, error } = await supabase.from('donations').insert([donation]).select();
        if (error) throw error;
        return data[0];
    },
    updateDonation: async (orderId, updates) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.donations.findIndex(d => d.razorpay_order_id === orderId);
            if (idx !== -1) {
                data.donations[idx] = { ...data.donations[idx], ...updates };
                writeMockDb(data);
                return data.donations[idx];
            }
            return null;
        }
        const { data, error } = await supabase.from('donations').update(updates).eq('razorpay_order_id', orderId).select();
        if (error) throw error;
        return data[0];
    },

    // 2. Community Members
    getMembers: async () => {
        if (useMock) {
            return readMockDb().community_members.sort((a, b) => a.sort_order - b.sort_order);
        }
        const { data, error } = await supabase.from('community_members').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        // Map DB 'responsibility' column back to frontend 'department'
        return (data || []).map(m => ({ ...m, department: m.responsibility }));
    },
    createMember: async (member) => {
        if (useMock) {
            const data = readMockDb();
            const newMember = { id: `mem-${Date.now()}`, created_at: new Date().toISOString(), ...member };
            data.community_members.push(newMember);
            writeMockDb(data);
            return newMember;
        }
        // Map frontend fields to actual DB columns
        const dbMember = { ...member };
        if (dbMember.department) {
            dbMember.responsibility = dbMember.department;
            delete dbMember.department;
        }
        delete dbMember.localFile;
        const { data, error } = await supabase.from('community_members').insert([dbMember]).select();
        if (error) throw error;
        // Map back for frontend
        const result = data[0];
        if (result) result.department = result.responsibility;
        return result;
    },
    deleteMember: async (id) => {
        if (useMock) {
            const data = readMockDb();
            const member = data.community_members.find(m => m.id === id);
            data.community_members = data.community_members.filter(m => m.id !== id);
            writeMockDb(data);
            return member || true;
        }
        // First retrieve row to get image_public_id for Cloudinary deletion
        const { data: row } = await supabase.from('community_members').select('image_public_id').eq('id', id).single();
        const { error } = await supabase.from('community_members').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },

    // 3. Programs
    getPrograms: async () => {
        if (useMock) {
            return readMockDb().programs.sort((a, b) => a.sort_order - b.sort_order);
        }
        const { data, error } = await supabase.from('programs').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    },
    createProgram: async (program) => {
        if (useMock) {
            const data = readMockDb();
            const newProg = { id: `prog-${Date.now()}`, created_at: new Date().toISOString(), ...program };
            data.programs.push(newProg);
            writeMockDb(data);
            return newProg;
        }
        const { data, error } = await supabase.from('programs').insert([stripLocalFields(program)]).select();
        if (error) throw error;
        return data[0];
    },
    deleteProgram: async (id) => {
        if (useMock) {
            const data = readMockDb();
            const prog = data.programs.find(p => p.id === id);
            data.programs = data.programs.filter(p => p.id !== id);
            writeMockDb(data);
            return prog || true;
        }
        const { data: row } = await supabase.from('programs').select('image_public_id').eq('id', id).single();
        const { error } = await supabase.from('programs').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },

    // 4. Gallery Albums
    getGallery: async () => {
        if (useMock) {
            return readMockDb().gallery;
        }
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        // Map DB 'caption' column back to frontend 'description'
        return (data || []).map(g => ({ ...g, description: g.caption }));
    },
    createGallery: async (album) => {
        if (useMock) {
            const data = readMockDb();
            const newAlbum = { id: `gal-${Date.now()}`, created_at: new Date().toISOString(), ...album };
            data.gallery.push(newAlbum);
            writeMockDb(data);
            return newAlbum;
        }
        // Map frontend fields to actual DB columns
        const dbAlbum = { ...album };
        if (dbAlbum.description !== undefined) {
            dbAlbum.caption = dbAlbum.description;
            delete dbAlbum.description;
        }
        // gallery table has image_url NOT NULL — use cover_image as fallback
        if (!dbAlbum.image_url) {
            dbAlbum.image_url = dbAlbum.cover_image || 'https://placehold.co/400';
        }
        delete dbAlbum.localCover;
        delete dbAlbum.localImages;
        const { data, error } = await supabase.from('gallery').insert([dbAlbum]).select();
        if (error) throw error;
        // Map back for frontend
        const result = data[0];
        if (result) result.description = result.caption;
        return result;
    },
    deleteGallery: async (id) => {
        if (useMock) {
            const data = readMockDb();
            const gal = data.gallery.find(g => g.id === id);
            data.gallery = data.gallery.filter(g => g.id !== id);
            writeMockDb(data);
            return gal || true;
        }
        const { data: row } = await supabase.from('gallery').select('cover_image_public_id, images').eq('id', id).single();
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },

    // 5. Sponsors
    getSponsors: async () => {
        if (useMock) {
            return readMockDb().sponsors.sort((a, b) => a.sort_order - b.sort_order);
        }
        const { data, error } = await supabase.from('sponsors').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    },
    createSponsor: async (sponsor) => {
        if (useMock) {
            const data = readMockDb();
            const newSpon = { id: `spon-${Date.now()}`, created_at: new Date().toISOString(), ...sponsor };
            data.sponsors.push(newSpon);
            writeMockDb(data);
            return newSpon;
        }
        const { data, error } = await supabase.from('sponsors').insert([stripLocalFields(sponsor)]).select();
        if (error) throw error;
        return data[0];
    },
    deleteSponsor: async (id) => {
        if (useMock) {
            const data = readMockDb();
            const spon = data.sponsors.find(s => s.id === id);
            data.sponsors = data.sponsors.filter(s => s.id !== id);
            writeMockDb(data);
            return spon || true;
        }
        const { data: row } = await supabase.from('sponsors').select('logo_public_id').eq('id', id).single();
        const { error } = await supabase.from('sponsors').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },

    // 6. Quotes
    getQuotes: async () => {
        if (useMock) {
            return readMockDb().quotes;
        }
        const { data, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    createQuote: async (quote) => {
        if (useMock) {
            const data = readMockDb();
            const newQuote = { id: `q-${Date.now()}`, created_at: new Date().toISOString(), ...quote };
            data.quotes.push(newQuote);
            writeMockDb(data);
            return newQuote;
        }
        const { data, error } = await supabase.from('quotes').insert([quote]).select();
        if (error) throw error;
        return data[0];
    },
    deleteQuote: async (id) => {
        if (useMock) {
            const data = readMockDb();
            data.quotes = data.quotes.filter(q => q.id !== id);
            writeMockDb(data);
            return true;
        }
        const { error } = await supabase.from('quotes').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // 7. News & Events (Mapped to both 'news' and 'events' tables)
    getEvents: async () => {
        if (useMock) {
            const db = readMockDb();
            const combined = [];
            if (db.news) combined.push(...db.news.map(n => ({ ...n, type: 'news' })));
            if (db.events) combined.push(...db.events.map(e => ({ ...e, type: 'event' })));
            return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // Fetch from both tables
        const { data: news, error: newsErr } = await supabase.from('news').select('*');
        const { data: events, error: eventsErr } = await supabase.from('events').select('*');
        
        if (newsErr) throw newsErr;
        if (eventsErr) throw eventsErr;

        const mappedNews = news.map(n => ({
            id: n.id,
            title: n.title,
            content: n.content,
            type: 'news',
            date: n.published_date,
            image_url: n.cover_image,
            image_public_id: n.cover_image_public_id,
            created_at: n.created_at
        }));

        const mappedEvents = events.map(e => ({
            id: e.id,
            title: e.title,
            content: e.short_description,
            description: e.full_description,
            type: 'event',
            date: e.event_date,
            time: e.event_time,
            location: e.location,
            category: e.category,
            status: e.status,
            image_url: e.cover_image,
            image_public_id: e.cover_image_public_id,
            created_at: e.created_at
        }));

        const combined = [...mappedNews, ...mappedEvents];
        // Sort newest first
        return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    createEvent: async (eventItem) => {
        if (useMock) {
            const data = readMockDb();
            const uniqueId = `evt-${Date.now()}`;
            const newItem = { id: uniqueId, created_at: new Date().toISOString(), ...eventItem };
            if (eventItem.type === 'news') {
                if (!data.news) data.news = [];
                data.news.push(newItem);
            } else {
                if (!data.events) data.events = [];
                data.events.push(newItem);
            }
            writeMockDb(data);
            return newItem;
        }

        if (eventItem.type === 'news') {
            const newsObj = {
                title: eventItem.title,
                content: eventItem.content,
                published_date: eventItem.date || new Date().toISOString().split('T')[0],
                cover_image: eventItem.image_url,
                cover_image_public_id: eventItem.image_public_id
            };
            const { data, error } = await supabase.from('news').insert([newsObj]).select();
            if (error) throw error;
            return { ...data[0], type: 'news', date: data[0].published_date, image_url: data[0].cover_image };
        } else {
            const eventObj = {
                title: eventItem.title,
                short_description: eventItem.content || '',
                full_description: eventItem.description || '',
                event_date: eventItem.date,
                event_time: eventItem.time || '10:00 AM',
                location: eventItem.location || '',
                category: eventItem.category || 'General',
                status: eventItem.status || 'Planned',
                cover_image: eventItem.image_url,
                cover_image_public_id: eventItem.image_public_id
            };
            const { data, error } = await supabase.from('events').insert([eventObj]).select();
            if (error) throw error;
            return { 
                ...data[0], 
                type: 'event', 
                date: data[0].event_date, 
                time: data[0].event_time, 
                content: data[0].short_description, 
                description: data[0].full_description, 
                image_url: data[0].cover_image 
            };
        }
    },
    deleteEvent: async (id) => {
        if (useMock) {
            const data = readMockDb();
            let item = null;
            if (data.news) {
                item = data.news.find(n => n.id === id);
                data.news = data.news.filter(n => n.id !== id);
            }
            if (!item && data.events) {
                item = data.events.find(e => e.id === id);
                data.events = data.events.filter(e => e.id !== id);
            }
            writeMockDb(data);
            return item || true;
        }

        // Try deleting from news first
        const { data: newsRow } = await supabase.from('news').select('cover_image_public_id').eq('id', id).single();
        if (newsRow) {
            const { error } = await supabase.from('news').delete().eq('id', id);
            if (error) throw error;
            return newsRow;
        }

        // Try deleting from events
        const { data: eventRow } = await supabase.from('events').select('cover_image_public_id').eq('id', id).single();
        if (eventRow) {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            return eventRow;
        }

        return true;
    },

    // 8. Contact Messages
    getMessages: async () => {
        if (useMock) {
            return readMockDb().contact_messages;
        }
        const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    createMessage: async (msg) => {
        if (useMock) {
            const data = readMockDb();
            const newMsg = { id: `msg-${Date.now()}`, created_at: new Date().toISOString(), status: 'unread', ...msg };
            data.contact_messages.push(newMsg);
            writeMockDb(data);
            return newMsg;
        }
        const { data, error } = await supabase.from('contact_messages').insert([msg]).select();
        if (error) throw error;
        return data[0];
    },
    updateMessageStatus: async (id, status) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.contact_messages.findIndex(m => m.id === id);
            if (idx !== -1) {
                data.contact_messages[idx].status = status;
                writeMockDb(data);
                return data.contact_messages[idx];
            }
            return null;
        }
        const { data, error } = await supabase.from('contact_messages').update({ status }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },
    deleteMessage: async (id) => {
        if (useMock) {
            const data = readMockDb();
            const msg = data.contact_messages.find(m => m.id === id);
            data.contact_messages = data.contact_messages.filter(m => m.id !== id);
            writeMockDb(data);
            return msg || true;
        }
        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    // 9. Volunteers
    getVolunteers: async () => {
        if (useMock) {
            return readMockDb().volunteers;
        }
        const { data, error } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    createVolunteer: async (vol) => {
        if (useMock) {
            const data = readMockDb();
            const newVol = { id: `vol-${Date.now()}`, created_at: new Date().toISOString(), status: 'pending', ...vol };
            data.volunteers.push(newVol);
            writeMockDb(data);
            return newVol;
        }
        const { data, error } = await supabase.from('volunteers').insert([vol]).select();
        if (error) throw error;
        return data[0];
    },
    updateVolunteerStatus: async (id, status) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.volunteers.findIndex(v => v.id === id);
            if (idx !== -1) {
                data.volunteers[idx].status = status;
                writeMockDb(data);
                return data.volunteers[idx];
            }
            return null;
        }
        const { data, error } = await supabase.from('volunteers').update({ status }).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    // 10. Website Settings
    getSettings: async () => {
        if (useMock) {
            return readMockDb().website_settings;
        }
        const { data, error } = await supabase.from('website_settings').select('*');
        if (error) throw error;
        const settings = {};
        data.forEach(row => {
            // Unpack scalar val wrapper
            settings[row.key] = row.value && typeof row.value === 'object' && 'val' in row.value ? row.value.val : row.value;
        });
        return settings;
    },
    updateSettings: async (updates) => {
        if (useMock) {
            const data = readMockDb();
            data.website_settings = { ...data.website_settings, ...updates };
            writeMockDb(data);
            return data.website_settings;
        }
        for (const [key, value] of Object.entries(updates)) {
            const { error } = await supabase
                .from('website_settings')
                .upsert({ key, value: { val: value }, updated_at: new Date().toISOString() });
            if (error) throw error;
        }
        return updates;
    },

    // 11. Ground Actions
    getGroundActions: async () => {
        if (useMock) {
            const data = readMockDb();
            if (!data.ground_actions) {
                data.ground_actions = [];
                writeMockDb(data);
            }
            return data.ground_actions;
        }
        const { data, error } = await supabase.from('ground_actions').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data;
    },
    createGroundAction: async (item) => {
        if (useMock) {
            const data = readMockDb();
            if (!data.ground_actions) data.ground_actions = [];
            const newAction = { id: `action-${Date.now()}`, created_at: new Date().toISOString(), ...item };
            data.ground_actions.push(newAction);
            writeMockDb(data);
            return newAction;
        }
        const dbItem = { ...item };
        // Ensure required fields have defaults
        if (!dbItem.category) dbItem.category = 'General';
        if (!dbItem.cover_image) dbItem.cover_image = 'https://placehold.co/400';
        if (!dbItem.cover_image_public_id) dbItem.cover_image_public_id = '';
        delete dbItem.localCover;
        delete dbItem.localImages;
        const { data, error } = await supabase.from('ground_actions').insert([dbItem]).select();
        if (error) throw error;
        return data[0];
    },
    deleteGroundAction: async (id) => {
        if (useMock) {
            const data = readMockDb();
            if (!data.ground_actions) data.ground_actions = [];
            const action = data.ground_actions.find(a => a.id === id);
            data.ground_actions = data.ground_actions.filter(a => a.id !== id);
            writeMockDb(data);
            return action || true;
        }
        const { data: row } = await supabase.from('ground_actions').select('cover_image_public_id, gallery_images').eq('id', id).single();
        const { error } = await supabase.from('ground_actions').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },

    // 12. Hero Slider
    getHeroSlides: async () => {
        if (useMock) {
            const data = readMockDb();
            if (!data.hero_slider) {
                data.hero_slider = [];
                writeMockDb(data);
            }
            return data.hero_slider.sort((a, b) => a.sort_order - b.sort_order);
        }
        const { data, error } = await supabase.from('hero_slider').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    },
    getSlides: async () => {
        if (useMock) {
            const data = readMockDb();
            if (!data.hero_slider) {
                data.hero_slider = [];
                writeMockDb(data);
            }
            return data.hero_slider.sort((a, b) => a.sort_order - b.sort_order);
        }
        const { data, error } = await supabase.from('hero_slider').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    },
    createHeroSlide: async (slide) => {
        if (useMock) {
            const data = readMockDb();
            if (!data.hero_slider) data.hero_slider = [];
            const newSlide = { id: `slide-${Date.now()}`, created_at: new Date().toISOString(), ...slide };
            data.hero_slider.push(newSlide);
            writeMockDb(data);
            return newSlide;
        }
        const { data, error } = await supabase.from('hero_slider').insert([stripLocalFields(slide)]).select();
        if (error) throw error;
        return data[0];
    },
    deleteHeroSlide: async (id) => {
        if (useMock) {
            const data = readMockDb();
            if (!data.hero_slider) data.hero_slider = [];
            const slide = data.hero_slider.find(s => s.id === id);
            data.hero_slider = data.hero_slider.filter(s => s.id !== id);
            writeMockDb(data);
            return slide || true;
        }
        const { data: row } = await supabase.from('hero_slider').select('image_public_id').eq('id', id).single();
        const { error } = await supabase.from('hero_slider').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },
    reorderHeroSlides: async (slides) => {
        if (useMock) {
            const data = readMockDb();
            data.hero_slider = slides;
            writeMockDb(data);
            return slides;
        }
        for (const slide of slides) {
            const { error } = await supabase.from('hero_slider').update({ sort_order: slide.sort_order }).eq('id', slide.id);
            if (error) throw error;
        }
        return slides;
    },
    updateMember: async (id, member) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.community_members.findIndex(m => m.id === id);
            if (idx !== -1) {
                data.community_members[idx] = { ...data.community_members[idx], ...member };
                writeMockDb(data);
                return data.community_members[idx];
            }
            return null;
        }
        // Map frontend fields to actual DB columns
        const dbMember = { ...member };
        if (dbMember.department !== undefined) {
            dbMember.responsibility = dbMember.department;
            delete dbMember.department;
        }
        delete dbMember.localFile;
        const { data, error } = await supabase.from('community_members').update(dbMember).eq('id', id).select();
        if (error) throw error;
        const result = data[0];
        if (result) result.department = result.responsibility;
        return result;
    },
    updateProgram: async (id, program) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.programs.findIndex(p => p.id === id);
            if (idx !== -1) {
                data.programs[idx] = { ...data.programs[idx], ...program };
                writeMockDb(data);
                return data.programs[idx];
            }
            return null;
        }
        const { data, error } = await supabase.from('programs').update(stripLocalFields(program)).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },
    updateGallery: async (id, gallery) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.gallery.findIndex(g => g.id === id);
            if (idx !== -1) {
                data.gallery[idx] = { ...data.gallery[idx], ...gallery };
                writeMockDb(data);
                return data.gallery[idx];
            }
            return null;
        }
        // Map frontend fields to actual DB columns
        const dbGallery = { ...gallery };
        if (dbGallery.description !== undefined) {
            dbGallery.caption = dbGallery.description;
            delete dbGallery.description;
        }
        if (!dbGallery.image_url && dbGallery.cover_image) {
            dbGallery.image_url = dbGallery.cover_image;
        }
        delete dbGallery.localCover;
        delete dbGallery.localImages;
        const { data, error } = await supabase.from('gallery').update(dbGallery).eq('id', id).select();
        if (error) throw error;
        const result = data[0];
        if (result) result.description = result.caption;
        return result;
    },
    updateSponsor: async (id, sponsor) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.sponsors.findIndex(s => s.id === id);
            if (idx !== -1) {
                data.sponsors[idx] = { ...data.sponsors[idx], ...sponsor };
                writeMockDb(data);
                return data.sponsors[idx];
            }
            return null;
        }
        const { data, error } = await supabase.from('sponsors').update(stripLocalFields(sponsor)).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },
    updateEvent: async (id, eventItem) => {
        if (useMock) {
            const data = readMockDb();
            let idx = -1;
            if (data.news) idx = data.news.findIndex(n => n.id === id);
            if (idx !== -1) {
                data.news[idx] = { ...data.news[idx], ...eventItem };
                writeMockDb(data);
                return data.news[idx];
            }
            if (data.events) idx = data.events.findIndex(e => e.id === id);
            if (idx !== -1) {
                data.events[idx] = { ...data.events[idx], ...eventItem };
                writeMockDb(data);
                return data.events[idx];
            }
            return null;
        }

        // Try updating in news first
        const { data: newsCheck } = await supabase.from('news').select('id').eq('id', id).single();
        if (newsCheck) {
            const newsObj = {
                title: eventItem.title,
                content: eventItem.content,
                published_date: eventItem.date,
                cover_image: eventItem.image_url,
                cover_image_public_id: eventItem.image_public_id
            };
            const { data, error } = await supabase.from('news').update(newsObj).eq('id', id).select();
            if (error) throw error;
            return data[0];
        }

        // Try updating in events
        const { data: eventCheck } = await supabase.from('events').select('id').eq('id', id).single();
        if (eventCheck) {
            const eventObj = {
                title: eventItem.title,
                short_description: eventItem.content || '',
                full_description: eventItem.description || '',
                event_date: eventItem.date,
                event_time: eventItem.time || '10:00 AM',
                location: eventItem.location || '',
                category: eventItem.category || 'General',
                status: eventItem.status || 'Planned',
                cover_image: eventItem.image_url,
                cover_image_public_id: eventItem.image_public_id
            };
            const { data, error } = await supabase.from('events').update(eventObj).eq('id', id).select();
            if (error) throw error;
            return data[0];
        }
        return null;
    },
    updateGroundAction: async (id, item) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.ground_actions.findIndex(ga => ga.id === id);
            if (idx !== -1) {
                data.ground_actions[idx] = { ...data.ground_actions[idx], ...item };
                writeMockDb(data);
                return data.ground_actions[idx];
            }
            return null;
        }
        const dbItem = { ...item };
        delete dbItem.localCover;
        delete dbItem.localImages;
        if (dbItem.category === undefined || dbItem.category === '') dbItem.category = 'General';
        const { data, error } = await supabase.from('ground_actions').update(dbItem).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },
    updateHeroSlide: async (id, slide) => {
        if (useMock) {
            const data = readMockDb();
            const idx = data.hero_slider.findIndex(s => s.id === id);
            if (idx !== -1) {
                data.hero_slider[idx] = { ...data.hero_slider[idx], ...slide };
                writeMockDb(data);
                return data.hero_slider[idx];
            }
            return null;
        }
        const { data, error } = await supabase.from('hero_slider').update(stripLocalFields(slide)).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },
    getCertificates: async () => {
        if (useMock) {
            return [];
        }
        const { data, error } = await supabase.from('certificates_documents').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        return data;
    },
    createCertificate: async (cert) => {
        if (useMock) {
            return cert;
        }
        const { data, error } = await supabase.from('certificates_documents').insert([cert]).select();
        if (error) throw error;
        return data[0];
    },
    deleteCertificate: async (id) => {
        if (useMock) {
            return true;
        }
        const { data: row } = await supabase.from('certificates_documents').select('file_url').eq('id', id).single();
        const { error } = await supabase.from('certificates_documents').delete().eq('id', id);
        if (error) throw error;
        return row || true;
    },
    updateCertificate: async (id, cert) => {
        if (useMock) {
            return cert;
        }
        const { data, error } = await supabase.from('certificates_documents').update(cert).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },
    supabaseClient: supabase
};

module.exports = db;
