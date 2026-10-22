import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Shuffle, Clock, Hash, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSubjects } from '../../services/subjectService';
import { getQuestions } from '../../services/questionService';
import { createExam } from '../../services/examService';

export default function ExamCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    subject_id: '', title: '', description: '',
    duration_minutes: 30, pass_score: 50,
    shuffle_questions: true, shuffle_choices: true,
    start_time: '', end_time: '',
  });
  const [qFilter, setQFilter] = useState({ status: 'approved', difficulty: '', topic_id: '' });

  useEffect(() => { getSubjects().then(r => setSubjects(r.data.data)); }, []);

  const loadQuestions = async () => {
    const { data } = await getQuestions({ ...qFilter, limit: 100 });
    setQuestions(data.data);
  };

  useEffect(() => { if (step === 2) loadQuestions(); }, [step, qFilter]);

  const toggleQuestion = (id) => {
    setSelectedQIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectRandom = (n) => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setSelectedQIds(shuffled.slice(0, n).map(q => q.id));
  };

  const handleCreate = async () => {
    if (selectedQIds.length === 0) { toast.error('Vui lòng chọn ít nhất 1 câu hỏi'); return; }
    setLoading(true);
    try {
      await createExam({ ...form, question_ids: selectedQIds });
      toast.success('Tạo bài thi thành công!');
      navigate('/lecturer/exams');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo bài thi');
    } finally { setLoading(false); }
  };

  const DIFF_COLOR = { easy: 'var(--success)', medium: 'var(--warning)', hard: 'var(--danger)' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tạo bài kiểm tra</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s ? 'var(--primary)' : 'var(--bg-input)', color: step >= s ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{s}</div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="card" style={{ maxWidth: 700 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Bước 1: Thông tin cơ bản</h3>
          <div className="form-group">
            <label className="form-label">Tiêu đề bài thi *</label>
            <input className="form-input" placeholder="VD: Kiểm tra giữa kỳ - Lập trình Web" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Môn học *</label>
            <select className="form-select" value={form.subject_id} onChange={e => setForm({ ...form, subject_id: e.target.value })}>
              <option value="">-- Chọn môn học --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-textarea" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label"><Clock size={13} style={{ display: 'inline' }} /> Thời gian (phút)</label>
              <input className="form-input" type="number" min={5} max={180} value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Điểm qua môn (%)</label>
              <input className="form-input" type="number" min={0} max={100} value={form.pass_score} onChange={e => setForm({ ...form, pass_score: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Thời gian mở</label>
              <input className="form-input" type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Thời gian đóng</label>
              <input className="form-input" type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['shuffle_questions', 'Trộn câu hỏi'], ['shuffle_choices', 'Trộn đáp án']].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                <Shuffle size={14} /> {label}
              </label>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => { if (!form.title || !form.subject_id) { toast.error('Vui lòng điền đầy đủ thông tin'); return; } setStep(2); }}>
            Tiếp theo <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Select questions */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-select" style={{ width: 160 }} value={qFilter.difficulty} onChange={e => setQFilter({ ...qFilter, difficulty: e.target.value })}>
                <option value="">Tất cả độ khó</option>
                <option value="easy">Dễ</option><option value="medium">Trung bình</option><option value="hard">Khó</option>
              </select>
              <span style={{ color: 'var(--text-muted)', fontSize: 14, alignSelf: 'center' }}>Đã chọn: <strong style={{ color: 'var(--primary-light)' }}>{selectedQIds.length}</strong> câu</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 20].map(n => <button key={n} className="btn btn-secondary btn-sm" onClick={() => selectRandom(n)}><Shuffle size={12} /> {n} ngẫu nhiên</button>)}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
            {questions.map(q => (
              <div key={q.id} onClick={() => toggleQuestion(q.id)} style={{ padding: '14px 18px', border: `2px solid ${selectedQIds.includes(q.id) ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', background: selectedQIds.includes(q.id) ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)', display: 'flex', gap: 12, alignItems: 'center', transition: 'var(--transition)' }}>
                <input type="checkbox" checked={selectedQIds.includes(q.id)} onChange={() => {}} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, marginBottom: 4 }}>{q.content}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, color: DIFF_COLOR[q.difficulty] }}>{q.difficulty}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{q.topic?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Quay lại</button>
            <button className="btn btn-primary" onClick={() => setStep(3)} disabled={selectedQIds.length === 0}>Tiếp theo ({selectedQIds.length} câu) <ArrowRight size={16} /></button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Bước 3: Xác nhận & Tạo</h3>
          {[
            ['Tiêu đề', form.title],
            ['Môn học', subjects.find(s => s.id == form.subject_id)?.name],
            ['Thời gian', `${form.duration_minutes} phút`],
            ['Số câu hỏi', `${selectedQIds.length} câu`],
            ['Điểm qua môn', `${form.pass_score}%`],
            ['Trộn câu', form.shuffle_questions ? '✅' : '❌'],
            ['Trộn đáp án', form.shuffle_choices ? '✅' : '❌'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Quay lại</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '🚀 Tạo bài thi (Nháp)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
