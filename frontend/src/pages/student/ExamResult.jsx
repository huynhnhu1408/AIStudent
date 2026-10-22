import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAttemptResult } from '../../services/examService';

export default function ExamResult() {
  const { attemptId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.submittedResult || null);
  const [loading, setLoading] = useState(!location.state?.submittedResult);
  useEffect(() => {
    if (location.state?.submittedResult) return;
    getAttemptResult(attemptId).then(({ data }) => setResult(data.data)).catch(error => toast.error(error.response?.data?.message || 'Không tải được kết quả')).finally(() => setLoading(false));
  }, [attemptId, location.state]);
  if (loading) return <div className="empty-state">Đang tải kết quả...</div>;
  const score = Number(result?.score ?? 0);
  const passed = result?.passed ?? score >= 50;
  const reviewQuestions = result?.questions || result?.answers?.map(a => ({ id: a.question_id, content: a.question?.content, choices: a.question?.choices, correct_choice_id: a.question?.choices?.find(c => c.is_correct)?.id, student_answer: a.selected_choice_id, explanation: a.question?.explanation })) || [];
  return <div className="exam-container"><div className="card text-center"><Award size={44} color="var(--primary-light)"/><h1 className="page-title" style={{ marginTop: 12 }}>Kết quả bài thi</h1><p style={{ color: 'var(--text-muted)', marginTop: 6 }}>{result?.exam?.title || 'Bài kiểm tra'}</p><div style={{ fontSize: 56, fontWeight: 800, margin: '20px 0', color: passed ? 'var(--success)' : 'var(--danger)' }}>{score}%</div><span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>{passed ? 'Đạt yêu cầu' : 'Chưa đạt'}</span><p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Số câu đúng: {result?.total_correct ?? result?.totalCorrect ?? reviewQuestions.filter(q => q.is_correct).length} / {result?.total_questions ?? reviewQuestions.length}</p><div className="flex gap-2 justify-between" style={{ justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}><Link className="btn btn-primary" to="/student/exams">Làm bài khác</Link><Link className="btn btn-secondary" to="/student/history">Xem lịch sử</Link></div></div>
    {reviewQuestions.length > 0 && <div style={{ marginTop: 24 }}><h2 style={{ marginBottom: 14 }}>Xem lại câu trả lời</h2>{reviewQuestions.map((q, i) => <div className="question-card" key={q.id}><div className="question-number">Câu {i + 1}</div><div className="question-content">{q.content}</div>{(q.choices || []).map(c => <div key={c.id} style={{ padding: 8, color: c.id === q.correct_choice_id ? 'var(--success)' : c.id === q.student_answer ? 'var(--danger)' : 'var(--text-muted)' }}>{c.id === q.correct_choice_id ? <CheckCircle size={14} style={{ verticalAlign: 'middle' }}/> : c.id === q.student_answer ? <XCircle size={14} style={{ verticalAlign: 'middle' }}/> : null} {c.content}</div>)}{q.explanation && <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Giải thích: {q.explanation}</p>}</div>)}</div>}
  </div>;
}
