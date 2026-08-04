-- Cheyutha Helping Society - Production-Ready Supabase PostgreSQL Schema
-- Enforces clean relations, indexes, and Cloudinary public_id asset lifecycles.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
    page_path VARCHAR(100) PRIMARY KEY, -- e.g. '/', '/transparency', '/admin'
    meta_title VARCHAR(200) NOT NULL,
    meta_description TEXT NOT NULL,
    meta_keywords TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Homepage Content Table
CREATE TABLE IF NOT EXISTS homepage_content (
    section VARCHAR(50) PRIMARY KEY, -- e.g. 'hero', 'about', 'story', 'mission'
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Hero Slider Table
CREATE TABLE IF NOT EXISTS hero_slider (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_public_id TEXT NOT NULL,
    cta_text VARCHAR(50),
    cta_link VARCHAR(200),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote TEXT NOT NULL,
    author VARCHAR(100) DEFAULT 'Anonymous',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Community Members Table
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    image_public_id TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Programs Table
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    image_public_id TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Ground Actions Table (Supports Cover + multiple gallery images)
CREATE TABLE IF NOT EXISTS ground_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    cover_image TEXT NOT NULL,
    cover_image_public_id TEXT NOT NULL,
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { url, public_id }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Gallery Albums Table (Supports Album Cover + multiple gallery images)
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_title VARCHAR(200) NOT NULL,
    description TEXT,
    cover_image TEXT NOT NULL,
    cover_image_public_id TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { url, public_id }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    logo_url TEXT NOT NULL,
    logo_public_id TEXT NOT NULL,
    website VARCHAR(200),
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. News Table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    published_date DATE NOT NULL,
    cover_image TEXT,
    cover_image_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL, -- e.g. "10:00 AM"
    location VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Planned', -- Planned, Ongoing, Completed, Cancelled
    cover_image TEXT,
    cover_image_public_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Donation Campaigns Table
CREATE TABLE IF NOT EXISTS donation_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    goal_amount NUMERIC(12, 2) NOT NULL,
    raised_amount NUMERIC(12, 2) DEFAULT 0.00,
    image_url TEXT,
    image_public_id TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Donations Table
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name VARCHAR(100) NOT NULL,
    donor_email VARCHAR(100) NOT NULL,
    donor_phone VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    pan_number VARCHAR(10),
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed
    receipt_no VARCHAR(50),
    campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    message TEXT NOT NULL,
    avatar_url TEXT,
    avatar_public_id TEXT,
    rating INT DEFAULT 5,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT,
    skills TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread', -- unread, read
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 19. Certificates & Documents Table
CREATE TABLE IF NOT EXISTS certificates_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Tax Exemption, Registration, Annual Report
    urn VARCHAR(100),
    file_url TEXT NOT NULL,
    file_public_id TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --- INDEXES FOR QUERY OPTIMIZATION ---
CREATE INDEX IF NOT EXISTS idx_donations_order ON donations(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_members_sort ON community_members(sort_order);
CREATE INDEX IF NOT EXISTS idx_programs_sort ON programs(sort_order);
CREATE INDEX IF NOT EXISTS idx_sponsors_sort ON sponsors(sort_order);
CREATE INDEX IF NOT EXISTS idx_ground_actions_date ON ground_actions(date);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published_date);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_slider_sort ON hero_slider(sort_order);

-- --- ENABLE ROW LEVEL SECURITY (RLS) ---
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slider ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ground_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates_documents ENABLE ROW LEVEL SECURITY;

-- --- SECURITY POLICIES ---

-- 1. Public Read Policies (Allow anyone to view public site info)
CREATE POLICY "Allow public SELECT on settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on seo" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on homepage" ON homepage_content FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on slider" ON hero_slider FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on quotes" ON quotes FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on members" ON community_members FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on ground_actions" ON ground_actions FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on sponsors" ON sponsors FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on news" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on campaigns" ON donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public SELECT on certificates" ON certificates_documents FOR SELECT USING (true);

-- 2. Public Write Policies (Allow anyone to submit contact messages, volunteer applications, and donations)
CREATE POLICY "Allow public INSERT on messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public INSERT on volunteers" ON volunteers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public INSERT on donations" ON donations FOR INSERT WITH CHECK (true);

-- 3. Admin Full Control Policies (Allow full access to authenticated users / backend clients)
CREATE POLICY "Admin full access on admin_users" ON admin_users FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on settings" ON website_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on seo" ON seo_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on homepage" ON homepage_content FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on slider" ON hero_slider FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on quotes" ON quotes FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on members" ON community_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on programs" ON programs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on ground_actions" ON ground_actions FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on gallery" ON gallery FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on sponsors" ON sponsors FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on news" ON news FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on events" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on campaigns" ON donation_campaigns FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on donations" ON donations FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on testimonials" ON testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on volunteers" ON volunteers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on messages" ON contact_messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access on certificates" ON certificates_documents FOR ALL TO authenticated USING (true);
