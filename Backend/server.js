const path = require('path');
const express = require('express');

// Global error handlers and process monitoring
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', {
    error: err.message,
    stack: err.stack,
    code: err.code,
    time: new Date().toISOString()
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
    time: new Date().toISOString()
  });
});

// Log environment info on startup
console.log('Server starting with environment:', {
  nodeEnv: process.env.NODE_ENV,
  hasDbUrl: !!process.env.DATABASE_URL,
  hasVercelToken: !!process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  platform: process.env.VERCEL ? 'vercel' : 'local',
  region: process.env.VERCEL_REGION,
  buildPath: path.join(__dirname, 'frontend/dist')
});

const cors = require('cors');
const { Pool } = require('pg');

// Configure database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Vercel has a limit of 1 concurrent connection per instance
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  connectionTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 10000, // 10 seconds
  allowExitOnIdle: true
});

// Add event handlers for the pool
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', {
    error: err.message,
    code: err.code,
    time: new Date().toISOString()
  });
});

// Middleware to ensure database connection
const ensureDbConnection = async (req, res, next) => {
  if (!pool) {
    console.error('Database pool not initialized');
    return res.status(500).json({ error: 'Database configuration error' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1'); // Simple connection test
      next();
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection failed:', {
      error: error.message,
      code: error.code,
      time: new Date().toISOString()
    });
    res.status(500).json({ error: 'Database connection failed' });
  }
};

const app = express();
const PORT = process.env.PORT || 3001;
const buildPath = path.join(__dirname, 'frontend/dist');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Use database connection middleware for all API routes
app.use('/api', ensureDbConnection);

