import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit3, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getQuestions, updateStatus, updateQuestion } from '../../services/questionService';

export default function ReviewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getQuestions({ status: 'pending', limit: 50 });
      setQuestions(data.data);
    } catch { toast.error('Lỗi tải dữ liệu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
      toast.success(status === 'approved' ? '✅ Đã duyệt câu hỏi' : '❌ Đã từ chối');
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch { toast.error('Lỗi'); }
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setEditForm({
      content: q.content,
      explanation: q.explanation || '',
      choices: q.choices.map(c => ({ id: c.id, content: c.content, is_correct: c.is_correct })),
    });
  };

  const saveEdit = async (id) => {
    try {
      await updateQuestion(id, editForm);
      toast.success('Đã lưu chỉnh sửa');
      setEditingId(null);
      load();
    } catch { toast.error('Lỗi lưu'); }
  };

  const letters = ['A', 'B', 'C', 'D'];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Duyệt câu hỏi</h1>
          <p className="page-subtitle">{questions.length} câu hỏi đang chờ duyệt</p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h3>Không có câu hỏi nào chờ duyệt!</h3>
          <p>Tất cả câu hỏi đã được xử lý.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {questions.map((q, i) => (
            <div key={q.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="badge badge-warning">Chờ duyệt</span>
                  {q.ai_generated && <span className="badge badge-primary">🤖 AI</span>}
                  <span className="badge badge-secondary">{q.topic?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {editingId === q.id ? (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => saveEdit(q.id)}><Save size={14} /> Lưu</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(q)}><Edit3 size={14} /> Sửa</button>
                      <button className="btn btn-success btn-sm" onClick={() => handleStatus(q.id, 'approved')}><CheckCircle size={14} /> Duyệt</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleStatus(q.id, 'rejected')}><XCircle size={14} /> Từ chối</button>
                    </>
                  )}
                </div>
              </div>

              {editingId === q.id ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Nội dung câu hỏi</label>
                    <textarea className="form-textarea" rows={3} value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })} />
                  </div>
                  {editForm.choices?.map((c, ci) => (
                    <div key={ci} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <span style={{ width: 24, fontWeight: 700, color: 'var(--text-muted)' }}>{letters[ci]}.</span>
                      <input className="form-input" value={c.content} onChange={e => {
                        const nc = [...editForm.choices]; nc[ci] = { ...nc[ci], content: e.target.value };
                        setEditForm({ ...editForm, choices: nc });
                      }} style={{ flex: 1 }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--success)' }}>
                        <input type="radio" name={`correct-${q.id}`} checked={c.is_correct} onChange={() => {
                          const nc = editForm.choices.map((ch, j) => ({ ...ch, is_correct: j === ci }));
                          setEditForm({ ...editForm, choices: nc });
                        }} /> Đáp án đúng
                      </label>
                    </div>
                  ))}
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label">Giải thích</label>
                    <textarea className="form-textarea" rows={2} value={editForm.explanation} onChange={e => setEditForm({ ...editForm, explanation: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 500, marginBottom: 14, lineHeight: 1.7 }}>{q.content}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {q.choices.map((c, ci) => (
                      <div key={c.id} style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${c.is_correct ? 'var(--success)' : 'var(--border)'}`, background: c.is_correct ? 'rgba(16,185,129,0.08)' : 'var(--bg-input)', display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                        <span style={{ fontWeight: 700, color: c.is_correct ? 'var(--success)' : 'var(--text-muted)' }}>{letters[ci]}.</span>
                        <span style={{ color: c.is_correct ? 'var(--success)' : 'var(--text)' }}>{c.content}</span>
                        {c.is_correct && <CheckCircle size={14} color="var(--success)" style={{ marginLeft: 'auto' }} />}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                      💡 <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
