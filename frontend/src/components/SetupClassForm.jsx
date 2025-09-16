// src/components/SetupClassForm.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function SetupClassForm() {
    const { classId } = useParams();
    const [topics, setTopics] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const topicsArray = topics.split('\n').filter(topic => topic.trim() !== '');
        if (topicsArray.length === 0) {
            setError('Please enter at least one topic.');
            return;
        }

        try {
            await axios.post(`http://localhost:3001/api/class/${classId}/setup`, { topics: topicsArray });
            setIsSubmitted(true);
        } catch (err) {
            setError('Failed to set up the class. Please try again.');
            console.error(err);
        }
    };

    if (isSubmitted) {
        return (
            <div className="card">
                <h2>🎉 Session Ready for {classId}!</h2>
                <div className="success-message">
                    Your real-time feedback session has been created successfully! Students can now provide anonymous feedback and you can monitor responses in real-time.
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        📤 Share this link with your students:
                    </p>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        marginBottom: '2rem',
                        border: '2px dashed var(--primary-color)'
                    }}>
                        <Link to={`/feedback/${classId}`} style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '700',
                            wordBreak: 'break-all'
                        }}>
                            🔗 {window.location.origin}/feedback/{classId}
                        </Link>
                    </div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        📊 View your real-time dashboard:
                    </p>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        border: '2px dashed var(--accent-color)',
                        marginBottom: '2rem'
                    }}>
                        <Link to={`/teacher/${classId}`} style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '700',
                            wordBreak: 'break-all'
                        }}>
                            📈 {window.location.origin}/teacher/{classId}
                        </Link>
                    </div>

                    <div style={{ 
                        background: 'rgba(79, 172, 254, 0.1)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        border: '1px solid rgba(79, 172, 254, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent-color)' }}>
                            ⚡ Real-time Features Available:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                            <li>📊 Live feedback updates as students submit ratings</li>
                            <li>👥 Real-time student connection tracking</li>
                            <li>💬 Instant comment notifications</li>
                            <li>📈 Dynamic analytics dashboard</li>
                            <li>🔔 Activity feed for recent submissions</li>
                        </ul>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <Link to={`/teacher/${classId}`} style={{ 
                            flex: 1,
                            padding: '1rem 1.5rem',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            textAlign: 'center',
                            minWidth: '200px'
                        }}>
                            📊 Open Dashboard
                        </Link>
                        <Link to="/" style={{ 
                            flex: 1,
                            padding: '1rem 1.5rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'var(--text-primary)',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '500',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)',
                            minWidth: '200px'
                        }}>
                            🏠 Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>⚙️ Setup Real-time Feedback Session</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
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
                    🎯 Create topics for students to rate their understanding in real-time
                </p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>📚 Topics Covered in Today's Class</label>
                    <textarea
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder="Enter each topic on a new line, for example:&#10;• Introduction to React Hooks&#10;• useState and useEffect&#10;• Custom Hooks&#10;• Performance Optimization&#10;• Real-time State Management"
                        rows="8"
                        required
                    />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        💡 Tip: Be specific with topic names to get better feedback. Students will rate each topic from 1-10.
                    </p>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">🚀 Create Real-time Feedback Session</button>
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

export default SetupClassForm;