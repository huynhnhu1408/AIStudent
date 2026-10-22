import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileQuestion, Sparkles, CheckSquare, FileText, GraduationCap, LogOut, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/lecturer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { section: 'Nội dung' },
  { to: '/lecturer/subjects', icon: BookOpen, label: 'Môn học & Chủ đề' },
  { to: '/lecturer/questions', icon: FileQuestion, label: 'Ngân hàng câu hỏi' },
  { to: '/lecturer/ai-generate', icon: Sparkles, label: 'Tạo câu hỏi AI' },
  { to: '/lecturer/review', icon: CheckSquare, label: 'Duyệt câu hỏi' },
  { section: 'Bài kiểm tra' },
  { to: '/lecturer/exams', icon: FileText, label: 'Quản lý bài thi' },
  { to: '/lecturer/exams/create', icon: GraduationCap, label: 'Tạo bài thi' },
];

export default function LecturerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>📚 QuizAI</h1>
          <span>Giảng viên</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section-title" style={{ marginTop: 12 }}>{item.section}</div>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <item.icon size={18} />
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 12px', background: 'var(--bg-input)', borderRadius: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Giảng viên</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-block btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
