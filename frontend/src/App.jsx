// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentFeedbackForm from './components/StudentFeedbackForm';
import TeacherFeedbackSummary from './components/TeacherFeedbackSummary';
import SetupClassForm from './components/SetupClassForm';

function App() {
  return (
    <div className="container">
      <h1>🎓 AnonClassFeedback</h1>
      <p>
        ✨ Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.
      </p>
      <Routes>
        <Route path="/setup/:classId" element={<SetupClassForm />} />
        <Route path="/feedback/:classId" element={<StudentFeedbackForm />} />
        <Route path="/teacher/:classId" element={<TeacherFeedbackSummary />} />
      </Routes>
    </div>
  );
}

export default App;