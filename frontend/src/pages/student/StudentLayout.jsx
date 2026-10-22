import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, History, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/student', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/student/exams', label: 'Bài thi có sẵn', icon: ClipboardList },
  { to: '/student/history', label: 'Lịch sử làm bài', icon: History },
];
export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); toast.success('Đã đăng xuất'); navigate('/login'); };
  return <div className="app-layout">
    <aside className="sidebar">
      <div className="sidebar-logo"><h1>📚 QuizAI</h1><span>Khu vực sinh viên</span></div>
      <nav className="sidebar-nav">{links.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}><item.icon size={18}/>{item.label}</NavLink>)}</nav>
      <div className="sidebar-footer"><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}><User size={20}/><div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name || 'Sinh viên'}</div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Sinh viên</div></div></div><button className="btn btn-secondary btn-block btn-sm" onClick={handleLogout}><LogOut size={14}/> Đăng xuất</button></div>
    </aside>
    <main className="main-content"><div className="page-container"><Outlet/></div></main>
  </div>;
}
