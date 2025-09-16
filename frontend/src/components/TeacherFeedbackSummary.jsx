// src/components/TeacherFeedbackSummary.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { socketUtils } from '../utils/socket';

function TeacherFeedbackSummary() {
    const { classId } = useParams();
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [connectedUsers, setConnectedUsers] = useState({ studentCount: 0, teacherCount: 0 });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/feedback/${classId}/summary`);
                setSummary(response.data);
                
                // Connect to socket for real-time updates
                socketUtils.connect();
                socketUtils.joinClass(classId, 'teacher');
                
                // Set up real-time event listeners
                socketUtils.onUserCountUpdate(setConnectedUsers);
                
                socketUtils.onRatingUpdate((data) => {
                    // Update specific topic in summary
                    setSummary(prevSummary => {
                        if (!prevSummary) return prevSummary;
                        
                        const updatedTopics = prevSummary.topics.map(topic => 
                            topic.id === data.topicId 
                                ? { ...topic, averageRating: data.averageRating, ratingCount: data.totalResponses }
                                : topic
                        );
                        
                        return { ...prevSummary, topics: updatedTopics };
                    });
                    
                    addRecentActivity(`📊 New rating: ${data.newRating}/10 for topic ID ${data.topicId}`);
                });
                
                socketUtils.onLiveRatingUpdate((data) => {
                    // Update specific topic in summary for live ratings
                    setSummary(prevSummary => {
                        if (!prevSummary) return prevSummary;
                        
                        const updatedTopics = prevSummary.topics.map(topic => 
                            topic.id === data.topicId 
                                ? { ...topic, averageRating: data.averageRating, ratingCount: data.totalResponses }
                                : topic
                        );
                        
                        return { ...prevSummary, topics: updatedTopics };
                    });
                    
                    addRecentActivity(`⚡ Live rating: ${data.rating}/10 (Avg: ${data.averageRating})`);
                });
                
                socketUtils.onNewComment((comment) => {
                    setSummary(prevSummary => {
                        if (!prevSummary) return prevSummary;
                        return {
                            ...prevSummary,
                            generalComments: [...prevSummary.generalComments, comment]
                        };
                    });
                    
                    addRecentActivity(`💬 New comment received`);
                });
                
            } catch (err) {
                setError('Failed to fetch feedback summary.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();

        return () => {
            socketUtils.offUserCountUpdate();
            socketUtils.offRatingUpdate();
            socketUtils.offLiveRatingUpdate();
            socketUtils.offNewComment();
            socketUtils.disconnect();
        };
    }, [classId]);

    const addRecentActivity = (message) => {
        const activity = {
            message,
            timestamp: new Date(),
            id: Date.now() + Math.random()
        };
        
        setRecentActivity(prev => [activity, ...prev.slice(0, 9)]); // Keep last 10 activities
    };

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
        const totalResponses = summary.topics.reduce((sum, topic) => sum + topic.ratingCount, 0);
        
        return { avgRating: avgRating.toFixed(1), totalResponses };
    };

    const formatTimeAgo = (timestamp) => {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    if (isLoading) return <div className="loading">📊 Loading feedback summary...</div>;
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
    if (!summary) return <p>📋 No summary data available.</p>;

    const performance = getOverallPerformance();

    return (
        <div className="card">
            <h2>📈 Real-Time Feedback Dashboard</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Class: <span style={{ color: 'var(--primary-color)', fontWeight: '700' }}>{classId}</span>
            </p>
            
            {/* Live Connection Status */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(67, 233, 123, 0.1)',
                borderRadius: '8px',
                marginBottom: '2rem',
                border: '1px solid rgba(67, 233, 123, 0.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#43e97b', fontSize: '1.2rem' }}>🟢</span>
                    <span style={{ fontWeight: '600' }}>Live Dashboard</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    👥 {connectedUsers.studentCount} students online • 👨‍🏫 {connectedUsers.teacherCount} teachers
                </div>
            </div>

            {/* Real-time Statistics */}
            {performance && (
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                            {performance.avgRating}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Overall Average</div>
                    </div>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--accent-color)' }}>
                            {performance.totalResponses}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Ratings</div>
                    </div>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success-color)' }}>
                            {summary.generalComments.length}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comments</div>
                    </div>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        padding: '1.5rem', 
                        borderRadius: '12px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--warning-color)' }}>
                            {connectedUsers.studentCount}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Live Students</div>
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3>🔔 Recent Activity</h3>
                    <div style={{ 
                        background: 'var(--bg-input)', 
                        borderRadius: '12px', 
                        border: '1px solid var(--border-color)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {recentActivity.map(activity => (
                            <div key={activity.id} style={{ 
                                padding: '0.8rem 1rem',
                                borderBottom: '1px solid var(--border-color)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>{activity.message}</span>
                                <span style={{ 
                                    color: 'var(--text-muted)', 
                                    fontSize: '0.8rem' 
                                }}>
                                    {formatTimeAgo(activity.timestamp)}
                                </span>
                            </div>
                        ))}
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
                                <div style={{ 
                                    fontSize: '0.8rem', 
                                    color: 'var(--text-muted)', 
                                    marginTop: '0.5rem' 
                                }}>
                                    {new Date(item.timestamp).toLocaleString()}
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
                        No comments were provided by students yet.
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
                    💡 Real-time Insights & Recommendations
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                    <li>⚡ Dashboard updates in real-time as students submit feedback</li>
                    <li>📊 Topics with ratings below 6 may need additional review</li>
                    <li>🎯 High-performing topics can be used as examples for future classes</li>
                    <li>💬 Student comments provide valuable qualitative feedback</li>
                    <li>👥 Monitor active student participation with live connection counts</li>
                </ul>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '2rem',
                flexWrap: 'wrap'
            }}>
                <Link to={`/setup/${classId}`} style={{ 
                    flex: 1,
                    padding: '1rem 1.5rem',
                    background: 'var(--secondary-gradient)',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    textAlign: 'center',
                    minWidth: '200px'
                }}>
                    ⚙️ Update Session
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
    );
}

export default TeacherFeedbackSummary;