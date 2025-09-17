// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const buildPath = path.join(__dirname, 'frontend/dist');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(buildPath));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set this in Vercel env vars
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// New In-Memory "Database"
let feedbackSessions = {};

console.log("Backend server starting with topic-based feedback system...");

// --- Endpoint for a teacher to SETUP a class with topics ---
app.post('/api/class/:classId/setup', async (req, res) => {
    const { classId } = req.params;
    const { topics } = req.body;

    console.log('Setting up class:', { classId, topics });

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
        console.log('Invalid topics array:', topics);
        return res.status(400).json({ error: 'An array of topics is required.' });
    }

    try {
        console.log('Creating class session for:', classId);
        // First, clear any existing topics for this class
        await pool.query('DELETE FROM topics WHERE class_id = $1', [classId]);
        
        // Create class session
        const sessionResult = await pool.query(
          'INSERT INTO class_sessions (class_id, created_at) VALUES ($1, NOW()) ON CONFLICT (class_id) DO UPDATE SET created_at = NOW() RETURNING *',
          [classId]
        );
        console.log('Class session created/updated:', sessionResult.rows[0]);

        // Insert topics
        for (const name of topics) {
          const topicResult = await pool.query(
            'INSERT INTO topics (class_id, name) VALUES ($1, $2) RETURNING *',
            [classId, name]
          );
          console.log('Topic created:', topicResult.rows[0]);
        }
        res.status(201).json({ message: `Session for ${classId} created successfully.` });
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
app.post('/api/feedback/:classId', (req, res) => {
    const { classId } = req.params;
    const { ratings, generalComment } = req.body;
    const session = feedbackSessions[classId];

    if (!session) {
        return res.status(404).json({ error: 'Class session not found.' });
    }
    if (!ratings || !Array.isArray(ratings)) {
        return res.status(400).json({ error: 'An array of ratings is required.' });
    }

    // Add each rating to the correct topic
    ratings.forEach(rating => {
        const topic = session.topics.find(t => t.id === rating.topicId);
        if (topic && typeof rating.score === 'number' && rating.score >= 1 && rating.score <= 10) {
            topic.ratings.push(rating.score);
        }
    });

    if (generalComment) {
        session.generalComments.push({ text: generalComment, timestamp: new Date() });
    }

    res.status(201).json({ message: 'Feedback submitted successfully!' });
});

// --- Endpoint for a teacher to GET the feedback SUMMARY ---
app.get('/api/feedback/:classId/summary', (req, res) => {
    const { classId } = req.params;
    const session = feedbackSessions[classId];

    if (!session) {
        return res.status(404).json({ error: `No feedback found for class: ${classId}` });
    }

    // --- New Aggregation Logic ---
    const topicSummary = session.topics.map(topic => {
        const ratingCount = topic.ratings.length;
        if (ratingCount === 0) {
            return { id: topic.id, name: topic.name, averageRating: 0, ratingCount: 0 };
        }
        const sum = topic.ratings.reduce((acc, curr) => acc + curr, 0);
        const averageRating = parseFloat((sum / ratingCount).toFixed(2));
        return { id: topic.id, name: topic.name, averageRating, ratingCount };
    });

    const summary = {
        topics: topicSummary,
        generalComments: session.generalComments
    };
    
    res.status(200).json(summary);
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

// Export the app for Vercel serverless
module.exports = app;
