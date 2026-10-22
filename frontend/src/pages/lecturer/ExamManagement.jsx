import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { activateExam, closeExam, getExams } from '../../services/examService';

const statusText = { draft: 'Bản nháp', active: 'Đang mở', closed: 'Đã đóng' };
const statusClass = { draft: 'badge-secondary', active: 'badge-success', closed: 'badge-warning' };

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getExams();
      setExams(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không tải được danh sách bài thi');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeStatus = async (exam, action) => {
    try {
      if (action === 'activate') await activateExam(exam.id);
      else await closeExam(exam.id);
      toast.success(action === 'activate' ? 'Đã mở bài thi' : 'Đã đóng bài thi');
      load();
    } catch (error) { toast.error(error.response?.data?.message || 'Không thể cập nhật bài thi'); }
  };

  return <>
    <div className="page-header">
      <div><h1 className="page-title">Quản lý bài thi</h1><p className="page-subtitle">Tạo, mở và đóng bài kiểm tra cho sinh viên.</p></div>
      <div className="flex gap-2">
        <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Làm mới</button>
        <Link className="btn btn-primary" to="/lecturer/exams/create"><Plus size={16}/> Tạo bài thi</Link>
      </div>
    </div>
    {loading ? <div className="empty-state">Đang tải danh sách...</div> : exams.length === 0 ? <div className="card empty-state"><h3>Chưa có bài thi</h3><p>Tạo bài thi đầu tiên để bắt đầu.</p><Link className="btn btn-primary mt-4" to="/lecturer/exams/create">Tạo bài thi</Link></div> :
      <div className="card"><div className="table-wrapper"><table><thead><tr><th>Tên bài thi</th><th>Môn học</th><th>Số câu</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
        {exams.map(exam => <tr key={exam.id}><td><strong>{exam.title}</strong><div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{exam.description || 'Không có mô tả'}</div></td><td>{exam.subject?.name || '—'}</td><td>{exam.total_questions ?? 0}</td><td>{exam.duration_minutes} phút</td><td><span className={`badge ${statusClass[exam.status] || 'badge-secondary'}`}>{statusText[exam.status] || exam.status}</span></td><td><div className="flex gap-2">{exam.status !== 'active' && <button className="btn btn-success btn-sm" onClick={() => changeStatus(exam, 'activate')}><Play size={14}/> Mở</button>}{exam.status === 'active' && <button className="btn btn-danger btn-sm" onClick={() => changeStatus(exam, 'close')}><Square size={14}/> Đóng</button>}</div></td></tr>)}
      </tbody></table></div></div>}
  </>;
}
