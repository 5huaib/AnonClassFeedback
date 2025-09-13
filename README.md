# 🎓 AnonClassFeedback

**Transform your classroom with anonymous, topic-based feedback that empowers students and enhances teaching excellence.**

A modern, full-stack web application that enables anonymous feedback collection from students to help teachers improve their teaching methods and understand student comprehension levels.

## ✨ Features

### For Teachers
- 🔧 **Easy Setup**: Create feedback sessions by simply listing topics covered
- 📊 **Rich Analytics**: View detailed breakdowns of student understanding
- 🎯 **Topic-based Insights**: See which topics need more attention
- 💬 **Anonymous Comments**: Receive honest feedback from students
- 📈 **Performance Metrics**: Track overall class performance

### For Students
- 🔒 **Complete Anonymity**: Submit feedback without revealing identity
- 📝 **Simple Interface**: Rate understanding on a 1-10 scale with emoji indicators
- 💭 **Optional Comments**: Share additional thoughts and suggestions
- 🎨 **Modern UI**: Beautiful, intuitive design for better user experience

## 🚀 Technology Stack

### Frontend
- **React** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Fast build tool and development server
- **Modern CSS** - Glass morphism design with gradients

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **CORS** - Cross-origin resource sharing
- **In-memory storage** - Simple data persistence

## 📁 Project Structure

```
ClassFeedback/
├── Backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SetupClassForm.jsx
│   │   │   ├── StudentFeedbackForm.jsx
│   │   │   └── TeacherFeedbackSummary.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup
```bash
cd Backend
npm install
npm start
```
The backend server will start on `http://localhost:3001`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173` (or next available port)

## 📖 Usage Guide

### 1. Teacher Creates Session
1. Navigate to `/setup/{classId}` (e.g., `/setup/CS101-Sept13`)
2. Enter topics covered in class (one per line)
3. Click "Create Feedback Session"
4. Share the generated student link

### 2. Students Provide Feedback
1. Visit the shared link `/feedback/{classId}`
2. Rate understanding for each topic (1-10 scale)
3. Optionally add general comments
4. Submit anonymous feedback

### 3. Teacher Views Results
1. Navigate to `/teacher/{classId}`
2. View comprehensive analytics including:
   - Overall class performance metrics
   - Topic-by-topic breakdown
   - Average ratings and response counts
   - Anonymous student comments
   - Actionable insights and recommendations

## 🎯 API Endpoints

### Teacher Endpoints
- `POST /api/class/:classId/setup` - Create feedback session
- `GET /api/feedback/:classId/summary` - Get aggregated results

### Student Endpoints
- `GET /api/class/:classId/topics` - Get topics for feedback
- `POST /api/feedback/:classId` - Submit anonymous feedback

## 🎨 Design Features

- **Modern Glass Morphism UI** with backdrop blur effects
- **Gradient Backgrounds** for visual appeal
- **Responsive Design** that works on all devices
- **Interactive Elements** with hover animations
- **Color-coded Performance** indicators
- **Professional Typography** with Inter font family
- **Accessibility Features** for better usability

## 🔮 Future Enhancements

- [ ] Persistent database integration (MongoDB/PostgreSQL)
- [ ] User authentication and authorization
- [ ] Real-time feedback updates
- [ ] Export functionality (PDF/CSV)
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for better classroom feedback mechanisms
- Designed with both teachers and students in mind

---

**Made with ❤️ for better education**
