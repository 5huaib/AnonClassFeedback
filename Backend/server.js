// server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// New In-Memory "Database"
let feedbackSessions = {};

console.log("Backend server starting with topic-based feedback system...");

// --- Endpoint for a teacher to SETUP a class with topics ---
app.post('/api/class/:classId/setup', (req, res) => {
    const { classId } = req.params;
    const { topics } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ error: 'An array of topics is required.' });
    }

    feedbackSessions[classId] = {
        createdAt: new Date(),
        // Map topic names to objects with an ID and an empty ratings array
        topics: topics.map((name, index) => ({
            id: index + 1, // Simple ID generation
            name: name,
            ratings: []
        })),
        generalComments: []
    };

    console.log(`Class session created/updated for ${classId} with topics:`, topics);
    res.status(201).json({ message: `Session for ${classId} created successfully.` });
});

// --- Endpoint for a student to GET the topics for a class ---
app.get('/api/class/:classId/topics', (req, res) => {
    const { classId } = req.params;
    const session = feedbackSessions[classId];

    if (!session) {
        return res.status(404).json({ error: 'Feedback session for this class has not been set up yet.' });
    }

    // Students only need the ID and name to rate them
    const topicsForStudent = session.topics.map(t => ({ id: t.id, name: t.name }));
    res.status(200).json({ topics: topicsForStudent });
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

app.listen(PORT, () => {
    console.log(`Backend server is running successfully on http://localhost:${PORT}`);
});