import { useState, useEffect } from 'react';
import { Search, Filter, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getQuestions, deleteQuestion, updateStatus } from '../../services/questionService';
import { getSubjects } from '../../services/subjectService';

const DIFF_BADGE = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' };
const DIFF_LABEL = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' };
const STATUS_BADGE = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
const STATUS_LABEL = { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' };

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: '', difficulty: '', search: '', page: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getQuestions({ ...filters, limit: 20 });
      setQuestions(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { getSubjects().then(r => setSubjects(r.data.data)); }, []);
  useEffect(() => { load(); }, [filters]);

  const handleDelete = async (id) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try { await deleteQuestion(id); toast.success('Đã xóa'); load(); }
    catch { toast.error('Không thể xóa'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ngân hàng câu hỏi</h1>
          <p className="page-subtitle">Tổng: {pagination.total || 0} câu hỏi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} className="search-icon" />
            <input className="form-input" placeholder="Tìm kiếm câu hỏi..." value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} style={{ paddingLeft: 40 }} />
          </div>
          <select className="form-select" style={{ width: 160 }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">Tất cả trạng thái</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
          <select className="form-select" style={{ width: 160 }} value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}>
            <option value="">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Câu hỏi</th>
                <th>Chủ đề</th>
                <th>Độ khó</th>
                <th>Trạng thái</th>
                <th>AI</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Không có câu hỏi nào</td></tr>
              ) : questions.map((q, i) => (
                <tr key={q.id}>
                  <td style={{ color: 'var(--text-dim)', fontSize: 12 }}>{(filters.page - 1) * 20 + i + 1}</td>
                  <td style={{ maxWidth: 320 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }} title={q.content}>{q.content}</div>
                  </td>
                  <td><span className="badge badge-secondary">{q.topic?.name || '—'}</span></td>
                  <td><span className={`badge ${DIFF_BADGE[q.difficulty]}`}>{DIFF_LABEL[q.difficulty]}</span></td>
                  <td><span className={`badge ${STATUS_BADGE[q.status]}`}>{STATUS_LABEL[q.status]}</span></td>
                  <td style={{ textAlign: 'center' }}>{q.ai_generated ? '🤖' : '✍️'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {q.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm btn-icon" title="Duyệt" onClick={() => updateStatus(q.id, 'approved').then(() => { toast.success('Đã duyệt'); load(); })}>
                            <CheckCircle size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Từ chối" onClick={() => updateStatus(q.id, 'rejected').then(() => { toast.success('Đã từ chối'); load(); })}>
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      <button className="btn btn-danger btn-sm btn-icon" title="Xóa" onClick={() => handleDelete(q.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`btn btn-sm ${p === filters.page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilters({ ...filters, page: p })}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
