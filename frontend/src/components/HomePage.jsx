// src/components/HomePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
    const [classId, setClassId] = useState('');
    const [userType, setUserType] = useState('student');
    const navigate = useNavigate();

    const handleJoinClass = (e) => {
        e.preventDefault();
        if (!classId.trim()) {
            alert('Please enter a class ID');
            return;
        }

        const route = userType === 'teacher' ? `/setup/${classId}` : `/feedback/${classId}`;
        navigate(route);
    };

    const generateSampleClassId = () => {
        const courses = ['CS101', 'MATH201', 'PHYS301', 'ENG102', 'CHEM250'];
        const randomCourse = courses[Math.floor(Math.random() * courses.length)];
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${randomCourse}-${today}`;
    };

    return (
        <div className="card">
            <h2>🏠 Welcome to AnonClassFeedback</h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
                Get real-time insights into student understanding with anonymous feedback
            </p>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '2rem', 
                marginBottom: '3rem' 
            }}>
                <div style={{ 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    padding: '2rem', 
                    borderRadius: '12px',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🏫</div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>For Teachers</h3>
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem'
                    }}>
                        <li>✨ Create feedback sessions</li>
                        <li>📊 Monitor real-time responses</li>
                        <li>📈 View detailed analytics</li>
                        <li>🎯 Identify learning gaps</li>
                    </ul>
                </div>

                <div style={{ 
                    background: 'rgba(79, 172, 254, 0.1)', 
                    padding: '2rem', 
                    borderRadius: '12px',
                    border: '1px solid rgba(79, 172, 254, 0.3)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍🎓</div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.3rem' }}>For Students</h3>
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem'
                    }}>
                        <li>🔒 Anonymous feedback</li>
                        <li>⚡ Real-time rating</li>
                        <li>💭 Share thoughts freely</li>
                        <li>🎨 Simple, intuitive interface</li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleJoinClass}>
                <div className="form-group">
                    <label>👤 I am a:</label>
                    <select 
                        value={userType} 
                        onChange={(e) => setUserType(e.target.value)}
                        style={{ marginBottom: '1rem' }}
                    >
                        <option value="student">🎓 Student</option>
                        <option value="teacher">👨‍🏫 Teacher</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>🏫 Class ID</label>
                    <input
                        type="text"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        placeholder="e.g., CS101-Nov15, MATH201-Nov15"
                        required
                    />
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: '0.5rem'
                    }}>
                        <p style={{ 
                            fontSize: '0.9rem', 
                            color: 'var(--text-muted)', 
                            margin: 0 
                        }}>
                            💡 Use format: CourseCode-Date
                        </p>
                        <button 
                            type="button"
                            onClick={() => setClassId(generateSampleClassId())}
                            style={{ 
                                background: 'none',
                                border: '1px solid var(--primary-color)',
                                color: 'var(--primary-color)',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                width: 'auto'
                            }}
                        >
                            🎲 Generate Sample
                        </button>
                    </div>
                </div>

                <button type="submit">
                    {userType === 'teacher' ? '🚀 Setup Class Session' : '📝 Join Feedback Session'}
                </button>
            </form>

            <div style={{ 
                marginTop: '3rem',
                padding: '2rem',
                background: 'rgba(67, 233, 123, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(67, 233, 123, 0.3)',
                textAlign: 'center'
            }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--success-color)' }}>
                    🌟 Real-time Features
                </h4>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div>⚡ Live concept rating</div>
                    <div>📊 Instant analytics</div>
                    <div>👥 Active user tracking</div>
                    <div>💬 Real-time comments</div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;