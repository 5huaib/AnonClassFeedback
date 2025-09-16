// server.js

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const PORT = 3001;

app.use(cors());
app.use(express.json());

// New In-Memory "Database"
let feedbackSessions = {};

// Real-time connections tracking
let connectedUsers = {}; // classId -> { teachers: [], students: [] }

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Join a class room for real-time updates
    socket.on('join-class', (data) => {
        const { classId, userType } = data; // userType: 'teacher' or 'student'
        socket.join(classId);
        
        if (!connectedUsers[classId]) {
            connectedUsers[classId] = { teachers: [], students: [] };
        }
        
        if (userType === 'teacher') {
            connectedUsers[classId].teachers.push(socket.id);
            console.log(`👨‍🏫 Teacher joined class ${classId}`);
        } else {
            connectedUsers[classId].students.push(socket.id);
            console.log(`👨‍🎓 Student joined class ${classId}`);
        }
        
        // Send current connection count to teacher
        io.to(classId).emit('user-count-updated', {
            studentCount: connectedUsers[classId].students.length,
            teacherCount: connectedUsers[classId].teachers.length
        });
    });

    // Handle real-time rating submission
    socket.on('submit-real-time-rating', (data) => {
        const { classId, topicId, rating } = data;
        console.log(`📊 Real-time rating received: Class ${classId}, Topic ${topicId}, Rating ${rating}`);
        
        // Broadcast to teachers in the class
        socket.to(classId).emit('new-rating-received', {
            topicId,
            rating,
            timestamp: new Date()
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`👤 User disconnected: ${socket.id}`);
        
        // Remove from all classes
        Object.keys(connectedUsers).forEach(classId => {
            const classUsers = connectedUsers[classId];
            const teacherIndex = classUsers.teachers.indexOf(socket.id);
            const studentIndex = classUsers.students.indexOf(socket.id);
            
            if (teacherIndex > -1) {
                classUsers.teachers.splice(teacherIndex, 1);
            }
            if (studentIndex > -1) {
                classUsers.students.splice(studentIndex, 1);
            }
            
            // Update user count
            io.to(classId).emit('user-count-updated', {
                studentCount: classUsers.students.length,
                teacherCount: classUsers.teachers.length
            });
        });
    });
});

console.log("Backend server starting with real-time topic-based feedback system...");

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
            
            // Emit real-time update to teachers
            io.to(classId).emit('rating-updated', {
                topicId: rating.topicId,
                newRating: rating.score,
                averageRating: topic.ratings.reduce((a, b) => a + b, 0) / topic.ratings.length,
                totalResponses: topic.ratings.length,
                timestamp: new Date()
            });
        }
    });

    if (generalComment) {
        const newComment = { text: generalComment, timestamp: new Date() };
        session.generalComments.push(newComment);
        
        // Emit new comment to teachers
        io.to(classId).emit('new-comment', newComment);
    }

    // Emit overall statistics update
    const totalRatings = session.topics.reduce((sum, topic) => sum + topic.ratings.length, 0);
    const avgRating = session.topics.reduce((sum, topic) => {
        const topicAvg = topic.ratings.length > 0 ? topic.ratings.reduce((a, b) => a + b, 0) / topic.ratings.length : 0;
        return sum + topicAvg;
    }, 0) / session.topics.length;

    io.to(classId).emit('stats-updated', {
        totalResponses: totalRatings,
        averageRating: avgRating.toFixed(1),
        totalComments: session.generalComments.length
    });

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

// --- New endpoint for real-time rating during class ---
app.post('/api/feedback/:classId/live-rating', (req, res) => {
    const { classId } = req.params;
    const { topicId, rating } = req.body;
    const session = feedbackSessions[classId];

    if (!session) {
        return res.status(404).json({ error: 'Class session not found.' });
    }

    const topic = session.topics.find(t => t.id === topicId);
    if (!topic) {
        return res.status(404).json({ error: 'Topic not found.' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
        return res.status(400).json({ error: 'Rating must be a number between 1 and 10.' });
    }

    // Add the rating
    topic.ratings.push(rating);

    // Calculate new average
    const averageRating = topic.ratings.reduce((a, b) => a + b, 0) / topic.ratings.length;

    // Emit real-time update to all connected users in the class
    io.to(classId).emit('live-rating-update', {
        topicId,
        rating,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalResponses: topic.ratings.length,
        timestamp: new Date()
    });

    res.status(200).json({ 
        message: 'Live rating recorded',
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalResponses: topic.ratings.length
    });
});

// --- Get real-time stats for a class ---
app.get('/api/class/:classId/live-stats', (req, res) => {
    const { classId } = req.params;
    const session = feedbackSessions[classId];

    if (!session) {
        return res.status(404).json({ error: 'Class session not found.' });
    }

    const stats = {
        connectedStudents: connectedUsers[classId] ? connectedUsers[classId].students.length : 0,
        connectedTeachers: connectedUsers[classId] ? connectedUsers[classId].teachers.length : 0,
        totalTopics: session.topics.length,
        totalRatings: session.topics.reduce((sum, topic) => sum + topic.ratings.length, 0),
        totalComments: session.generalComments.length
    };

    res.status(200).json(stats);
});

server.listen(PORT, () => {
    console.log(`🚀 Backend server is running successfully on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO enabled for real-time functionality`);
});