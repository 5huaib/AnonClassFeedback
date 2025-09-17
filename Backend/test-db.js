const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to database');

    // Test tables existence
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Available tables:', tables.rows);

    // Test class creation
    const testClass = {
      classId: 'test-class-' + Date.now(),
      topics: ['Topic 1', 'Topic 2']
    };

    // Start transaction
    await client.query('BEGIN');

    // Create class session
    const sessionResult = await client.query(
      'INSERT INTO class_sessions (class_id, created_at) VALUES ($1, NOW()) RETURNING *',
      [testClass.classId]
    );
    console.log('Created class session:', sessionResult.rows[0]);

    // Create topics
    for (const topic of testClass.topics) {
      const topicResult = await client.query(
        'INSERT INTO topics (class_id, name) VALUES ($1, $2) RETURNING *',
        [testClass.classId, topic]
      );
      console.log('Created topic:', topicResult.rows[0]);
    }

    await client.query('COMMIT');
    console.log('Test completed successfully');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Test failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

testDatabase().catch(console.error);
