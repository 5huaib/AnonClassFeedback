// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentFeedbackForm from './components/StudentFeedbackForm';
import TeacherFeedbackSummary from './components/TeacherFeedbackSummary';
import SetupClassForm from './components/SetupClassForm';

function App() {
  return (
    <div className="container">
      <h1>🎓 AnonClassFeedback</h1>
      <p>
        ✨ Real-time concept understanding rating system - Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
      </p>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/setup/:classId" element={<SetupClassForm />} />
        <Route path="/feedback/:classId" element={<StudentFeedbackForm />} />
        <Route path="/teacher/:classId" element={<TeacherFeedbackSummary />} />
      </Routes>
    </div>
  );
}

export default App;