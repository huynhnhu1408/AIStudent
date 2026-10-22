import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Send } from 'lucide-react';
import { getExam, startAttempt, submitAttempt } from '../../services/examService';

export default function TakeExam() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [questions, setQuestions] = useState(location.state?.attempt?.questions || []);
  const [exam, setExam] = useState(location.state?.attempt?.exam || null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const attemptId = attempt?.attempt_id || location.state?.attemptId;
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!attemptId) {
          const { data: examResponse } = await getExam(examId);
          if (!alive) return;
          setExam(examResponse.data);
          const { data } = await startAttempt(Number(examId));
          if (!alive) return;
          setAttempt(data.data); setQuestions(data.data.questions || []); setExam(data.data.exam);
        } else if (!questions.length) {
          toast.error('Không tìm thấy dữ liệu lượt làm bài. Vui lòng quay lại danh sách bài thi và bắt đầu lại.');
          navigate('/student/exams', { replace: true });
        }
      } catch (error) { toast.error(error.response?.data?.message || 'Không thể tải bài thi'); navigate('/student/exams', { replace: true }); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  // Only initialize when exam id changes; location state is initial data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);
  const duration = useMemo(() => Math.max(1, Number(exam?.duration_minutes || 30) * 60), [exam]);
  useEffect(() => { if (loading || !questions.length) return undefined; const timer = setInterval(() => setSeconds(s => s + 1), 1000); return () => clearInterval(timer); }, [loading, questions.length]);
  const formatTime = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  const handleSubmit = async (automatic = false) => {
    if (!attempt?.attempt_id) { toast.error('Thiếu thông tin lượt làm bài'); return; }
    if (!automatic && !window.confirm('Bạn chắc chắn muốn nộp bài?')) return;
    setSubmitting(true);
    try {
      const payload = questions.map(q => ({ question_id: q.id, choice_id: answers[q.id] || null, time_spent: Math.floor(seconds / Math.max(questions.length, 1)) }));
      const { data } = await submitAttempt(attempt.attempt_id, payload);
      toast.success('Nộp bài thành công');
      navigate(`/attempt/${attempt.attempt_id}/result`, { state: { submittedResult: data.data } });
    } catch (error) { toast.error(error.response?.data?.message || 'Nộp bài thất bại'); }
    finally { setSubmitting(false); }
  };
  useEffect(() => { if (!loading && seconds >= duration && questions.length && !submitting) handleSubmit(true); }, [seconds, duration, loading, questions.length, submitting]);
  if (loading) return <div className="empty-state">Đang tải bài thi...</div>;
  return <div className="exam-container"><div className="page-header"><div><h1 className="page-title">{exam?.title || 'Làm bài kiểm tra'}</h1><p className="page-subtitle">Chọn một đáp án cho mỗi câu hỏi.</p></div><div className={`timer ${duration - seconds < 60 ? 'danger' : ''}`}>{formatTime(Math.max(0, duration - seconds))}</div></div>
    <div className="progress-bar" style={{ marginBottom: 20 }}><div className="progress-fill" style={{ width: `${questions.length ? Object.keys(answers).length / questions.length * 100 : 0}%` }}/></div>
    {questions.map((question, index) => <section className="question-card" key={question.id}><div className="question-number">Câu {index + 1} / {questions.length}</div><div className="question-content">{question.content}</div><div style={{ display: 'grid', gap: 10, marginTop: 18 }}>{(question.choices || []).map((choice, i) => <label key={choice.id} className="choice-option" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, border: `1px solid ${answers[question.id] === choice.id ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', background: answers[question.id] === choice.id ? 'rgba(99,102,241,.12)' : 'transparent' }}><input type="radio" name={`question-${question.id}`} checked={answers[question.id] === choice.id} onChange={() => setAnswers(prev => ({ ...prev, [question.id]: choice.id }))}/><span><strong>{String.fromCharCode(65 + i)}.</strong> {choice.content}</span></label>)}</div></section>)}
    <div className="flex justify-between items-center gap-3"><button className="btn btn-secondary" onClick={() => navigate('/student/exams')}><ArrowLeft size={16}/> Thoát</button><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đã trả lời {Object.keys(answers).length}/{questions.length} câu</span><button className="btn btn-primary" disabled={submitting || !questions.length} onClick={() => handleSubmit(false)}><Send size={16}/>{submitting ? 'Đang nộp...' : 'Nộp bài'}</button></div>
  </div>;
}
