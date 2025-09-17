// server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;
const buildPath = path.join(__dirname, 'frontend');

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static files from the frontend build directory
app.use(express.static(buildPath));

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

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ error: 'An array of topics is required.' });
    }

    try {
        // Create class session
        await pool.query(
          'INSERT INTO class_sessions (class_id, created_at) VALUES ($1, NOW()) ON CONFLICT (class_id) DO NOTHING',
          [classId]
        );
        // Insert topics
        for (const name of topics) {
          await pool.query(
            'INSERT INTO topics (class_id, name) VALUES ($1, $2)',
            [classId, name]
          );
        }
        res.status(201).json({ message: `Session for ${classId} created successfully.` });
    } catch (err) {
        console.error('Database error in /api/class/:classId/setup:', err);
        // Return error details in non-production for easier debugging
        if (process.env.NODE_ENV !== 'production') {
            res.status(500).json({ error: 'Database error.', details: err.message });
        } else {
            res.status(500).json({ error: 'Database error.' });
        }
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

// -----------STATIC FILES & FRONTEND ROUTING-----------
// Serve static files from frontend build
const staticBuildPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(staticBuildPath));

// -----------DEPLOYMENT-----------
// Catch-all handler: serve React app for any non-API routes
app.use((req, res) => {
  // Check if this is an API route - if so, don't serve the frontend
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  const fs = require('fs');
  const indexPath = path.join(staticBuildPath, "index.html");
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend not built. Please run 'npm run build' in the frontend directory.");
  }
});

// Export the app for Vercel serverless
module.exports = app;
