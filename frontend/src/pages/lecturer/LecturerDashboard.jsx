import { useState, useEffect } from 'react';
import { FileQuestion, BookOpen, Sparkles, CheckSquare, TrendingUp, Clock } from 'lucide-react';
import { getSubjects } from '../../services/subjectService';
import { getQuestions } from '../../services/questionService';
import { getExams } from '../../services/examService';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';

export default function LecturerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ subjects: 0, questions: 0, pending: 0, exams: 0 });
  const [recentExams, setRecentExams] = useState([]);

  useEffect(() => {
    Promise.all([
      getSubjects(),
      getQuestions({ limit: 1 }),
      getQuestions({ status: 'pending', limit: 1 }),
      getExams(),
    ]).then(([s, q, p, e]) => {
      setStats({
        subjects: s.data.data.length,
        questions: q.data.pagination?.total || 0,
        pending: p.data.pagination?.total || 0,
        exams: e.data.data.length,
      });
      setRecentExams(e.data.data.slice(0, 5));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Môn học', value: stats.subjects, icon: BookOpen, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Câu hỏi', value: stats.questions, icon: FileQuestion, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { label: 'Chờ duyệt', value: stats.pending, icon: CheckSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Bài thi', value: stats.exams, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ];

  const statusMap = { draft: { label: 'Nháp', class: 'badge-secondary' }, active: { label: 'Đang mở', class: 'badge-success' }, closed: { label: 'Đã đóng', class: 'badge-danger' } };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Xin chào, {user?.name}! 👋</h1>
          <p className="page-subtitle">Tổng quan hoạt động giảng dạy của bạn</p>
        </div>
        <Link to="/lecturer/ai-generate" className="btn btn-primary">
          <Sparkles size={16} /> Tạo câu hỏi AI
        </Link>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>⚡ Thao tác nhanh</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { to: '/lecturer/ai-generate', icon: '🤖', label: 'Tạo câu hỏi bằng AI' },
              { to: '/lecturer/review', icon: '✅', label: `Duyệt ${stats.pending} câu chờ duyệt` },
              { to: '/lecturer/exams/create', icon: '📝', label: 'Tạo bài kiểm tra mới' },
              { to: '/lecturer/subjects', icon: '📚', label: 'Quản lý môn học' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 8, textDecoration: 'none', color: 'var(--text)', fontSize: 14, transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>📋 Bài thi gần đây</h3>
          {recentExams.length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <p style={{ fontSize: 13 }}>Chưa có bài thi nào</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentExams.map(exam => (
                <div key={exam.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{exam.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={12} /> {exam.duration_minutes} phút · {exam.total_questions} câu
                    </div>
                  </div>
                  <span className={`badge ${statusMap[exam.status]?.class}`}>{statusMap[exam.status]?.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
