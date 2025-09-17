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
            await axios.post(
                `https://anon-class-feedback-fjgff31a4-5huaibs-projects.vercel.app/api/class/${classId}/setup?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=aB3dE5gH7jK9LmN1pQ2rS4tU6wX8yZ0q`,
                { topics: topicsArray }
            );
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
                    Your feedback session has been created successfully! Students can now provide anonymous feedback.
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
                        📊 View your summary dashboard:
                    </p>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        border: '2px dashed var(--accent-color)'
                    }}>
                        <Link to={`/teacher/${classId}`} style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '700',
                            wordBreak: 'break-all'
                        }}>
                            📈 {window.location.origin}/teacher/{classId}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h2>⚙️ Setup Feedback Session</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Class: <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{classId}</span>
            </p>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>📚 Topics Covered in Today's Class</label>
                    <textarea
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder="Enter each topic on a new line, for example:&#10;• Introduction to React Hooks&#10;• useState and useEffect&#10;• Custom Hooks&#10;• Performance Optimization"
                        rows="6"
                        required
                    />
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        💡 Tip: Be specific with topic names to get better feedback
                    </p>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit">🚀 Create Feedback Session</button>
            </form>
        </div>
    );
}

export default SetupClassForm;