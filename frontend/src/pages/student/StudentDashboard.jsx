import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyStats } from '../../services/examService';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getMyStats().then(({ data }) => setStats(data.data)).catch(err => toast.error(err.response?.data?.message || 'Không tải được thống kê')).finally(() => setLoading(false)); }, []);
  const items = [
    { label: 'Lượt làm bài', value: stats?.totalAttempts ?? 0, icon: BookOpen, color: 'var(--primary)' },
    { label: 'Điểm trung bình', value: `${stats?.avgScore ?? 0}%`, icon: TrendingUp, color: 'var(--info)' },
    { label: 'Bài đạt', value: stats?.passed ?? 0, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Bài chưa đạt', value: stats?.failed ?? 0, icon: Award, color: 'var(--warning)' },
  ];
  return <>
    <div className="page-header"><div><h1 className="page-title">Tổng quan học tập</h1><p className="page-subtitle">Theo dõi tiến độ và tiếp tục ôn luyện của bạn.</p></div><Link className="btn btn-primary" to="/student/exams">Xem bài thi</Link></div>
    {loading ? <div className="empty-state">Đang tải thống kê...</div> : <div className="stats-grid">{items.map(item => <div className="stat-card" key={item.label} style={{ '--accent-color': item.color }}><div className="stat-icon" style={{ background: `${item.color}22`, color: item.color }}><item.icon size={22}/></div><div className="stat-value">{item.value}</div><div className="stat-label">{item.label}</div></div>)}</div>}
    <div className="card"><h2 style={{ marginBottom: 8 }}>Sẵn sàng kiểm tra kiến thức?</h2><p style={{ color: 'var(--text-muted)', marginBottom: 18 }}>Chọn một bài thi đang mở, hoàn thành các câu hỏi và xem kết quả ngay sau khi nộp bài.</p><Link className="btn btn-primary" to="/student/exams">Khám phá bài thi</Link></div>
  </>;
}