// Serve static files from the frontend build directory
app.use(express.static(buildPath));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Utility function to get database connection
const getConnection = async () => {
  const client = await pool.connect();
  console.log('New database connection established');
  
  const query = async (sql, params = []) => {
    try {
      const start = Date.now();
      const result = await client.query(sql, params);
      const duration = Date.now() - start;
      console.log('Executed query', { sql, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query error', { sql, error });
      throw error;
    }
  };

  return { client, query };
};

// Health check endpoint with detailed diagnostics
app.get('/api/health', async (req, res) => {
  console.log('Health check requested');
  try {
    // Check bypass token
    const token = req.query.bypassToken || req.headers['x-vercel-bypass'];
    if (token !== process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      console.warn('Health check: Invalid bypass token');
      return res.status(403).json({ error: 'Invalid bypass token' });
    }

    // Test database connection
    const client = await pool.connect();
    try {
      const dbResult = await client.query('SELECT NOW()');
      
      // Return detailed health status
      res.json({
        status: 'ok',
        time: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          platform: process.env.VERCEL ? 'vercel' : 'local',
          region: process.env.VERCEL_REGION
        },
        database: {
          connected: true,
          timestamp: dbResult.rows[0].now
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Health check failed:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      time: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.env.VERCEL ? 'vercel' : 'local',
        region: process.env.VERCEL_REGION
      }
    });
  }
});

// New In-Memory "Database"
let feedbackSessions = {};

console.log("Backend server starting with topic-based feedback system...");

// --- Endpoint for a teacher to SETUP a class with topics ---
app.post('/api/class/:classId/setup', async (req, res) => {
    console.log('Class setup endpoint called');
    
    // Log request details
    const requestInfo = {
        classId: req.params.classId,
        topics: req.body.topics,
        headers: req.headers,
        method: req.method,
        path: req.path,
        query: req.query,
        timestamp: new Date().toISOString()
    };
    console.log('Setup request details:', requestInfo);

    const { classId } = req.params;
    const { topics } = req.body;

    // Validate classId
    if (!classId || typeof classId !== 'string' || classId.trim().length === 0) {
        console.log('Invalid classId:', classId);
        return res.status(400).json({ error: 'A valid class ID is required.' });
    }

    // Validate topics
    if (!topics || !Array.isArray(topics)) {
        console.log('Invalid topics (not an array):', topics);
        return res.status(400).json({ error: 'Topics must be an array.' });
    }

    if (topics.length === 0) {
        console.log('Empty topics array');
        return res.status(400).json({ error: 'At least one topic is required.' });
    }

    // Validate each topic
    for (const topic of topics) {
        if (typeof topic !== 'string' || topic.trim().length === 0) {
            console.log('Invalid topic found:', topic);
            return res.status(400).json({ error: 'Each topic must be a non-empty string.' });
        }
    }

    try {
        console.log('Attempting to connect to database...');
        const client = await pool.connect();
        console.log('Database connection established');
        
        try {
            console.log('Starting transaction...');
            await client.query('BEGIN');
            
            console.log('Creating class session for:', classId);
            console.log('Clearing existing topics...');
            // First, clear any existing topics for this class
            await client.query('DELETE FROM topics WHERE class_id = $1', [classId]);
            console.log('Existing topics cleared successfully');
            
            // Create or update class session
            const sessionResult = await client.query(
                'INSERT INTO class_sessions (class_id, created_at) VALUES ($1, NOW()) ON CONFLICT (class_id) DO UPDATE SET created_at = NOW() RETURNING *',
                [classId]
            );
            console.log('Class session created/updated:', sessionResult.rows[0]);

            // Insert topics sequentially within the transaction
            const insertedTopics = [];
            for (const topic of topics) {
                const topicResult = await client.query(
                    'INSERT INTO topics (class_id, name) VALUES ($1, $2) RETURNING *',
                    [classId, topic.trim()]
                );
                console.log('Topic created:', topicResult.rows[0]);
                insertedTopics.push(topicResult.rows[0]);
            }

            await client.query('COMMIT');
            console.log('Transaction committed successfully');
            
            res.status(201).json({ 
                message: `Session for ${classId} created successfully.`,
                session: sessionResult.rows[0],
                topics: insertedTopics
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err; // Re-throw to be caught by outer catch
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Database error in /api/class/:classId/setup:', err);
        // Return error details in non-production for easier debugging
        const errorResponse = {
            error: 'Database error.',
            message: err.message,
            details: process.env.NODE_ENV !== 'production' ? {
                code: err.code,
                detail: err.detail,
                where: err.where,
                table: err.table,
                constraint: err.constraint
            } : undefined
        };
        res.status(500).json(errorResponse);
    }
});

// --- Endpoint for a student to GET the topics for a class ---
app.get('/api/class/:classId/topics', async (req, res) => {
    const { classId } = req.params;
    try {
        // Check if class session exists
        const sessionResult = await pool.query(
            'SELECT * FROM class_sessions WHERE class_id = $1',
            [classId]
        );
        if (sessionResult.rowCount === 0) {
            return res.status(404).json({ error: 'Feedback session for this class has not been set up yet.' });
        }
        // Fetch topics for the class
        const topicsResult = await pool.query(
            'SELECT id, name FROM topics WHERE class_id = $1',
            [classId]
        );
        const topicsForStudent = topicsResult.rows;
        res.status(200).json({ topics: topicsForStudent });
    } catch (err) {
        console.error('Database error in /api/class/:classId/topics:', err);
        res.status(500).json({ error: 'Database error.' });
    }
});

// --- Endpoint for a student to SUBMIT feedback ---
app.post('/api/feedback/:classId', async (req, res) => {
    const { classId } = req.params;
    const { ratings, generalComment } = req.body;

    // Validate input
    if (!ratings || !Array.isArray(ratings)) {
        return res.status(400).json({ error: 'An array of ratings is required.' });
    }

    try {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if class exists
            const sessionResult = await client.query(
                'SELECT * FROM class_sessions WHERE class_id = $1',
                [classId]
            );
            if (sessionResult.rowCount === 0) {
                return res.status(404).json({ error: 'Class session not found.' });
            }

            // Insert ratings
            for (const rating of ratings) {
                if (!rating.topicId || typeof rating.score !== 'number' || rating.score < 1 || rating.score > 10) {
                    throw new Error('Invalid rating format');
                }
                await client.query(
                    'INSERT INTO ratings (topic_id, score) VALUES ($1, $2)',
                    [rating.topicId, rating.score]
                );
            }

            // Insert general comment if provided
            if (generalComment) {
                await client.query(
                    'INSERT INTO comments (class_id, text) VALUES ($1, $2)',
                    [classId, generalComment]
                );
            }

            await client.query('COMMIT');
            res.status(201).json({ message: 'Feedback submitted successfully!' });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ 
            error: 'Failed to submit feedback',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
    }
});

// --- Endpoint for a teacher to GET the feedback SUMMARY ---
app.get('/api/feedback/:classId/summary', async (req, res) => {
    const { classId } = req.params;

    try {
        const client = await pool.connect();
        try {
            // Get topics with average ratings
            const topicsResult = await client.query(`
                SELECT 
                    t.id,
                    t.name,
                    COALESCE(AVG(r.score)::numeric(10,2), 0) as average_rating,
                    COUNT(r.id) as rating_count
                FROM topics t
                LEFT JOIN ratings r ON r.topic_id = t.id
                WHERE t.class_id = $1
                GROUP BY t.id, t.name
            `, [classId]);

            // Get comments
            const commentsResult = await client.query(
                'SELECT text, created_at as timestamp FROM comments WHERE class_id = $1 ORDER BY created_at DESC',
                [classId]
            );

            res.status(200).json({
                topics: topicsResult.rows,
                generalComments: commentsResult.rows
            });
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error getting feedback summary:', err);
        res.status(500).json({ 
            error: 'Failed to get feedback summary',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message
        });
    }
});

// -----------DEPLOYMENT-----------
// Catch-all handler: serve React app for any non-API routes
app.use((req, res) => {
  // Check if this is an API route - if so, don't serve the frontend
  if (req.path.startsWith('/api/')) {
    console.log('API route not found:', req.path);
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  const indexPath = path.join(buildPath, "index.html");
  console.log('Serving frontend from:', indexPath);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application. Please try again.');
    }
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export the app for Vercel serverless
module.exports = app;
