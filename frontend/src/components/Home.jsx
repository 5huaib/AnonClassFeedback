// src/components/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const [classId, setClassId] = useState('');
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!classId.trim() || !userType) {
            return;
        }

        const trimmedClassId = classId.trim();
        
        switch (userType) {
            case 'teacher-setup':
                navigate(`/setup/${trimmedClassId}`);
                break;
            case 'teacher-view':
                navigate(`/teacher/${trimmedClassId}`);
                break;
            case 'student':
                navigate(`/feedback/${trimmedClassId}`);
                break;
            default:
                break;
        }
    };

    return (
        <div className="home-container">
            <div className="welcome-section">
                <h2>Welcome to AnonClassFeedback</h2>
                <p>Choose your role and enter your class ID to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="home-form">
                <div className="input-group">
                    <label htmlFor="classId">Class ID</label>
                    <input
                        type="text"
                        id="classId"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        placeholder="Enter your class ID"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="userType">I am a...</label>
                    <select
                        id="userType"
                        value={userType}
                        onChange={(e) => setUserType(e.target.value)}
                        required
                    >
                        <option value="">Select your role</option>
                        <option value="teacher-setup">Teacher (Setup New Class)</option>
                        <option value="teacher-view">Teacher (View Feedback)</option>
                        <option value="student">Student (Give Feedback)</option>
                    </select>
                </div>

                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={!classId.trim() || !userType}
                >
                    Continue
                </button>
            </form>

            <div className="info-section">
                <div className="feature-card">
                    <h3>🎯 For Teachers</h3>
                    <p>Set up feedback sessions and view anonymous student responses</p>
                </div>
                <div className="feature-card">
                    <h3>📝 For Students</h3>
                    <p>Provide anonymous feedback on class topics</p>
                </div>
                <div className="feature-card">
                    <h3>🔒 Anonymous</h3>
                    <p>All feedback is completely anonymous and secure</p>
                </div>
            </div>
        </div>
    );
}

export default Home;