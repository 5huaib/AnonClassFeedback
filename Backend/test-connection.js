require('dotenv').config();
const { Pool } = require('pg');

async function testDatabaseConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Successfully connected to database!');

    // Test simple query
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);

    // Test tables
    console.log('\nChecking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Available tables:', tables.rows.map(r => r.table_name));

    // Close connection
    client.release();
    await pool.end();
    
    console.log('\nDatabase check completed successfully! ✅');
  } catch (err) {
    console.error('\nDatabase connection failed! ❌');
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    process.exit(1);
  }
}

testDatabaseConnection();
