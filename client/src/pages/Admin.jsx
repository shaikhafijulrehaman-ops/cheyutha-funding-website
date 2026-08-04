import React, { useState, useEffect } from 'react';
import { 
    Lock, LogOut, DollarSign, Users, Image, Award, Quote, Calendar, 
    MessageSquare, Settings, Plus, Trash, Check, X, ShieldAlert, Edit, ChevronUp, ChevronDown, Search, FileText, Menu
} from 'lucide-react';
import { api } from '../api';
import ImageUpload from '../components/ImageUpload';
import { confirmDialog } from '../components/CustomDialog';
import { useToast } from '../components/Toast';

export default function Admin() {
    const { showToast } = useToast();
    const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('donations');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // CRUD lists
    const [donations, setDonations] = useState([]);
    const [members, setMembers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [sponsors, setSponsors] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [events, setEvents] = useState([]);
    const [groundActions, setGroundActions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [settings, setSettings] = useState(null);
    const [slides, setSlides] = useState([]);
    const [certificates, setCertificates] = useState([]);

    // Search and pagination states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Edit ID tracking
    const [editingId, setEditingId] = useState(null);
    const [saveProgress, setSaveProgress] = useState(null);
    const [successState, setSuccessState] = useState(null);

    // Form inputs state
    const [newMember, setNewMember] = useState({ name: '', role: '', department: '', description: '', image_url: '', image_public_id: '', sort_order: 0, localFile: null });
    const [newProgram, setNewProgram] = useState({ title: '', description: '', image_url: '', image_public_id: '', sort_order: 0, localFile: null });
    const [newGallery, setNewGallery] = useState({ album_title: '', description: '', cover_image: '', cover_image_public_id: '', images: [], localCover: null, localImages: [] });
    const [newSponsor, setNewSponsor] = useState({ name: '', logo_url: '', logo_public_id: '', website: '', description: '', sort_order: 0, localFile: null });
    const [newQuote, setNewQuote] = useState({ quote: '', author: '' });
    const [newEvent, setNewEvent] = useState({ title: '', content: '', description: '', type: 'event', date: '', time: '10:00 AM', location: '', category: 'General', status: 'Planned', image_url: '', image_public_id: '', localFile: null });
    const [newGroundAction, setNewGroundAction] = useState({ title: '', subtitle: '', description: '', location: '', date: '', cover_image: '', cover_image_public_id: '', gallery_images: [], category: '', status: 'Completed', featured: false, localCover: null, localImages: [] });
    const [newSlide, setNewSlide] = useState({ title: '', description: '', image_url: '', image_public_id: '', cta_text: 'Donate Now', cta_link: '', sort_order: 0, localFile: null });
    const [newCert, setNewCert] = useState({ title: '', urn: '', category: 'Legal compliance doc', file_url: '', sort_order: 0, localFile: null });
    const [editSettings, setEditSettings] = useState({ phone: '', email: '', address: '', footer_text: '', stat_children: '0', stat_camps: '0', stat_women: '0', stat_funds: '0' });

    // Reset pagination and search on tab change
    useEffect(() => {
        setSearchQuery('');
        setFilterType('all');
        setCurrentPage(1);
        setEditingId(null);
        clearAllForms();
    }, [activeTab]);

    // Fetch tab data on change
    useEffect(() => {
        if (!token) return;
        loadTabData();
    }, [token, activeTab]);

    // Real-time SSE synchronization for Admin Panel
    useEffect(() => {
        if (!token) return;
        const sse = new EventSource((import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '') + '/api/realtime');
        
        sse.onmessage = (event) => {
            try {
                const { table } = JSON.parse(event.data);
                if (
                    (activeTab === 'slider' && table === 'slider') ||
                    (activeTab === 'members' && table === 'members') ||
                    (activeTab === 'programs' && table === 'programs') ||
                    (activeTab === 'gallery' && table === 'gallery') ||
                    (activeTab === 'sponsors' && table === 'sponsors') ||
                    (activeTab === 'quotes' && table === 'quotes') ||
                    (activeTab === 'events' && table === 'events') ||
                    (activeTab === 'ground-actions' && table === 'ground-actions') ||
                    (activeTab === 'certificates' && table === 'certificates') ||
                    (activeTab === 'settings' && table === 'settings')
                ) {
                    loadTabData();
                }
            } catch (err) {
                console.error("SSE parse error in admin: ", err);
            }
        };

        sse.onerror = () => {
            sse.close();
        };

        return () => {
            sse.close();
        };
    }, [token, activeTab]);

    const clearAllForms = () => {
        setNewMember({ name: '', role: '', department: '', description: '', image_url: '', image_public_id: '', sort_order: 0, localFile: null });
        setNewProgram({ title: '', description: '', image_url: '', image_public_id: '', sort_order: 0, localFile: null });
        setNewGallery({ album_title: '', description: '', cover_image: '', cover_image_public_id: '', images: [], localCover: null, localImages: [] });
        setNewSponsor({ name: '', logo_url: '', logo_public_id: '', website: '', description: '', sort_order: 0, localFile: null });
        setNewQuote({ quote: '', author: '' });
        setNewEvent({ title: '', content: '', description: '', type: 'event', date: '', time: '10:00 AM', location: '', category: 'General', status: 'Planned', image_url: '', image_public_id: '', localFile: null });
        setNewGroundAction({ title: '', subtitle: '', description: '', location: '', date: '', cover_image: '', cover_image_public_id: '', gallery_images: [], category: '', status: 'Completed', featured: false, localCover: null, localImages: [] });
        setNewSlide({ title: '', description: '', image_url: '', image_public_id: '', cta_text: 'Donate Now', cta_link: '', sort_order: 0, localFile: null });
        setNewCert({ title: '', urn: '', category: 'Legal compliance doc', file_url: '', sort_order: 0, localFile: null });
    };

    const loadTabData = async () => {
        try {
            if (activeTab === 'donations') {
                const res = await api.getDonations(token);
                setDonations(Array.isArray(res) ? res : []);
                if (res && res.error) {
                    showToast(res.error, "error");
                    if (res.error.toLowerCase().includes('token') || res.error.toLowerCase().includes('unauthorized')) {
                        handleLogout();
                    }
                }
            } else if (activeTab === 'members') {
                const res = await api.getMembers();
                setMembers(Array.isArray(res) ? res : []);
            } else if (activeTab === 'programs') {
                const res = await api.getPrograms();
                setPrograms(Array.isArray(res) ? res : []);
            } else if (activeTab === 'gallery') {
                const res = await api.getGallery();
                setGallery(Array.isArray(res) ? res : []);
            } else if (activeTab === 'sponsors') {
                const res = await api.getSponsors();
                setSponsors(Array.isArray(res) ? res : []);
            } else if (activeTab === 'quotes') {
                const res = await api.getQuotes();
                setQuotes(Array.isArray(res) ? res : []);
            } else if (activeTab === 'events') {
                const res = await api.getEvents();
                setEvents(Array.isArray(res) ? res : []);
            } else if (activeTab === 'ground-actions') {
                const res = await api.getGroundActions();
                setGroundActions(Array.isArray(res) ? res : []);
            } else if (activeTab === 'messages') {
                const res = await api.getMessages(token);
                setMessages(Array.isArray(res) ? res : []);
                if (res && res.error) {
                    showToast(res.error, "error");
                }
            } else if (activeTab === 'volunteers') {
                const res = await api.getVolunteers(token);
                setVolunteers(Array.isArray(res) ? res : []);
                if (res && res.error) {
                    showToast(res.error, "error");
                }
            } else if (activeTab === 'slider') {
                const res = await api.getSlides();
                setSlides(Array.isArray(res) ? res : []);
            } else if (activeTab === 'certificates') {
                const res = await api.getCertificates();
                setCertificates(Array.isArray(res) ? res : []);
            } else if (activeTab === 'settings') {
                const res = await api.getSettings();
                setSettings(res);
                if (res && !res.error) {
                    setEditSettings({
                        phone: res.phone || '',
                        email: res.email || '',
                        address: res.address || '',
                        footer_text: res.footer_text || '',
                        stat_children: String(res.stat_children || '0'),
                        stat_camps: String(res.stat_camps || '0'),
                        stat_women: String(res.stat_women || '0'),
                        stat_funds: String(res.stat_funds || '0')
                    });
                }
            }
        } catch (err) {
            console.error("Fetch tab failed: ", err);
            showToast("Failed to load: " + err.message, "error");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            const res = await api.login(password);
            localStorage.setItem('admin_token', res.token);
            setToken(res.token);
            showToast("Authenticated successfully!", "success");
        } catch (err) {
            setLoginError(err.message || 'Login failed.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        setToken('');
        showToast("Logged out.", "info");
    };

    // Generic delete handlers
    const handleDelete = async (type, id) => {
        const confirmed = await confirmDialog(
            `🗑 Delete ${type.replace('_', ' ').toUpperCase()}`,
            `Are you sure you want to delete this item? This will also clean up associated Cloudinary files and cannot be undone.`
        );
        if (!confirmed) return;
        try {
            if (type === 'member') await api.deleteMember(id, token);
            else if (type === 'program') await api.deleteProgram(id, token);
            else if (type === 'gallery') await api.deleteGallery(id, token);
            else if (type === 'sponsor') await api.deleteSponsor(id, token);
            else if (type === 'quote') await api.deleteQuote(id, token);
            else if (type === 'event') await api.deleteEvent(id, token);
            else if (type === 'ground_action') await api.deleteGroundAction(id, token);
            else if (type === 'slide') await api.deleteSlide(id, token);
            else if (type === 'certificate') {
                await api.deleteCertificate(id, token);
            }

            loadTabData();
            showToast("Item deleted successfully.", "success");
        } catch (err) {
            console.error("Technical delete failure details:", err);
            showToast("Something went wrong. Please try again later.", "error");
        }
    };

    // Populate Edit forms
    const startEdit = (type, item) => {
        setEditingId(item.id);
        if (type === 'member') {
            setNewMember({
                name: item.name,
                role: item.role,
                department: item.department,
                description: item.description || '',
                image_url: item.image_url,
                image_public_id: item.image_public_id || '',
                sort_order: item.sort_order || 0
            });
        } else if (type === 'program') {
            setNewProgram({
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                image_public_id: item.image_public_id || '',
                sort_order: item.sort_order || 0
            });
        } else if (type === 'gallery') {
            setNewGallery({
                album_title: item.album_title,
                description: item.description || '',
                cover_image: item.cover_image,
                cover_image_public_id: item.cover_image_public_id || '',
                images: item.images || []
            });
        } else if (type === 'sponsor') {
            setNewSponsor({
                name: item.name,
                logo_url: item.logo_url,
                logo_public_id: item.logo_public_id || '',
                website: item.website || '',
                description: item.description || '',
                sort_order: item.sort_order || 0
            });
        } else if (type === 'quote') {
            setNewQuote({
                quote: item.quote,
                author: item.author
            });
        } else if (type === 'event') {
            // Check table source if event or news
            const isNews = item.type === 'news' || !item.location;
            setNewEvent({
                title: item.title,
                content: item.content || item.short_description || '',
                description: item.description || item.full_description || '',
                type: isNews ? 'news' : 'event',
                date: item.date || item.event_date || '',
                time: item.time || item.event_time || '10:00 AM',
                location: item.location || '',
                category: item.category || 'General',
                status: item.status || 'Planned',
                image_url: item.image_url || item.cover_image || '',
                image_public_id: item.image_public_id || item.cover_image_public_id || ''
            });
        } else if (type === 'ground_action') {
            setNewGroundAction({
                title: item.title,
                subtitle: item.subtitle || '',
                description: item.description,
                location: item.location,
                date: item.date,
                cover_image: item.cover_image,
                cover_image_public_id: item.cover_image_public_id || '',
                gallery_images: item.gallery_images || [],
                category: item.category || '',
                status: item.status || 'Completed',
                featured: item.featured || false
            });
        } else if (type === 'slide') {
            setNewSlide({
                title: item.title,
                description: item.description,
                image_url: item.image_url,
                image_public_id: item.image_public_id || '',
                cta_text: item.cta_text || 'Donate Now',
                cta_link: item.cta_link || '',
                sort_order: item.sort_order || 0
            });
        } else if (type === 'certificate') {
            setNewCert({
                title: item.title,
                urn: item.urn || '',
                category: item.category || 'Legal compliance doc',
                file_url: item.file_url,
                sort_order: item.sort_order || 0
            });
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        clearAllForms();
    };

    const verifySync = async (type, recordId, imageUrls = []) => {
        setSaveProgress("Publishing...");
        // Bounded delay to let Supabase write sync
        await new Promise(r => setTimeout(r, 1000));
        
        let itemsList = [];
        if (type === 'member') itemsList = await api.getMembers();
        else if (type === 'program') itemsList = await api.getPrograms();
        else if (type === 'gallery') itemsList = await api.getGallery();
        else if (type === 'sponsor') itemsList = await api.getSponsors();
        else if (type === 'quote') itemsList = await api.getQuotes();
        else if (type === 'event') itemsList = await api.getEvents();
        else if (type === 'ground_action') itemsList = await api.getGroundActions();
        else if (type === 'slide') itemsList = await api.getSlides();
        else if (type === 'certificate') itemsList = await api.getCertificates();
        else if (type === 'settings') {
            const settingsRes = await api.getSettings();
            if (!settingsRes || settingsRes.error) throw new Error("Record sync verification failed.");
            return true;
        }

        const found = itemsList.find(item => item.id === recordId);
        if (!found) {
            throw new Error(`Record verification failed: Supabase sync delayed.`);
        }

        for (const url of imageUrls.filter(Boolean)) {
            try {
                const check = await fetch(url, { method: 'HEAD' });
                if (!check.ok) throw new Error(`Cloudinary asset verification failed.`);
            } catch (err) {
                throw new Error(`Cloudinary sync verification failed: ${err.message}`);
            }
        }
        return true;
    };

    // Form submit creators and modifiers
    const handleSubmitItem = async (e, type) => {
        e.preventDefault();
        setSaveProgress("Validating fields...");
        
        let uploadedAssets = [];
        
        try {
            if (type === 'member') {
                if (!newMember.name || !newMember.role || !newMember.description) {
                    throw new Error("Validation Error: Name, Role and Description are required.");
                }
                if (!editingId && !newMember.localFile) {
                    throw new Error("Validation Error: Member photo is required.");
                }

                let finalUrl = newMember.image_url;
                let finalPublicId = newMember.image_public_id;
                let oldPublicId = editingId ? newMember.image_public_id : null;

                if (newMember.localFile) {
                    setSaveProgress("Uploading image...");
                    const res = await api.uploadImage(newMember.localFile, token);
                    if (res.error) throw new Error(res.error);
                    finalUrl = res.url;
                    finalPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        name: newMember.name,
                        role: newMember.role,
                        department: newMember.department,
                        description: newMember.description,
                        sort_order: parseInt(newMember.sort_order) || 0,
                        image_url: finalUrl,
                        image_public_id: finalPublicId
                    };
                    if (editingId) {
                        saved = await api.updateMember(editingId, payload, token);
                    } else {
                        saved = await api.createMember(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('member', saved.id, [finalUrl]);

                if (editingId && oldPublicId && oldPublicId !== finalPublicId) {
                    await api.deleteCloudinaryImage(oldPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'program') {
                if (!newProgram.title || !newProgram.description) {
                    throw new Error("Validation Error: Title and Description are required.");
                }
                if (!editingId && !newProgram.localFile) {
                    throw new Error("Validation Error: Program cover image is required.");
                }

                let finalUrl = newProgram.image_url;
                let finalPublicId = newProgram.image_public_id;
                let oldPublicId = editingId ? newProgram.image_public_id : null;

                if (newProgram.localFile) {
                    setSaveProgress("Uploading image...");
                    const res = await api.uploadImage(newProgram.localFile, token);
                    if (res.error) throw new Error(res.error);
                    finalUrl = res.url;
                    finalPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        title: newProgram.title,
                        description: newProgram.description,
                        image_url: finalUrl,
                        image_public_id: finalPublicId,
                        sort_order: parseInt(newProgram.sort_order) || 0
                    };
                    if (editingId) {
                        saved = await api.updateProgram(editingId, payload, token);
                    } else {
                        saved = await api.createProgram(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('program', saved.id, [finalUrl]);

                if (editingId && oldPublicId && oldPublicId !== finalPublicId) {
                    await api.deleteCloudinaryImage(oldPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'gallery') {
                if (!newGallery.album_title) {
                    throw new Error("Validation Error: Album title is required.");
                }
                if (!editingId && !newGallery.localCover) {
                    throw new Error("Validation Error: Cover photo is required.");
                }

                let finalCoverUrl = newGallery.cover_image;
                let finalCoverPublicId = newGallery.cover_image_public_id;
                let oldCoverPublicId = editingId ? newGallery.cover_image_public_id : null;
                let finalImagesList = newGallery.images || [];

                if (newGallery.localCover) {
                    setSaveProgress("Uploading cover image...");
                    const res = await api.uploadImage(newGallery.localCover, token);
                    if (res.error) throw new Error(res.error);
                    finalCoverUrl = res.url;
                    finalCoverPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                if (newGallery.localImages && newGallery.localImages.length > 0) {
                    setSaveProgress("Uploading gallery batch...");
                    const uploadedFiles = await Promise.all(
                        newGallery.localImages.map(file => api.uploadImage(file, token, { folder: 'ngo-assets' }))
                    );
                    uploadedFiles.forEach(file => uploadedAssets.push(file.public_id));
                    finalImagesList = [...finalImagesList, ...uploadedFiles];
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        album_title: newGallery.album_title,
                        description: newGallery.description,
                        cover_image: finalCoverUrl,
                        cover_image_public_id: finalCoverPublicId,
                        images: finalImagesList
                    };
                    if (editingId) {
                        saved = await api.updateGallery(editingId, payload, token);
                    } else {
                        saved = await api.createGallery(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('gallery', saved.id, [finalCoverUrl, ...finalImagesList.map(i => i.url)]);

                if (editingId && oldCoverPublicId && oldCoverPublicId !== finalCoverPublicId) {
                    await api.deleteCloudinaryImage(oldCoverPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'sponsor') {
                if (!newSponsor.name) {
                    throw new Error("Validation Error: Sponsor name is required.");
                }
                if (!editingId && !newSponsor.localFile) {
                    throw new Error("Validation Error: Logo image is required.");
                }

                let finalUrl = newSponsor.logo_url;
                let finalPublicId = newSponsor.logo_public_id;
                let oldPublicId = editingId ? newSponsor.logo_public_id : null;

                if (newSponsor.localFile) {
                    setSaveProgress("Uploading logo...");
                    const res = await api.uploadImage(newSponsor.localFile, token);
                    if (res.error) throw new Error(res.error);
                    finalUrl = res.url;
                    finalPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        name: newSponsor.name,
                        website: newSponsor.website,
                        description: newSponsor.description,
                        sort_order: parseInt(newSponsor.sort_order) || 0,
                        logo_url: finalUrl,
                        logo_public_id: finalPublicId
                    };
                    if (editingId) {
                        saved = await api.updateSponsor(editingId, payload, token);
                    } else {
                        saved = await api.createSponsor(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('sponsor', saved.id, [finalUrl]);

                if (editingId && oldPublicId && oldPublicId !== finalPublicId) {
                    await api.deleteCloudinaryImage(oldPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'quote') {
                if (!newQuote.quote || !newQuote.author) {
                    throw new Error("Validation Error: Quote text and Author are required.");
                }

                setSaveProgress("Saving data...");
                let saved = null;
                if (editingId) {
                    saved = await api.updateQuote(editingId, newQuote, token);
                } else {
                    saved = await api.createQuote(newQuote, token);
                }
                if (!saved || saved.error) throw new Error(saved?.error || "Save failed");

                await verifySync('quote', saved.id, []);
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'event') {
                if (!newEvent.title || !newEvent.content) {
                    throw new Error("Validation Error: Title and content summary are required.");
                }
                if (!editingId && !newEvent.localFile) {
                    throw new Error("Validation Error: Cover photo is required.");
                }

                let finalUrl = newEvent.image_url;
                let finalPublicId = newEvent.image_public_id;
                let oldPublicId = editingId ? newEvent.image_public_id : null;

                if (newEvent.localFile) {
                    setSaveProgress("Uploading cover image...");
                    const res = await api.uploadImage(newEvent.localFile, token);
                    if (res.error) throw new Error(res.error);
                    finalUrl = res.url;
                    finalPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        title: newEvent.title,
                        type: newEvent.type,
                        date: newEvent.date,
                        time: newEvent.time,
                        location: newEvent.location,
                        category: newEvent.category,
                        status: newEvent.status,
                        content: newEvent.content,
                        description: newEvent.description,
                        image_url: finalUrl,
                        image_public_id: finalPublicId
                    };
                    if (editingId) {
                        saved = await api.updateEvent(editingId, payload, token);
                    } else {
                        saved = await api.createEvent(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('event', saved.id, [finalUrl]);

                if (editingId && oldPublicId && oldPublicId !== finalPublicId) {
                    await api.deleteCloudinaryImage(oldPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'ground_action') {
                if (!newGroundAction.title || !newGroundAction.location) {
                    throw new Error("Validation Error: Title and Location are required.");
                }
                if (!editingId && !newGroundAction.localCover) {
                    throw new Error("Validation Error: Cover image is required.");
                }

                let finalCoverUrl = newGroundAction.cover_image;
                let finalCoverPublicId = newGroundAction.cover_image_public_id;
                let oldCoverPublicId = editingId ? newGroundAction.cover_image_public_id : null;
                let finalGalleryList = newGroundAction.gallery_images || [];

                if (newGroundAction.localCover) {
                    setSaveProgress("Uploading cover image...");
                    const res = await api.uploadImage(newGroundAction.localCover, token);
                    if (res.error) throw new Error(res.error);
                    finalCoverUrl = res.url;
                    finalCoverPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                if (newGroundAction.localImages && newGroundAction.localImages.length > 0) {
                    setSaveProgress("Uploading gallery batch...");
                    const uploadedFiles = await Promise.all(
                        newGroundAction.localImages.map(file => api.uploadImage(file, token, { folder: 'ngo-assets' }))
                    );
                    uploadedFiles.forEach(file => uploadedAssets.push(file.public_id));
                    finalGalleryList = [...finalGalleryList, ...uploadedFiles];
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        title: newGroundAction.title,
                        subtitle: newGroundAction.subtitle,
                        description: newGroundAction.description,
                        location: newGroundAction.location,
                        date: newGroundAction.date,
                        category: newGroundAction.category,
                        status: newGroundAction.status,
                        featured: newGroundAction.featured,
                        cover_image: finalCoverUrl,
                        cover_image_public_id: finalCoverPublicId,
                        gallery_images: finalGalleryList
                    };
                    if (editingId) {
                        saved = await api.updateGroundAction(editingId, payload, token);
                    } else {
                        saved = await api.createGroundAction(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('ground_action', saved.id, [finalCoverUrl, ...finalGalleryList.map(i => i.url)]);

                if (editingId && oldCoverPublicId && oldCoverPublicId !== finalCoverPublicId) {
                    await api.deleteCloudinaryImage(oldCoverPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'slide') {
                if (!newSlide.title || !newSlide.description) {
                    throw new Error("Validation Error: Slide title and description are required.");
                }
                if (!editingId && !newSlide.localFile) {
                    throw new Error("Validation Error: High-res slide background photo is required.");
                }

                let finalUrl = newSlide.image_url;
                let finalPublicId = newSlide.image_public_id;
                let oldPublicId = editingId ? newSlide.image_public_id : null;

                if (newSlide.localFile) {
                    setSaveProgress("Uploading backdrop...");
                    const res = await api.uploadImage(newSlide.localFile, token);
                    if (res.error) throw new Error(res.error);
                    finalUrl = res.url;
                    finalPublicId = res.public_id;
                    uploadedAssets.push(res.public_id);
                }

                setSaveProgress("Saving data...");
                let saved = null;
                try {
                    const payload = {
                        title: newSlide.title,
                        description: newSlide.description,
                        image_url: finalUrl,
                        image_public_id: finalPublicId,
                        cta_text: newSlide.cta_text,
                        cta_link: newSlide.cta_link,
                        sort_order: parseInt(newSlide.sort_order) || 0
                    };
                    if (editingId) {
                        saved = await api.updateSlide(editingId, payload, token);
                    } else {
                        saved = await api.createSlide(payload, token);
                    }
                    if (!saved || saved.error) throw new Error(saved?.error || "Save failed");
                } catch (dbErr) {
                    for (const pid of uploadedAssets) {
                        await api.deleteCloudinaryImage(pid, token).catch(console.error);
                    }
                    throw dbErr;
                }

                await verifySync('slide', saved.id, [finalUrl]);

                if (editingId && oldPublicId && oldPublicId !== finalPublicId) {
                    await api.deleteCloudinaryImage(oldPublicId, token).catch(console.error);
                }
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'certificate') {
                if (!newCert.title) {
                    throw new Error("Validation Error: Certificate/Doc title is required.");
                }
                if (!editingId && !newCert.localFile) {
                    throw new Error("Validation Error: Local PDF document is required.");
                }

                let finalUrl = newCert.file_url;
                if (newCert.localFile) {
                    setSaveProgress("Uploading legal PDF...");
                    const res = await api.uploadImage(newCert.localFile, token);
                    if (res.error) throw new Error(res.error);
                    finalUrl = res.url;
                }

                setSaveProgress("Saving data...");
                let saved = null;
                const payload = {
                    title: newCert.title,
                    urn: newCert.urn,
                    category: newCert.category,
                    file_url: finalUrl,
                    sort_order: parseInt(newCert.sort_order) || 0
                };
                if (editingId) {
                    saved = await api.updateCertificate(editingId, payload, token);
                } else {
                    saved = await api.createCertificate(payload, token);
                }
                if (!saved || saved.error) throw new Error(saved?.error || "Save failed");

                await verifySync('certificate', saved.id, [finalUrl]);
                showToast(editingId ? "Successfully Updated" : "Successfully Published", "success");

            } else if (type === 'settings') {
                setSaveProgress("Saving data...");
                const res = await api.updateSettings(editSettings, token);
                if (!res || res.error) throw new Error(res?.error || "Save failed");
                
                await verifySync('settings', 'settings', []);
                showToast("Successfully Updated", "success");
            }

            setSuccessState("Published Successfully");
            setTimeout(() => {
                setSuccessState(null);
            }, 2000);

            setEditingId(null);
            clearAllForms();
            loadTabData();
        } catch (err) {
            console.error("Technical Error during submit:", err);
            let friendlyMsg = "Something went wrong while saving your data.";
            const msg = err.message || "";
            if (msg.includes("Validation Error:")) {
                friendlyMsg = msg.replace("Validation Error:", "").trim();
            } else if (msg.toLowerCase().includes("upload") || msg.toLowerCase().includes("cloudinary") || msg.toLowerCase().includes("signature")) {
                friendlyMsg = "Unable to upload the image. Please try again.";
            } else if (msg.toLowerCase().includes("database") || msg.toLowerCase().includes("column") || msg.toLowerCase().includes("relation") || msg.toLowerCase().includes("schema") || msg.toLowerCase().includes("supabase")) {
                friendlyMsg = "Something went wrong while saving your data.";
            }
            showToast(friendlyMsg, "error");
        } finally {
            setSaveProgress(null);
        }
    };

    const handleMessageStatus = async (id, status) => {
        try {
            await api.updateMessage(id, status, token);
            loadTabData();
            showToast(`Inquiry marked as ${status}.`, "success");
        } catch (err) {
            console.error("Technical status update failure:", err);
            showToast("Something went wrong. Please try again later.", "error");
        }
    };

    const handleDeleteMessage = (id) => {
        confirmDialog("Are you sure you want to delete this enquiry message?", async () => {
            try {
                await api.deleteMessage(id, token);
                loadTabData();
                showToast("Enquiry message deleted successfully.", "success");
            } catch (err) {
                console.error("Delete message failure:", err);
                showToast("Failed to delete message. Please try again.", "error");
            }
        });
    };

    const handleVolunteerStatus = async (id, status) => {
        try {
            await api.updateVolunteer(id, status, token);
            loadTabData();
            showToast(`Volunteer application marked ${status}.`, "success");
        } catch (err) {
            console.error("Technical application update failure:", err);
            showToast("Something went wrong. Please try again later.", "error");
        }
    };

    // Sort order handlers for hero sliders
    const handleMoveSlide = async (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= slides.length) return;

        const updatedSlides = [...slides];
        const temp = updatedSlides[index].sort_order;
        updatedSlides[index].sort_order = updatedSlides[targetIndex].sort_order;
        updatedSlides[targetIndex].sort_order = temp;

        try {
            await api.reorderSlides(updatedSlides, token);
            setSlides(updatedSlides.sort((a, b) => a.sort_order - b.sort_order));
            showToast("Slides reordered successfully!", "success");
        } catch (err) {
            console.error("Technical reorder slides failure:", err);
            showToast("Something went wrong while reordering items.", "error");
        }
    };

    if (!token) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#0d1611', padding: '24px' }}>
                <div className="donate-form-card" style={{ width: '100%', maxWidth: '420px', padding: '40px', background: '#122018', border: '1px solid #1c3226' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <div className="trust-card-icon" style={{ margin: '0 auto 12px auto', background: '#1c3226', color: '#10b981' }}>
                            <Lock size={28} />
                        </div>
                        <h3 style={{ color: '#fff' }}>Cheyutha Portal Admin</h3>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                            Unlock CMS configurations and database ledgers
                        </p>
                    </div>

                    {loginError && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', fontWeight: '500', textAlign: 'center' }}>
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Master Admin Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Enter unlock password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ background: '#0d1611', border: '1px solid #1c3226', color: '#fff' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Helper functions for Search, Filtering & Pagination
    const getSearchFilteredItems = (items) => {
        const safeItems = Array.isArray(items) ? items : [];
        let results = [...safeItems];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            results = results.filter(item => {
                const searchString = [
                    item.name, item.role, item.title, item.album_title, item.location, 
                    item.donor_name, item.donor_email, item.email, item.quote, item.author, item.category
                ].filter(Boolean).join(' ').toLowerCase();
                return searchString.includes(query);
            });
        }

        if (filterType !== 'all') {
            if (activeTab === 'events') {
                results = results.filter(item => item.type === filterType);
            } else if (activeTab === 'volunteers' || activeTab === 'messages') {
                results = results.filter(item => item.status === filterType);
            } else if (activeTab === 'ground-actions') {
                results = results.filter(item => item.status === filterType);
            }
        }
        return results;
    };

    // Calculate current dataset items for render
    const currentTabItems = () => {
        if (activeTab === 'donations') return donations;
        if (activeTab === 'members') return members;
        if (activeTab === 'programs') return programs;
        if (activeTab === 'gallery') return gallery;
        if (activeTab === 'sponsors') return sponsors;
        if (activeTab === 'quotes') return quotes;
        if (activeTab === 'events') return events;
        if (activeTab === 'ground-actions') return groundActions;
        if (activeTab === 'messages') return messages;
        if (activeTab === 'volunteers') return volunteers;
        if (activeTab === 'slider') return slides;
        if (activeTab === 'certificates') return certificates;
        return [];
    };

    const processedItems = getSearchFilteredItems(currentTabItems());
    const totalPages = Math.ceil(processedItems.length / itemsPerPage);
    const paginatedItems = processedItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="admin-layout">
            {isMobileSidebarOpen && (
                <div 
                    className="admin-sidebar-overlay" 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 998, backdropFilter: 'blur(3px)' }}
                />
            )}
            
            {/* Sidebar Navigation */}
            <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'open' : ''}`} style={{ background: '#0d1611', borderRight: '1px solid #1c3226' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #1c3226', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldAlert size={20} color="#10b981" />
                        CMS Dashboard
                    </h2>
                    <button 
                        type="button" 
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="admin-mobile-close-btn"
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
                    >
                        <X size={22} />
                    </button>
                </div>
                <nav style={{ flexGrow: 1, padding: '16px 12px', overflowY: 'auto' }}>
                    <ul className="admin-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', padding: 0, margin: 0 }}>
                        {[
                            { id: 'donations', label: 'Donations', icon: <DollarSign size={16} /> },
                            { id: 'slider', label: 'Hero Slider', icon: <Image size={16} /> },
                            { id: 'members', label: 'Community Members', icon: <Users size={16} /> },
                            { id: 'programs', label: 'Impact Programs', icon: <Calendar size={16} /> },
                            { id: 'ground-actions', label: 'Ground Actions', icon: <Award size={16} /> },
                            { id: 'gallery', label: 'Gallery Albums', icon: <Image size={16} /> },
                            { id: 'sponsors', label: 'Sponsors', icon: <Award size={16} /> },
                            { id: 'quotes', label: 'Charity Quotes', icon: <Quote size={16} /> },
                            { id: 'events', label: 'News & Events', icon: <Calendar size={16} /> },
                            { id: 'certificates', label: 'Transparency Docs', icon: <FileText size={16} /> },
                            { id: 'messages', label: 'Inquiries', icon: <MessageSquare size={16} /> },
                            { id: 'volunteers', label: 'Volunteers', icon: <Users size={16} /> },
                            { id: 'settings', label: 'Site Settings', icon: <Settings size={16} /> }
                        ].map(t => (
                            <li key={t.id}>
                                <button className={`admin-nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => { setActiveTab(t.id); setIsMobileSidebarOpen(false); }}>
                                    {t.icon}
                                    {t.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                <div style={{ padding: '20px 16px', borderTop: '1px solid #1c3226' }}>
                    <button className="btn btn-secondary admin-logout-btn" onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <main className="admin-main" style={{ background: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div className="admin-header" style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                type="button"
                                className="admin-mobile-menu-toggle"
                                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'none', color: 'var(--primary-dark)' }}
                            >
                                <Menu size={22} />
                            </button>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-dark)', margin: 0 }}>
                                    Manage {activeTab.replace('_', ' ').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>CMS Control Portal - live database synchronization.</p>
                            </div>
                        </div>
                        
                        {/* Inline Search Filter Bar */}
                        {activeTab !== 'settings' && activeTab !== 'donations' && (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search records..." 
                                        className="form-control"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                        style={{ paddingLeft: '36px', width: '220px', height: '36px', fontSize: '13px', margin: 0 }}
                                    />
                                </div>
                                {activeTab === 'events' && (
                                    <select className="form-control" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} style={{ width: '120px', height: '36px', fontSize: '13px', margin: 0 }}>
                                        <option value="all">All Types</option>
                                        <option value="event">Events Only</option>
                                        <option value="news">News Only</option>
                                    </select>
                                )}
                                {activeTab === 'volunteers' && (
                                    <select className="form-control" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} style={{ width: '120px', height: '36px', fontSize: '13px', margin: 0 }}>
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                )}
                                {activeTab === 'ground-actions' && (
                                    <select className="form-control" value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} style={{ width: '120px', height: '36px', fontSize: '13px', margin: 0 }}>
                                        <option value="all">All Status</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Planned">Planned</option>
                                    </select>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flexGrow: 1, padding: '40px' }}>
                    
                    {/* --- 1. Donations Log --- */}
                    {activeTab === 'donations' && (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Donor Name</th>
                                        <th>Email / Phone</th>
                                        <th>Amount</th>
                                        <th>PAN Card</th>
                                        <th>Receipt No</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((d) => (
                                        <tr key={d.id}>
                                            <td><strong>{d.donor_name}</strong></td>
                                            <td>
                                                <div>{d.donor_email}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d.donor_phone}</div>
                                            </td>
                                            <td><strong>₹{parseFloat(d.amount).toLocaleString('en-IN')}</strong></td>
                                            <td><span style={{ fontFamily: 'monospace' }}>{d.pan_number || 'N/A'}</span></td>
                                            <td><strong>{d.receipt_no || '-'}</strong></td>
                                            <td>
                                                <span className={`admin-badge admin-badge-${d.status}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                {new Date(d.created_at).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedItems.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No donation transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- 2. Hero Slider CRUD --- */}
                    {activeTab === 'slider' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Slide' : '➕ Add Slide'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'slide')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Slide Title</label>
                                        <input type="text" className="form-control" required value={newSlide.title} onChange={(e) => setNewSlide({...newSlide, title: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Description Paragraph</label>
                                        <textarea className="form-control" rows="2" required value={newSlide.description} onChange={(e) => setNewSlide({...newSlide, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Button Text (CTA)</label>
                                        <input type="text" className="form-control" value={newSlide.cta_text} onChange={(e) => setNewSlide({...newSlide, cta_text: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order Index</label>
                                        <input type="number" className="form-control" value={newSlide.sort_order} onChange={(e) => setNewSlide({...newSlide, sort_order: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <ImageUpload 
                                            label="Slide Photo (High Resolution)" 
                                            value={newSlide.image_url} 
                                            onChange={(file) => setNewSlide({...newSlide, localFile: file})} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Add Slide'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Priority Order</th>
                                            <th>Move</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((slide, idx) => (
                                            <tr key={slide.id}>
                                                <td><img src={slide.image_url} alt="slide" style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                                <td><strong>{slide.title}</strong></td>
                                                <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{slide.description}</td>
                                                <td>Priority: {slide.sort_order}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <button disabled={idx === 0} onClick={() => handleMoveSlide(idx, 'up')} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}><ChevronUp size={14} /></button>
                                                        <button disabled={idx === slides.length - 1} onClick={() => handleMoveSlide(idx, 'down')} className="btn btn-secondary btn-sm" style={{ padding: '4px' }}><ChevronDown size={14} /></button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('slide', slide)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('slide', slide.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 3. Community Members CRUD --- */}
                    {activeTab === 'members' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Member Profile' : '➕ Add Community Member'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'member')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Member Name</label>
                                        <input type="text" className="form-control" required value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <input type="text" className="form-control" required placeholder="President, General Secretary, Volunteer" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Department / Segment</label>
                                        <input type="text" className="form-control" required placeholder="Education audit, compliance, medical cell" value={newMember.department} onChange={(e) => setNewMember({...newMember, department: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order Position</label>
                                        <input type="number" className="form-control" value={newMember.sort_order} onChange={(e) => setNewMember({...newMember, sort_order: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <ImageUpload 
                                            label="Member Photo (Equal square sizing)" 
                                            value={newMember.image_url} 
                                            onChange={(file) => setNewMember({...newMember, localFile: file})} 
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Bio / Description (Short)</label>
                                        <textarea className="form-control" rows="2" value={newMember.description} onChange={(e) => setNewMember({...newMember, description: e.target.value})}></textarea>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Add Member'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Profile</th>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Department</th>
                                            <th>Priority</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((m) => (
                                            <tr key={m.id}>
                                                <td><img src={m.image_url} alt="member" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} /></td>
                                                <td><strong>{m.name}</strong></td>
                                                <td>{m.role}</td>
                                                <td>{m.department}</td>
                                                <td>Order: {m.sort_order}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('member', m)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('member', m.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 4. Programs CRUD --- */}
                    {activeTab === 'programs' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Impact Program' : '➕ Add Impact Program'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'program')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Program Name / Title</label>
                                        <input type="text" className="form-control" required value={newProgram.title} onChange={(e) => setNewProgram({...newProgram, title: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Description details</label>
                                        <textarea className="form-control" rows="3" required value={newProgram.description} onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <ImageUpload 
                                            label="Program Cover Image" 
                                            value={newProgram.image_url} 
                                            onChange={(file) => setNewProgram({...newProgram, localFile: file})} 
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Create Program'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Program Image</th>
                                            <th>Title</th>
                                            <th>Description Summary</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((p) => (
                                            <tr key={p.id}>
                                                <td><img src={p.image_url} alt="program" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                                <td><strong>{p.title}</strong></td>
                                                <td style={{ fontSize: '12px' }}>{p.description}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('program', p)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('program', p.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 5. Gallery Albums CRUD --- */}
                    {activeTab === 'gallery' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Album Gallery' : '➕ Create Gallery Album'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'gallery')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Album Title</label>
                                        <input type="text" className="form-control" required placeholder="Health screening Vijayawada 2026" value={newGallery.album_title} onChange={(e) => setNewGallery({...newGallery, album_title: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Album Description</label>
                                        <textarea className="form-control" rows="2" placeholder="Describe compliance verification points..." value={newGallery.description} onChange={(e) => setNewGallery({...newGallery, description: e.target.value})}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <ImageUpload 
                                            label="Album Cover Photo (Required)" 
                                            value={newGallery.cover_image} 
                                            onChange={(file) => setNewGallery({...newGallery, localCover: file})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <ImageUpload 
                                            label="Additional Album Images (Multiple)" 
                                            value={newGallery.images} 
                                            multiple={true}
                                            onChange={(files) => setNewGallery({...newGallery, localImages: files})} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Create Album'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="grid-3" style={{ marginTop: '24px' }}>
                                {paginatedItems.map((album) => (
                                    <div key={album.id} className="admin-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <img src={album.cover_image} alt="album cover" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{album.album_title}</h4>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Photos: {1 + (album.images?.length || 0)}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                            <button onClick={() => startEdit('gallery', album)} className="btn btn-secondary btn-sm" style={{ flexGrow: 1, color: 'var(--primary)' }}><Edit size={14} /> Edit</button>
                                            <button onClick={() => handleDelete('gallery', album.id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }}><Trash size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- 6. Sponsors CRUD --- */}
                    {activeTab === 'sponsors' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Sponsor Details' : '➕ Add Corporate Sponsor'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'sponsor')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Sponsor Corporate Name</label>
                                        <input type="text" className="form-control" required value={newSponsor.name} onChange={(e) => setNewSponsor({...newSponsor, name: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Website URL (Redirect Link)</label>
                                        <input type="url" className="form-control" placeholder="https://..." value={newSponsor.website} onChange={(e) => setNewSponsor({...newSponsor, website: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <ImageUpload 
                                            label="Sponsor Corporate Logo" 
                                            value={newSponsor.logo_url} 
                                            onChange={(file) => setNewSponsor({...newSponsor, localFile: file})} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Add Sponsor'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Logo</th>
                                            <th>Sponsor Name</th>
                                            <th>Link</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((s) => (
                                            <tr key={s.id}>
                                                <td><img src={s.logo_url} alt="logo" style={{ height: '30px', objectFit: 'contain' }} /></td>
                                                <td><strong>{s.name}</strong></td>
                                                <td><a href={s.website} target="_blank" rel="noopener noreferrer">{s.website || '-'}</a></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('sponsor', s)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('sponsor', s.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 7. Charity Quotes CRUD --- */}
                    {activeTab === 'quotes' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Charity Quote' : '➕ Add Inspirational Quote'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'quote')} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Quote Content</label>
                                        <textarea className="form-control" rows="2" required placeholder="What we do for ourselves dies with us..." value={newQuote.quote} onChange={(e) => setNewQuote({...newQuote, quote: e.target.value})}></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Author / Speaker</label>
                                        <input type="text" className="form-control" required placeholder="Albert Pine" value={newQuote.author} onChange={(e) => setNewQuote({...newQuote, author: e.target.value})} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Add Quote'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Quote</th>
                                            <th>Author</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((q) => (
                                            <tr key={q.id}>
                                                <td style={{ fontStyle: 'italic' }}>"{q.quote}"</td>
                                                <td><strong>{q.author}</strong></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('quote', q)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('quote', q.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 8. News & Events CRUD --- */}
                    {activeTab === 'events' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Announcement / Event' : '➕ Add Announcement or Event'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'event')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Post Title</label>
                                        <input type="text" className="form-control" required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Publish Type</label>
                                        <select className="form-control" value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}>
                                            <option value="event">Upcoming Event</option>
                                            <option value="news">News Update / Notice</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date (Publish/Event Date)</label>
                                        <input type="date" className="form-control" required value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Event Time (Events only)</label>
                                        <input type="text" className="form-control" placeholder="10:00 AM - 01:00 PM" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <ImageUpload 
                                            label="Single Cover Image" 
                                            value={newEvent.image_url} 
                                            onChange={(file) => setNewEvent({...newEvent, localFile: file})} 
                                        />
                                    </div>
                                    
                                    {newEvent.type === 'event' ? (
                                        <>
                                            <div className="form-group">
                                                <label>Event Location Address</label>
                                                <input type="text" className="form-control" placeholder="Vijayawada health block" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} />
                                            </div>
                                            <div className="form-group">
                                                <label>Event Category / Domain</label>
                                                <input type="text" className="form-control" placeholder="Healthcare, Education, Distribution" value={newEvent.category} onChange={(e) => setNewEvent({...newEvent, category: e.target.value})} />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Short Summary</label>
                                                <input type="text" className="form-control" placeholder="Brief 1-sentence card description" value={newEvent.content} onChange={(e) => setNewEvent({...newEvent, content: e.target.value})} />
                                            </div>
                                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                <label>Full Detailed Event Description</label>
                                                <textarea className="form-control" rows="4" placeholder="Detailed schedules, doctor registrations details..." value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                            <label>Article Content / Report Summary</label>
                                            <textarea className="form-control" rows="4" required value={newEvent.content} onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}></textarea>
                                        </div>
                                    )}

                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Publish Article'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Title</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((e) => (
                                            <tr key={e.id}>
                                                <td><img src={e.image_url || e.cover_image} alt="event cover" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                                <td>{e.date || e.event_date || e.published_date}</td>
                                                <td><span className={`admin-badge admin-badge-${e.type === 'event' ? 'pending' : 'success'}`}>{e.type || 'news'}</span></td>
                                                <td><strong>{e.title}</strong></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('event', e)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('event', e.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 9. Ground Actions CRUD --- */}
                    {activeTab === 'ground-actions' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Ground Action Details' : '➕ Add Ground Action Record'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'ground_action')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Project Title</label>
                                        <input type="text" className="form-control" required value={newGroundAction.title} onChange={(e) => setNewGroundAction({...newGroundAction, title: e.target.value})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Short Description (Card Subtitle)</label>
                                        <input type="text" className="form-control" required value={newGroundAction.subtitle} onChange={(e) => setNewGroundAction({...newGroundAction, subtitle: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Location Coordinates</label>
                                        <input type="text" className="form-control" required placeholder="Vijayawada rural block" value={newGroundAction.location} onChange={(e) => setNewGroundAction({...newGroundAction, location: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Execution Date</label>
                                        <input type="date" className="form-control" required value={newGroundAction.date} onChange={(e) => setNewGroundAction({...newGroundAction, date: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Category Group</label>
                                        <input type="text" className="form-control" required placeholder="Education kit, Infant medicals" value={newGroundAction.category} onChange={(e) => setNewGroundAction({...newGroundAction, category: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Execution Status</label>
                                        <select className="form-control" value={newGroundAction.status} onChange={(e) => setNewGroundAction({...newGroundAction, status: e.target.value})}>
                                            <option value="Completed">Completed</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Planned">Planned</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
                                        <input type="checkbox" id="isFeatured" checked={newGroundAction.featured} onChange={(e) => setNewGroundAction({...newGroundAction, featured: e.target.checked})} />
                                        <label htmlFor="isFeatured" style={{ margin: 0 }}>Pin to Featured Banner</label>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Full Execution Log (Markdown/Plain Details)</label>
                                        <textarea className="form-control" rows="4" required placeholder="Full logistical breakdown, itemized distribution counts..." value={newGroundAction.description} onChange={(e) => setNewGroundAction({...newGroundAction, description: e.target.value})}></textarea>
                                    </div>

                                    {/* S3/Cloudinary multi asset uploads */}
                                    <div className="form-group">
                                        <ImageUpload 
                                            label="1. Action Card Cover Photo" 
                                            value={newGroundAction.cover_image} 
                                            onChange={(file) => setNewGroundAction({...newGroundAction, localCover: file})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <ImageUpload 
                                            label="2. Multiple Additional Gallery Images" 
                                            value={newGroundAction.gallery_images} 
                                            multiple={true}
                                            onChange={(files) => setNewGroundAction({...newGroundAction, localImages: files})} 
                                        />
                                    </div>

                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Add Ground Action'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Date</th>
                                            <th>Title</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((item) => (
                                            <tr key={item.id}>
                                                <td><img src={item.cover_image} alt="action cover" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                                <td>{item.date}</td>
                                                <td><strong>{item.title}</strong></td>
                                                <td>{item.location}</td>
                                                <td><span className={`admin-badge admin-badge-${item.status === 'Completed' ? 'success' : 'pending'}`}>{item.status}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('ground_action', item)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('ground_action', item.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 10. Compliance Documents CRUD --- */}
                    {activeTab === 'certificates' && (
                        <div>
                            <div className="admin-card">
                                <h3>{editingId ? '✏ Edit Compliance Document' : '➕ Register Compliance Document'}</h3>
                                <form onSubmit={(e) => handleSubmitItem(e, 'certificate')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Document Title</label>
                                        <input type="text" className="form-control" required placeholder="80G Tax Exemption Certificate, AP Society Registration" value={newCert.title} onChange={(e) => setNewCert({...newCert, title: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Registration / URN Number</label>
                                        <input type="text" className="form-control" required placeholder="URN: AAHAC7594DF20251" value={newCert.urn} onChange={(e) => setNewCert({...newCert, urn: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Category Label</label>
                                        <input type="text" className="form-control" required placeholder="Donation Tax Exemption, Charitable Status" value={newCert.category} onChange={(e) => setNewCert({...newCert, category: e.target.value})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Sort Order Index</label>
                                        <input type="number" className="form-control" value={newCert.sort_order} onChange={(e) => setNewCert({...newCert, sort_order: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <ImageUpload 
                                            label="Document PDF (File Upload)" 
                                            value={newCert.file_url} 
                                            onChange={(file) => setNewCert({...newCert, localFile: file})} 
                                        />
                                    </div>
                                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={!!saveProgress}>
                                            {editingId ? 'Save Changes' : 'Add Document'}
                                        </button>
                                        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
                                    </div>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>URN</th>
                                            <th>Priority</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedItems.map((c) => (
                                            <tr key={c.id}>
                                                <td><strong>{c.title}</strong></td>
                                                <td>{c.category}</td>
                                                <td><span style={{ fontFamily: 'monospace' }}>{c.urn}</span></td>
                                                <td>Priority: {c.sort_order}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => startEdit('certificate', c)} className="admin-btn-edit" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete('certificate', c.id)} className="admin-btn-delete"><Trash size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- 11. Guest Inquiries --- */}
                    {activeTab === 'messages' && (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Sender</th>
                                        <th>Contact Details</th>
                                        <th>Message Body</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((msg) => (
                                        <tr key={msg.id} style={{ backgroundColor: msg.status === 'unread' ? 'rgba(251, 191, 36, 0.05)' : 'transparent' }}>
                                            <td><strong>{msg.name}</strong></td>
                                            <td>
                                                <div>{msg.email}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{msg.phone}</div>
                                            </td>
                                            <td style={{ fontSize: '13px', maxWidth: '300px' }}>{msg.message}</td>
                                            <td>
                                                <span className={`admin-badge ${msg.status === 'unread' ? 'admin-badge-pending' : 'admin-badge-success'}`}>
                                                    {msg.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {msg.status === 'unread' ? (
                                                        <button onClick={() => handleMessageStatus(msg.id, 'read')} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '11px' }}>
                                                            Mark Read
                                                        </button>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Check size={14} /> Handled
                                                        </span>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteMessage(msg.id)} 
                                                        className="admin-btn-delete" 
                                                        title="Delete Enquiry"
                                                        style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        <Trash size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedItems.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No messages received.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- 12. Volunteer Applications --- */}
                    {activeTab === 'volunteers' && (
                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Contact Info</th>
                                        <th>Message / Motivation</th>
                                        <th>Status</th>
                                        <th>Decision</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedItems.map((v) => (
                                        <tr key={v.id}>
                                            <td><strong>{v.name}</strong></td>
                                            <td>
                                                <div>{v.email}</div>
                                                <div>{v.phone}</div>
                                            </td>
                                            <td style={{ fontSize: '13px' }}>{v.message || '-'}</td>
                                            <td>
                                                <span className={`admin-badge ${v.status === 'accepted' ? 'admin-badge-success' : v.status === 'rejected' ? 'admin-badge-failed' : 'admin-badge-pending'}`}>
                                                    {v.status}
                                                </span>
                                            </td>
                                            <td>
                                                {v.status === 'pending' ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => handleVolunteerStatus(v.id, 'accepted')} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '11px' }}>
                                                            Accept
                                                        </button>
                                                        <button onClick={() => handleVolunteerStatus(v.id, 'rejected')} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '11px', color: '#ef4444', borderColor: '#ef4444' }}>
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedItems.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No volunteer applications.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* --- 13. Site Settings --- */}
                    {activeTab === 'settings' && (
                         <div>
                             {/* Brand uploads */}
                             <div className="admin-card" style={{ marginBottom: '24px' }}>
                                 <h3 style={{ marginBottom: '20px' }}>Update Site Branding & Logos</h3>
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                                     <ImageUpload 
                                         label="Website Logo" 
                                         value={settings?.logo_url}
                                         onChange={async (file) => {
                                             if (!file) return;
                                             try {
                                                 setSaveProgress("Uploading image...");
                                                 const res = await api.uploadImage(file, token);
                                                 if (res.error) throw new Error(res.error);
                                                 setSaveProgress("Saving data...");
                                                 const updated = await api.updateSettings({ logo_url: res.url }, token);
                                                 if (!updated || updated.error) throw new Error(updated?.error || "Save failed");
                                                 await verifySync('settings', 'settings', [res.url]);
                                                 setSaveProgress(null);
                                                 showToast('Website logo successfully updated!', "success");
                                                 loadTabData();
                                             } catch (err) {
                                                 setSaveProgress(null);
                                                 showToast('Failed to save settings: ' + err.message, "error");
                                             }
                                         }}
                                     />
                                     <ImageUpload 
                                         label="Website Favicon" 
                                         value={settings?.favicon_url}
                                         onChange={async (file) => {
                                             if (!file) return;
                                             try {
                                                 setSaveProgress("Uploading image...");
                                                 const res = await api.uploadImage(file, token);
                                                 if (res.error) throw new Error(res.error);
                                                 setSaveProgress("Saving data...");
                                                 const updated = await api.updateSettings({ favicon_url: res.url }, token);
                                                 if (!updated || updated.error) throw new Error(updated?.error || "Save failed");
                                                 await verifySync('settings', 'settings', [res.url]);
                                                 setSaveProgress(null);
                                                 showToast('Favicon successfully updated!', "success");
                                                 loadTabData();
                                             } catch (err) {
                                                 setSaveProgress(null);
                                                 showToast('Failed to save settings: ' + err.message, "error");
                                             }
                                         }}
                                     />
                                 </div>
                             </div>

                             {/* Web details */}
                             <div className="admin-card">
                                 <h3 style={{ marginBottom: '20px' }}>Global NGO Coordinates & Impact Statistics</h3>
                                 <form onSubmit={(e) => handleSubmitItem(e, 'settings')} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                     <div className="form-group">
                                         <label>Help Desk Phone</label>
                                         <input type="text" className="form-control" value={editSettings.phone} onChange={(e) => setEditSettings({...editSettings, phone: e.target.value})} />
                                     </div>
                                     <div className="form-group">
                                         <label>Official Email</label>
                                         <input type="email" className="form-control" value={editSettings.email} onChange={(e) => setEditSettings({...editSettings, email: e.target.value})} />
                                     </div>
                                     <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                         <label>Registered Address</label>
                                         <textarea className="form-control" rows="2" value={editSettings.address} onChange={(e) => setEditSettings({...editSettings, address: e.target.value})}></textarea>
                                     </div>
                                     <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                         <label>Footer Legal Notice</label>
                                         <textarea className="form-control" rows="2" value={editSettings.footer_text} onChange={(e) => setEditSettings({...editSettings, footer_text: e.target.value})}></textarea>
                                     </div>
                                     
                                     {/* Dynamic statistics modifiers */}
                                     <div className="form-group">
                                         <label>Stat: Children Educated</label>
                                         <input type="number" className="form-control" value={editSettings.stat_children} onChange={(e) => setEditSettings({...editSettings, stat_children: e.target.value})} />
                                     </div>
                                     <div className="form-group">
                                         <label>Stat: Medical Camps Done</label>
                                         <input type="number" className="form-control" value={editSettings.stat_camps} onChange={(e) => setEditSettings({...editSettings, stat_camps: e.target.value})} />
                                     </div>
                                     <div className="form-group">
                                         <label>Stat: Women Vocations Enabled</label>
                                         <input type="number" className="form-control" value={editSettings.stat_women} onChange={(e) => setEditSettings({...editSettings, stat_women: e.target.value})} />
                                     </div>
                                     <div className="form-group">
                                         <label>Stat: Funds Utilized (in Lakhs, e.g. 85)</label>
                                         <input type="number" className="form-control" value={editSettings.stat_funds} onChange={(e) => setEditSettings({...editSettings, stat_funds: e.target.value})} />
                                     </div>

                                     <button type="submit" className="btn btn-primary" disabled={!!saveProgress} style={{ gridColumn: 'span 2', width: 'fit-content', marginTop: '12px' }}>
                                         Save NGO Profile Settings
                                     </button>
                                 </form>
                             </div>
                         </div>
                     )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', alignItems: 'center' }}>
                            <button 
                                className="btn btn-secondary btn-sm" 
                                disabled={currentPage === 1} 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                className="btn btn-secondary btn-sm" 
                                disabled={currentPage === totalPages} 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Next
                            </button>
                        </div>
                    )}

                </div>
            </main>

            {saveProgress && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 999999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px'
                }}>
                    <style>{`
                        @keyframes spin-loader {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                    <div style={{
                        height: '50px',
                        width: '50px',
                        border: '4px solid rgba(255, 255, 255, 0.1)',
                        borderTopColor: '#10b981',
                        borderRadius: '50%',
                        animation: 'spin-loader 1s linear infinite'
                    }}></div>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>
                        {saveProgress}
                    </span>
                    <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '-8px' }}>
                        Please wait...
                    </span>
                </div>
            )}

            {successState && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 999999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px'
                }}>
                    <style>{`
                        @keyframes scale-up {
                            0% { transform: scale(0.6); opacity: 0; }
                            100% { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                    <div style={{
                        height: '80px',
                        width: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '40px',
                        fontWeight: 'bold',
                        animation: 'scale-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
                    }}>
                        ✓
                    </div>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px', marginTop: '10px' }}>
                        ✓ {successState}
                    </span>
                </div>
            )}
        </div>
    );
}
