import { useState, useEffect } from 'react';
import { Sparkles, Upload, FileText, Settings, CheckCircle, Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSubjects } from '../../services/subjectService';
import { generateAI, extractText } from '../../services/questionService';

export default function AIGenerate() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [topics, setTopics] = useState([]);
  const [inputMode, setInputMode] = useState('text'); // 'text' | 'file'
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  useEffect(() => { getSubjects().then(r => setSubjects(r.data.data)); }, []);

  useEffect(() => {
    const subject = subjects.find(s => s.id == selectedSubjectId);
    setTopics(subject?.topics || []);
    setSelectedTopicId('');
  }, [selectedSubjectId, subjects]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await extractText(formData);
      setContent(data.data.extracted_text);
      toast.success('Trích xuất nội dung thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đọc file');
    } finally { setExtracting(false); }
  };

  const handleGenerate = async () => {
    if (!selectedTopicId) { toast.error('Vui lòng chọn chủ đề'); return; }
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung bài học'); return; }
    setLoading(true);
    try {
      const { data } = await generateAI({ topic_id: selectedTopicId, content, num_questions: numQuestions, difficulty });
      setGeneratedQuestions(data.data);
      toast.success(`Tạo thành công ${data.data.length} câu hỏi!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo câu hỏi');
    } finally { setLoading(false); }
  };

  const difficultyMap = { easy: { label: 'Dễ', color: 'var(--success)' }, medium: { label: 'Trung bình', color: 'var(--warning)' }, hard: { label: 'Khó', color: 'var(--danger)' } };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">✨ Tạo câu hỏi bằng AI</h1>
          <p className="page-subtitle">Nhập nội dung bài học, AI sẽ tự động tạo câu hỏi trắc nghiệm</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Config Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={18} color="var(--primary-light)" /> Cấu hình
            </h3>

            <div className="form-group">
              <label className="form-label">Môn học *</label>
              <select className="form-select" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                <option value="">-- Chọn môn học --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Chủ đề *</label>
              <select className="form-select" value={selectedTopicId} onChange={e => setSelectedTopicId(e.target.value)} disabled={!selectedSubjectId}>
                <option value="">-- Chọn chủ đề --</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Số câu hỏi</label>
                <select className="form-select" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))}>
                  {[3, 5, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n} câu</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Độ khó</label>
                <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option value="easy">🟢 Dễ</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="hard">🔴 Khó</option>
                </select>
              </div>
            </div>
          </div>

          {/* Input mode toggle */}
          <div className="card">
            <div className="tabs" style={{ marginBottom: 16 }}>
              <div className={`tab ${inputMode === 'text' ? 'active' : ''}`} onClick={() => setInputMode('text')}>✏️ Nhập text</div>
              <div className={`tab ${inputMode === 'file' ? 'active' : ''}`} onClick={() => setInputMode('file')}>📄 Upload file</div>
            </div>

            {inputMode === 'file' ? (
              <div>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, border: '2px dashed var(--border)', borderRadius: 8, cursor: 'pointer', gap: 8, transition: 'var(--transition)' }}
                  onDragOver={e => e.preventDefault()}>
                  {extracting ? <Loader size={32} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={32} color="var(--text-dim)" />}
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{extracting ? 'Đang trích xuất...' : 'Kéo thả hoặc nhấn để upload PDF/TXT'}</span>
                  <input type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleFileUpload} disabled={extracting} />
                </label>
                {content && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--success)' }}>✅ Đã trích xuất {content.length} ký tự</div>}
              </div>
            ) : (
              <textarea className="form-textarea" rows={8} placeholder="Nhập nội dung bài học vào đây... (tối thiểu 50 ký tự)" value={content} onChange={e => setContent(e.target.value)} />
            )}

            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>{content.length} ký tự</div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={handleGenerate} disabled={loading || !content.trim() || !selectedTopicId}>
            {loading ? (<><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Đang tạo câu hỏi...</>) : (<><Sparkles size={18} /> Tạo {numQuestions} câu hỏi bằng AI</>)}
          </button>
        </div>

        {/* Generated Questions */}
        <div>
          {generatedQuestions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🤖</div>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Sẵn sàng tạo câu hỏi</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Điền thông tin bên trái và nhấn "Tạo câu hỏi bằng AI"</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16 }}>✅ {generatedQuestions.length} câu hỏi đã tạo (đang chờ duyệt)</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setGeneratedQuestions([])}><RefreshCw size={14} /> Tạo lại</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {generatedQuestions.map((q, i) => (
                  <div key={q.id} className="card question-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div className="question-number">Câu {i + 1}</div>
                      <span className="badge" style={{ background: difficultyMap[difficulty]?.color + '20', color: difficultyMap[difficulty]?.color }}>
                        {difficultyMap[difficulty]?.label}
                      </span>
                    </div>
                    <p style={{ fontWeight: 500, marginBottom: 12, fontSize: 14 }}>{q.content}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {q.choices?.map((c, ci) => (
                        <div key={c.id} style={{ padding: '8px 12px', borderRadius: 6, background: c.is_correct ? 'rgba(16,185,129,0.1)' : 'var(--bg-input)', border: `1px solid ${c.is_correct ? 'var(--success)' : 'var(--border)'}`, fontSize: 13, color: c.is_correct ? 'var(--success)' : 'var(--text)' }}>
                          {['A', 'B', 'C', 'D'][ci]}. {c.content} {c.is_correct && '✓'}
                        </div>
                      ))}
                    </div>
                    {q.explanation && <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', borderRadius: 6, fontSize: 12, color: 'var(--text-muted)' }}>💡 {q.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
