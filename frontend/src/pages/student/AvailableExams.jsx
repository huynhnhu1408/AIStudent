import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileQuestion, RefreshCw, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { getExams, startAttempt } from '../../services/examService';

export default function AvailableExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const navigate = useNavigate();
  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await getExams({ status: 'active' }); setExams(data.data || []); }
    catch (error) { toast.error(error.response?.data?.message || 'Không tải được danh sách bài thi'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const begin = async exam => {
    setStartingId(exam.id);
    try { const { data } = await startAttempt(exam.id); navigate(`/exam/${exam.id}/take`, { state: { attempt: data.data } }); }
    catch (error) {
      const attemptId = error.response?.data?.data?.attempt_id;
      if (attemptId) navigate(`/exam/${exam.id}/take`, { state: { attemptId } });
      else toast.error(error.response?.data?.message || 'Không thể bắt đầu bài thi');
    } finally { setStartingId(null); }
  };
  return <>
    <div className="page-header"><div><h1 className="page-title">Bài thi có sẵn</h1><p className="page-subtitle">Các bài kiểm tra đang được giảng viên mở.</p></div><button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16}/> Làm mới</button></div>
    {loading ? <div className="empty-state">Đang tải bài thi...</div> : exams.length === 0 ? <div className="card empty-state"><FileQuestion size={36}/><h3>Hiện chưa có bài thi nào</h3><p>Vui lòng quay lại sau khi giảng viên mở bài thi.</p></div> : <div className="grid-2">{exams.map(exam => <div className="card" key={exam.id}><div className="flex items-center justify-between gap-2"><span className="badge badge-success">Đang mở</span><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{exam.subject?.name || 'Chưa phân môn'}</span></div><h2 style={{ fontSize: 19, margin: '14px 0 8px' }}>{exam.title}</h2><p style={{ color: 'var(--text-muted)', minHeight: 42, fontSize: 14 }}>{exam.description || 'Bài kiểm tra kiến thức.'}</p><div className="flex gap-4 mt-4" style={{ color: 'var(--text-muted)', fontSize: 13 }}><span><FileQuestion size={15} style={{ verticalAlign: 'middle' }}/> {exam.total_questions || 0} câu</span><span><Clock size={15} style={{ verticalAlign: 'middle' }}/> {exam.duration_minutes} phút</span></div><button className="btn btn-primary btn-block mt-4" disabled={startingId === exam.id} onClick={() => begin(exam)}><Play size={16}/>{startingId === exam.id ? 'Đang bắt đầu...' : 'Bắt đầu làm bài'}</button></div>)}</div>}
  </>;
}
