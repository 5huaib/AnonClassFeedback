// src/components/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const [classId, setClassId] = useState('');

    const quickLinks = [
        {
            title: "⚙️ Setup Class",
            description: "Teachers: Create a new feedback session for your class",
            path: `/setup/${classId}`,
            color: "var(--primary-color)",
            disabled: !classId
        },
        {
            title: "📝 Give Feedback", 
            description: "Students: Provide anonymous feedback for your class",
            path: `/feedback/${classId}`,
            color: "var(--accent-color)",
            disabled: !classId
        },
        {
            title: "📊 View Results",
            description: "Teachers: Review aggregated feedback and insights",
            path: `/teacher/${classId}`,
            color: "var(--success-color)",
            disabled: !classId
        }
    ];

    return (
        <div className="card">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    🎓 Welcome to AnonClassFeedback
                </h2>
                <p style={{ 
                    fontSize: '1.2rem', 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.6',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
                </p>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <div className="form-group">
                    <label style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                        🏫 Enter Class ID to Get Started
                    </label>
                    <input
                        type="text"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        placeholder="e.g., CS101, Math-2023, Biology-A"
                        style={{ 
                            fontSize: '1.1rem',
                            textAlign: 'center',
                            fontWeight: '500'
                        }}
                    />
                    <p style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--text-muted)', 
                        marginTop: '0.5rem',
                        textAlign: 'center'
                    }}>
                        💡 Use any identifier for your class (letters, numbers, dashes allowed)
                    </p>
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                marginBottom: '2rem'
            }}>
                {quickLinks.map((link, index) => (
                    <div
                        key={index}
                        style={{
                            background: link.disabled 
                                ? 'rgba(255, 255, 255, 0.03)' 
                                : 'rgba(255, 255, 255, 0.08)',
                            border: `2px solid ${link.disabled ? 'rgba(255, 255, 255, 0.1)' : link.color}`,
                            borderRadius: '16px',
                            padding: '2rem',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            opacity: link.disabled ? 0.5 : 1,
                            cursor: link.disabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {link.disabled ? (
                            <div>
                                <h3 style={{ 
                                    color: 'var(--text-muted)', 
                                    marginBottom: '1rem',
                                    fontSize: '1.3rem'
                                }}>
                                    {link.title}
                                </h3>
                                <p style={{ 
                                    color: 'var(--text-muted)', 
                                    lineHeight: '1.5',
                                    fontSize: '1rem'
                                }}>
                                    {link.description}
                                </p>
                            </div>
                        ) : (
                            <Link 
                                to={link.path}
                                style={{ 
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    display: 'block'
                                }}
                            >
                                <h3 style={{ 
                                    color: link.color, 
                                    marginBottom: '1rem',
                                    fontSize: '1.3rem'
                                }}>
                                    {link.title}
                                </h3>
                                <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    lineHeight: '1.5',
                                    fontSize: '1rem'
                                }}>
                                    {link.description}
                                </p>
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div style={{
                background: 'rgba(67, 233, 123, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(67, 233, 123, 0.3)',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h4 style={{ 
                    margin: '0 0 1rem 0', 
                    color: 'var(--success-color)',
                    fontSize: '1.2rem'
                }}>
                    🚀 How It Works
                </h4>
                <div style={{ 
                    display: 'grid', 
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    marginTop: '1.5rem'
                }}>
                    <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>1️⃣</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Teachers setup feedback sessions with class topics
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>2️⃣</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Students provide anonymous ratings and comments
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>3️⃣</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Teachers review aggregated insights and improve
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;