// src/components/TeacherFeedbackSummary.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function TeacherFeedbackSummary() {
    const { classId } = useParams();
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/feedback/${classId}/summary`);
                setSummary(response.data);
            } catch (err) {
                setError('Failed to fetch feedback summary.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, [classId]);

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'rating-excellent';
        if (rating >= 6) return 'rating-good';
        if (rating >= 4) return 'rating-average';
        return 'rating-poor';
    };

    const getRatingEmoji = (rating) => {
        if (rating >= 8) return '🌟';
        if (rating >= 6) return '👍';
        if (rating >= 4) return '😐';
        return '😞';
    };

    const getOverallPerformance = () => {
        if (!summary || !summary.topics.length) return null;
        const avgRating = summary.topics.reduce((sum, topic) => sum + topic.averageRating, 0) / summary.topics.length;
        const totalResponses = summary.topics[0]?.ratingCount || 0;
        
        return { avgRating: avgRating.toFixed(1), totalResponses };
    };

    if (isLoading) return <div className="loading">📊 Loading feedback summary...</div>;
    if (error) return <p className="error-message">{error}</p>;
    if (!summary) return <p>📋 No summary data available.</p>;

    const performance = getOverallPerformance();

    return (
        <div className="card">
            <h2>📈 Feedback Summary</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Class: <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{classId}</span>
            </p>
            
            {performance && (
                <div style={{ 
                    background: 'var(--bg-input)', 
                    padding: '2rem', 
                    borderRadius: '12px', 
                    marginBottom: '2rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                            {performance.avgRating}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Overall Average</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                            {performance.totalResponses}
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>Student Responses</div>
                    </div>
                </div>
            )}
            
            <div className="feedback-list">
                <h3>🎯 Topic Understanding Breakdown</h3>
                {summary.topics.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>📚 Topic</th>
                                <th>⭐ Average Rating</th>
                                <th>👥 Responses</th>
                                <th>📊 Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                        {summary.topics.map(topic => (
                            <tr key={topic.id}>
                                <td style={{ fontWeight: '600' }}>{topic.name}</td>
                                <td>
                                    <span className={getRatingColor(topic.averageRating)} style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                                        {topic.averageRating}/10
                                    </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>{topic.ratingCount}</td>
                                <td style={{ textAlign: 'center', fontSize: '1.5rem' }}>
                                    {getRatingEmoji(topic.averageRating)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No topics were set up for this class.</p>
                )}
            </div>

            <div className="feedback-list">
                <h3>💬 Student Comments</h3>
                {summary.generalComments.length > 0 ? (
                    <ul>
                        {summary.generalComments.map((item, index) => (
                            <li key={index} style={{ 
                                position: 'relative',
                                paddingLeft: '3rem'
                            }}>
                                <span style={{ 
                                    position: 'absolute',
                                    left: '1rem',
                                    fontSize: '1.2rem'
                                }}>💭</span>
                                <div style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                                    "{item.text}"
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '2rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic'
                    }}>
                        No comments were provided by students.
                    </div>
                )}
            </div>
            
            <div style={{ 
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(67, 233, 123, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(67, 233, 123, 0.3)'
            }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--success-color)' }}>
                    💡 Insights & Recommendations
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                    <li>Topics with ratings below 6 may need additional review</li>
                    <li>High-performing topics can be used as examples for future classes</li>
                    <li>Student comments provide valuable qualitative feedback</li>
                </ul>
            </div>
        </div>
    );
}

export default TeacherFeedbackSummary;