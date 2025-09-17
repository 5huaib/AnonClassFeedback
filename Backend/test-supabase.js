require('dotenv').config();
const { Pool } = require('pg');

async function testSupabaseConnection() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Attempting to connect to Supabase...');
        const client = await pool.connect();
        console.log('Successfully connected! 🎉');

        console.log('\nTesting database queries...');
        const result = await client.query('SELECT current_database(), version();');
        console.log('Database info:', result.rows[0]);

        console.log('\nChecking tables...');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Available tables:', tables.rows.map(t => t.table_name));

        client.release();
        await pool.end();

    } catch (err) {
        console.error('Connection failed:', {
            message: err.message,
            code: err.code,
            detail: err.detail
        });
    }
}

testSupabaseConnection();
