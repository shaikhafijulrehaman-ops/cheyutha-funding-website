const { Client } = require('pg');

async function runMigrations() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.warn('⚠️ [Migrations] DATABASE_URL is not set in .env. Skipping automatic schema migrations.');
        return;
    }

    console.log('🔄 [Migrations] Starting automatic database migrations...');
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        const migrations = [
            `ALTER TABLE hero_slider ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE hero_slider ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE hero_slider ADD COLUMN IF NOT EXISTS cta_text VARCHAR(50);`,
            `ALTER TABLE hero_slider ADD COLUMN IF NOT EXISTS cta_link VARCHAR(200);`,
            `ALTER TABLE hero_slider ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;`,
            `ALTER TABLE hero_slider ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE community_members ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE community_members ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE community_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE programs ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;`,
            `ALTER TABLE programs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE ground_actions ADD COLUMN IF NOT EXISTS cover_image TEXT;`,
            `ALTER TABLE ground_actions ADD COLUMN IF NOT EXISTS cover_image_public_id TEXT;`,
            `ALTER TABLE ground_actions ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]';`,
            `ALTER TABLE ground_actions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE gallery ADD COLUMN IF NOT EXISTS cover_image TEXT;`,
            `ALTER TABLE gallery ADD COLUMN IF NOT EXISTS cover_image_public_id TEXT;`,
            `ALTER TABLE gallery ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';`,
            `ALTER TABLE gallery ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS logo_url TEXT;`,
            `ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS logo_public_id TEXT;`,
            `ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE news ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE news ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE events ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE donation_campaigns ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE donation_campaigns ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE donation_campaigns ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS image_url TEXT;`,
            `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS image_public_id TEXT;`,
            `ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`,

            `ALTER TABLE certificates_documents ADD COLUMN IF NOT EXISTS file_url TEXT;`,
            `ALTER TABLE certificates_documents ADD COLUMN IF NOT EXISTS file_public_id TEXT;`,
            `ALTER TABLE certificates_documents ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;`,
            `ALTER TABLE certificates_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`
        ];

        for (const query of migrations) {
            await client.query(query);
        }

        console.log('✅ [Migrations] Database migrations completed successfully.');
    } catch (err) {
        console.error('❌ [Migrations] Database migration failed:', err.message);
    } finally {
        await client.end().catch(() => {});
    }
}

module.exports = { runMigrations };
