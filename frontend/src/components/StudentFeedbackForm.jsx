// src/components/StudentFeedbackForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function StudentFeedbackForm() {
    const { classId } = useParams();
    const [topics, setTopics] = useState([]);
    const [ratings, setRatings] = useState({});
    const [generalComment, setGeneralComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                // ✅ FIXED: Using the production API URL
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/class/${classId}/topics`);
                setTopics(response.data.topics);
            } catch (err) {
                setError('Could not load topics. The teacher may not have set up this session yet.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTopics();
    }, [classId]);

    const handleRatingChange = (topicId, score) => {
        setRatings(prevRatings => ({ ...prevRatings, [topicId]: score }));
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
            // ✅ FIXED: Using the production API URL
            await axios.post(`${process.env.REACT_APP_API_URL}/api/feedback/${classId}`, { ratings: ratingsArray, generalComment });
            setIsSubmitted(true);
        } catch (err) {
            setError('Failed to submit feedback.');
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
    if (error) return <p className="error-message">{error}</p>;
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
        </div>
    );

    return (
        <div className="card">
            <h2>📝 Anonymous Feedback</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Class: <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{classId}</span>
            </p>
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
                            required
                        >
                            <option value="" disabled>Choose your understanding level...</option>
                            {[...Array(10).keys()].map(i => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} - {getRatingEmoji(i + 1)} {getRatingText(i + 1)}
                                </option>
                            ))}
                        </select>
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
                <button type="submit">🚀 Submit Anonymous Feedback</button>
            </form>
        </div>
    );
}

export default StudentFeedbackForm;
