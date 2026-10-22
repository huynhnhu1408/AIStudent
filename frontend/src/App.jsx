import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Lecturer pages
import LecturerLayout from './pages/lecturer/LecturerLayout';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import SubjectManagement from './pages/lecturer/SubjectManagement';
import QuestionBank from './pages/lecturer/QuestionBank';
import AIGenerate from './pages/lecturer/AIGenerate';
import ReviewQuestions from './pages/lecturer/ReviewQuestions';
import ExamCreate from './pages/lecturer/ExamCreate';
import ExamManagement from './pages/lecturer/ExamManagement';

// Student pages
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import AvailableExams from './pages/student/AvailableExams';
import TakeExam from './pages/student/TakeExam';
import ExamResult from './pages/student/ExamResult';
import MyHistory from './pages/student/MyHistory';

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => { checkAuth(); }, []);

  if (isLoading) {
    return (
      <div className="loading-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' },
          duration: 3000,
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Lecturer */}
        <Route path="/lecturer" element={<ProtectedRoute role="lecturer"><LecturerLayout /></ProtectedRoute>}>
          <Route index element={<LecturerDashboard />} />
          <Route path="subjects" element={<SubjectManagement />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="ai-generate" element={<AIGenerate />} />
          <Route path="review" element={<ReviewQuestions />} />
          <Route path="exams" element={<ExamManagement />} />
          <Route path="exams/create" element={<ExamCreate />} />
        </Route>

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="exams" element={<AvailableExams />} />
          <Route path="history" element={<MyHistory />} />
        </Route>

        {/* Standalone exam pages (no sidebar) */}
        <Route path="/exam/:examId/take" element={<ProtectedRoute role="student"><TakeExam /></ProtectedRoute>} />
        <Route path="/attempt/:attemptId/result" element={<ProtectedRoute role="student"><ExamResult /></ProtectedRoute>} />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
