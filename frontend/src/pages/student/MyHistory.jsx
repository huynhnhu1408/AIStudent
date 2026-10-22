import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyAttempts } from '../../services/examService';

export default function MyHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); getMyAttempts().then(({ data }) => setAttempts(data.data || [])).catch(error => toast.error(error.response?.data?.message || 'Không tải được lịch sử')).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  return <><div className="page-header"><div><h1 className="page-title">Lịch sử làm bài</h1><p className="page-subtitle">Xem lại điểm các bài kiểm tra đã nộp.</p></div><button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Làm mới</button></div>
    {loading ? <div className="empty-state">Đang tải lịch sử...</div> : attempts.length === 0 ? <div className="card empty-state"><History size={36}/><h3>Chưa có lịch sử làm bài</h3><p>Kết quả sẽ hiển thị ở đây sau khi bạn hoàn thành bài thi.</p><Link className="btn btn-primary mt-4" to="/student/exams">Tìm bài thi</Link></div> : <div className="card"><div className="table-wrapper"><table><thead><tr><th>Bài thi</th><th>Môn học</th><th>Ngày nộp</th><th>Điểm</th><th>Kết quả</th><th></th></tr></thead><tbody>{attempts.map(a => <tr key={a.id}><td>{a.exam?.title || `Bài thi #${a.exam_id}`}</td><td>{a.exam?.subject?.name || '—'}</td><td>{a.submitted_at ? new Date(a.submitted_at).toLocaleString('vi-VN') : '—'}</td><td><strong>{a.score ?? 0}%</strong></td><td><span className={`badge ${(a.score ?? 0) >= (a.exam?.pass_score ?? 50) ? 'badge-success' : 'badge-danger'}`}>{(a.score ?? 0) >= (a.exam?.pass_score ?? 50) ? 'Đạt' : 'Chưa đạt'}</span></td><td><Link className="btn btn-secondary btn-sm" to={`/attempt/${a.id}/result`}>Chi tiết</Link></td></tr>)}</tbody></table></div></div>}
  </>;
}
