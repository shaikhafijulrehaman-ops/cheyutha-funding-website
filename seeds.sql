-- Cheyutha Helping Society - Production-Ready Bootstrapping Seed Script
-- Copy and paste this directly into your Supabase SQL Editor to initialize systems.

-- 1. Truncate all records for a clean start
TRUNCATE admin_users, website_settings, seo_settings, homepage_content, hero_slider, quotes, community_members, programs, ground_actions, gallery, sponsors, news, events, donation_campaigns, donations, testimonials, volunteers, contact_messages, certificates_documents CASCADE;

-- 2. Seed Default Administrator Account (Credentials: admin@cheyutha.org / admin123)
INSERT INTO admin_users (email, password_hash, name) VALUES
('admin@cheyutha.org', '$2b$10$f9BV5AncBR84LelgIlm6COUD85sn9N.zAg6DwbTnYkoWyEi/VnV6S', 'Cheyutha Admin');

-- 3. Seed Website Settings (Initial empty state)
INSERT INTO website_settings (key, value) VALUES
('organization_name', '{"val": "Cheyutha Helping Society"}'),
('phone', '{"val": ""}'),
('email', '{"val": ""}'),
('address', '{"val": ""}'),
('gmaps_link', '{"val": ""}'),
('social_facebook', '{"val": ""}'),
('social_twitter', '{"val": ""}'),
('social_instagram', '{"val": ""}'),
('meta_title', '{"val": "Cheyutha Helping Society | Trusted Legal NGO in Andhra Pradesh"}'),
('meta_description', '{"val": "Cheyutha Helping Society is a registered NGO under section 80G & 12A."}'),
('footer_text', '{"val": "© 2026 Cheyutha Helping Society. All rights reserved. Registered under AP Registration Act (250/2025)."}');

-- 4. Seed Essential SEO Settings for pages
INSERT INTO seo_settings (page_path, meta_title, meta_description, meta_keywords) VALUES
('/', 'Cheyutha Helping Society | Legal NGO in Vijayawada', 'Supporting child education, healthcare camps, and women empowerment in Andhra Pradesh. Registered NGO under 80G & 12A.', 'NGO, Cheyutha, charity, donation, AP registration'),
('/transparency', 'Transparency & Compliance Documents | Cheyutha Helping Society', 'View our legal registration certificates, 80G tax exemptions, 12A certificates, and annual reports.', 'NGO legal certificates, tax exemption, annual audit reports');
