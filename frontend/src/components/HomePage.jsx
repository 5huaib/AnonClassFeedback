// src/components/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div className="card">
            <h2>🏠 Welcome to AnonClassFeedback</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
                <div className="feature-card">
                    <h3>👨‍🏫 For Teachers</h3>
                    <p>Set up feedback sessions and view comprehensive summaries</p>
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/setup/demo-class" style={{ 
                            display: 'inline-block',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            marginRight: '1rem'
                        }}>
                            ⚙️ Setup Class
                        </Link>
                        <Link to="/teacher/demo-class" style={{ 
                            display: 'inline-block',
                            background: 'var(--accent-gradient)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            📊 View Summary
                        </Link>
                    </div>
                </div>

                <div className="feature-card">
                    <h3>👩‍🎓 For Students</h3>
                    <p>Provide anonymous feedback on your classroom experience</p>
                    <div style={{ marginTop: '1rem' }}>
                        <Link to="/feedback/demo-class" style={{ 
                            display: 'inline-block',
                            background: 'var(--success-gradient)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            📝 Give Feedback
                        </Link>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', padding: '2rem', background: 'var(--bg-input)', borderRadius: '12px' }}>
                <h3>🚀 How It Works</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
                        <strong>Setup</strong>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Teacher creates a feedback session with topics</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
                        <strong>Feedback</strong>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Students provide anonymous ratings and comments</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
                        <strong>Analysis</strong>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Teacher views comprehensive feedback summary</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;