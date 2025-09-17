// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import StudentFeedbackForm from './components/StudentFeedbackForm';
import TeacherFeedbackSummary from './components/TeacherFeedbackSummary';
import SetupClassForm from './components/SetupClassForm';

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup/:classId" element={
          <>
            <h1>🎓 AnonClassFeedback</h1>
            <p>
              ✨ Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
            </p>
            <SetupClassForm />
          </>
        } />
        <Route path="/feedback/:classId" element={
          <>
            <h1>🎓 AnonClassFeedback</h1>
            <p>
              ✨ Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
            </p>
            <StudentFeedbackForm />
          </>
        } />
        <Route path="/teacher/:classId" element={
          <>
            <h1>🎓 AnonClassFeedback</h1>
            <p>
              ✨ Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
            </p>
            <TeacherFeedbackSummary />
          </>
        } />
      </Routes>
    </div>
  );
}

export default App;