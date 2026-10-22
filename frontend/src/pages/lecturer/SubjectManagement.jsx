import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevDown, BookOpen, Tag, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSubjects, createSubject, deleteSubject, createTopic, deleteTopic } from '../../services/subjectService';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [topicForm, setTopicForm] = useState({});

  const load = async () => {
    try { const { data } = await getSubjects(); setSubjects(data.data); }
    catch { toast.error('Không thể tải môn học'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      await createSubject(form);
      toast.success('Tạo môn học thành công');
      setShowAdd(false); setForm({ name: '', description: '', color: '#6366f1' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm('Xóa môn học này?')) return;
    try { await deleteSubject(id); toast.success('Đã xóa'); load(); }
    catch { toast.error('Không thể xóa'); }
  };

  const handleAddTopic = async (subjectId) => {
    const name = topicForm[subjectId];
    if (!name?.trim()) return;
    try {
      await createTopic(subjectId, { name });
      toast.success('Thêm chủ đề thành công');
      setTopicForm({ ...topicForm, [subjectId]: '' });
      load();
    } catch { toast.error('Lỗi'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Môn học & Chủ đề</h1>
          <p className="page-subtitle">Quản lý danh sách môn học và chủ đề</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Thêm môn học
        </button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Thêm môn học mới</h3>
          <form onSubmit={handleAddSubject}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tên môn học *</label>
                <input className="form-input" placeholder="VD: Lập trình Web" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Màu sắc</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid #fff' : '2px solid transparent', transition: 'var(--transition)' }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mô tả</label>
              <textarea className="form-textarea" rows={2} placeholder="Mô tả ngắn..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Tạo môn học</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : subjects.length === 0 ? (
        <div className="empty-state card">
          <BookOpen size={48} />
          <h3>Chưa có môn học nào</h3>
          <p>Nhấn "Thêm môn học" để bắt đầu</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subjects.map(subject => (
            <div key={subject.id} className="card" style={{ borderLeft: `4px solid ${subject.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === subject.id ? null : subject.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: subject.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} color={subject.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{subject.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subject.topics?.length || 0} chủ đề</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={e => { e.stopPropagation(); handleDeleteSubject(subject.id); }}>
                    <Trash2 size={14} />
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>{expandedId === subject.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === subject.id && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {subject.topics?.map(t => (
                      <span key={t.id} className="badge badge-primary" style={{ padding: '6px 12px', fontSize: 13 }}>
                        <Tag size={12} /> {t.name}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" style={{ flex: 1 }} placeholder="Tên chủ đề mới..." value={topicForm[subject.id] || ''} onChange={e => setTopicForm({ ...topicForm, [subject.id]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && handleAddTopic(subject.id)} />
                    <button className="btn btn-primary" onClick={() => handleAddTopic(subject.id)}><Plus size={14} /> Thêm</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
