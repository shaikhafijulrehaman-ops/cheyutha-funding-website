const app = require('./src/app');
require('dotenv').config();

const { runMigrations } = require('./src/config/migrations');

const PORT = process.env.PORT || 5000;

async function startServer() {
    await runMigrations();

    app.listen(PORT, () => {
        console.log(`==================================================`);
        console.log(`  Cheyutha Helping Society Backend Server Runing   `);
        console.log(`  Port: http://localhost:${PORT}                   `);
        console.log(`  Environment: ${process.env.USE_MOCK_DATA === 'true' ? 'Mock Database Enabled' : 'Supabase Active'}`);
        console.log(`==================================================`);
    });
}

startServer();
