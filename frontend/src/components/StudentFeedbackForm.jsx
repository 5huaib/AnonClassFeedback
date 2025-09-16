// src/components/StudentFeedbackForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { socketUtils } from '../utils/socket';

function StudentFeedbackForm() {
    const { classId } = useParams();
    const [topics, setTopics] = useState([]);
    const [ratings, setRatings] = useState({});
    const [generalComment, setGeneralComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [connectedUsers, setConnectedUsers] = useState({ studentCount: 0, teacherCount: 0 });
    const [liveRatingMode, setLiveRatingMode] = useState(false);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/class/${classId}/topics`);
                setTopics(response.data.topics);
                
                // Connect to socket for real-time features
                socketUtils.connect();
                socketUtils.joinClass(classId, 'student');
                
                // Listen for user count updates
                socketUtils.onUserCountUpdate(setConnectedUsers);
                
            } catch (err) {
                setError('Could not load topics. The teacher may not have set up this session yet.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();

        return () => {
            socketUtils.offUserCountUpdate();
            socketUtils.disconnect();
        };
    }, [classId]);

    const handleRatingChange = (topicId, score) => {
        setRatings(prevRatings => ({ ...prevRatings, [topicId]: score }));
        
        // If in live rating mode, submit immediately
        if (liveRatingMode) {
            handleLiveRating(topicId, score);
        }
    };

    const handleLiveRating = async (topicId, rating) => {
        try {
            await axios.post(`http://localhost:3001/api/feedback/${classId}/live-rating`, {
                topicId: parseInt(topicId),
                rating: parseInt(rating)
            });
        } catch (error) {
            console.error('Failed to submit live rating:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ratingsArray = Object.keys(ratings).map(topicId => ({
            topicId: parseInt(topicId),
            score: parseInt(ratings[topicId]),
        }));

        if (ratingsArray.length !== topics.length) {
            setError('Please rate all topics before submitting.');
            return;
        }
        try {
            await axios.post(`http://localhost:3001/api/feedback/${classId}`, { ratings: ratingsArray, generalComment });
            setIsSubmitted(true);
        } catch (error) {
            setError('Failed to submit feedback.');
            console.error('Error submitting feedback:', error);
        }
    };

    const getRatingEmoji = (score) => {
        const emojis = {
            1: "😵", 2: "😕", 3: "🤔", 4: "😐", 5: "🙂",
            6: "😊", 7: "😄", 8: "😃", 9: "🤩", 10: "🌟"
        };
        return emojis[score] || "";
    };

    const getRatingText = (score) => {
        const texts = {
            1: "Very Confused", 2: "Quite Confused", 3: "Somewhat Confused",
            4: "Slightly Confused", 5: "Neutral", 6: "Somewhat Clear",
            7: "Pretty Clear", 8: "Very Clear", 9: "Really Clear", 10: "Mastered It!"
        };
        return texts[score] || "Select rating";
    };

    if (isLoading) return <div className="loading">📚 Loading topics for feedback...</div>;
    if (error) return (
        <div className="card">
            <p className="error-message">{error}</p>
            <Link to="/" style={{ 
                display: 'inline-block', 
                marginTop: '1rem',
                padding: '0.8rem 1.5rem',
                background: 'var(--primary-gradient)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
            }}>
                🏠 Back to Home
            </Link>
        </div>
    );
    
    if (isSubmitted) return (
        <div className="card">
            <h2>🎉 Thank You for Your Feedback!</h2>
            <div className="success-message">
                Your anonymous feedback has been submitted successfully! Your input helps make future classes even better.
            </div>
            <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: 'var(--bg-input)', 
                borderRadius: '12px',
                textAlign: 'center'
            }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0 }}>
                    🔒 Your responses are completely anonymous and help improve the learning experience
                </p>
            </div>
            <Link to="/" style={{ 
                display: 'inline-block', 
                marginTop: '2rem',
                padding: '1rem 2rem',
                background: 'var(--primary-gradient)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                width: '100%',
                textAlign: 'center',
                boxSizing: 'border-box'
            }}>
                🏠 Return to Home
            </Link>
        </div>
    );

    return (
        <div className="card">
            <h2>📝 Anonymous Feedback</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Class: <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{classId}</span>
            </p>
            
            {/* Live Connection Status */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(79, 172, 254, 0.1)',
                borderRadius: '8px',
                marginBottom: '2rem',
                border: '1px solid rgba(79, 172, 254, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#4facfe', fontSize: '1.2rem' }}>🟢</span>
                    <span style={{ fontWeight: '600' }}>Live Session</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    👥 {connectedUsers.studentCount} students • 👨‍🏫 {connectedUsers.teacherCount} teachers
                </div>
            </div>

            {/* Live Rating Toggle */}
            <div style={{ 
                background: 'rgba(102, 126, 234, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                marginBottom: '2rem',
                border: '1px solid rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                        ⚡ Live Rating Mode
                    </p>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={liveRatingMode}
                            onChange={(e) => setLiveRatingMode(e.target.checked)}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>Auto-submit ratings</span>
                    </label>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    {liveRatingMode 
                        ? '✅ Ratings will be sent immediately as you select them for real-time feedback'
                        : '📝 Choose this mode to provide instant feedback as topics are discussed'
                    }
                </p>
            </div>

            <div style={{ 
                background: 'rgba(102, 126, 234, 0.1)', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                marginBottom: '2rem',
                border: '1px solid rgba(102, 126, 234, 0.3)'
            }}>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                    🎯 Rate your understanding of each topic (1 = Very Confused, 10 = Mastered It!)
                </p>
            </div>
            
            <form onSubmit={handleSubmit}>
                {topics.map(topic => (
                    <div className="form-group" key={topic.id}>
                        <label>📚 {topic.name}</label>
                        <select 
                            value={ratings[topic.id] || ''} 
                            onChange={(e) => handleRatingChange(topic.id, e.target.value)} 
                            required={!liveRatingMode}
                            style={{
                                border: liveRatingMode && ratings[topic.id] ? '2px solid var(--success-color)' : undefined
                            }}
                        >
                            <option value="" disabled>Choose your understanding level...</option>
                            {[...Array(10).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} - {getRatingEmoji(i + 1)} {getRatingText(i + 1)}
                                </option>
                            ))}
                        </select>
                        {liveRatingMode && ratings[topic.id] && (
                            <div style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--success-color)', 
                                marginTop: '0.5rem',
                                fontWeight: '500'
                            }}>
                                ✅ Rating submitted in real-time
                            </div>
                        )}
                    </div>
                ))}
                
                <div className="form-group">
                    <label>💬 Additional Comments (Optional)</label>
                    <textarea 
                        value={generalComment} 
                        onChange={(e) => setGeneralComment(e.target.value)} 
                        placeholder="Share any additional thoughts about today's class: What went well? What could be improved? Any suggestions?"
                        rows="4"
                    />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        🔒 Your feedback is completely anonymous
                    </p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" disabled={liveRatingMode && Object.keys(ratings).length === topics.length}>
                    {liveRatingMode 
                        ? '💬 Submit Comments Only' 
                        : '🚀 Submit Anonymous Feedback'
                    }
                </button>
                
                {liveRatingMode && (
                    <p style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--text-secondary)', 
                        textAlign: 'center',
                        marginTop: '1rem'
                    }}>
                        💡 In live mode, ratings are automatically submitted. Use the button above to submit comments.
                    </p>
                )}
            </form>

            <Link to="/" style={{ 
                display: 'inline-block', 
                marginTop: '2rem',
                padding: '0.8rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                textAlign: 'center',
                border: '1px solid var(--border-color)'
            }}>
                🏠 Back to Home
            </Link>
        </div>
    );
}

export default StudentFeedbackForm;