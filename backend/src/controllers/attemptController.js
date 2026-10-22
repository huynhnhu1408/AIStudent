const { Attempt, AttemptAnswer, Exam, Question, Choice, ExamQuestion, Topic, Subject } = require('../models');

// POST /api/attempts — start exam
const startAttempt = async (req, res, next) => {
  try {
    const { exam_id } = req.body;
    const exam = await Exam.findByPk(exam_id, {
      include: [{
        model: Question, as: 'questions',
        include: [{ model: Choice, as: 'choices' }],
      }],
    });
    
    if (!exam) return res.status(404).json({ success: false, message: 'Bài thi không tồn tại' });
    if (exam.status !== 'active') return res.status(400).json({ success: false, message: 'Bài thi chưa được mở' });
    
    // Check existing in-progress attempt
    const existing = await Attempt.findOne({ where: { exam_id, student_id: req.user.id, status: 'in_progress' } });
    if (existing) return res.status(400).json({ success: false, message: 'Bạn đang có bài thi chưa nộp', data: { attempt_id: existing.id } });

    const attempt = await Attempt.create({ exam_id, student_id: req.user.id });
    
    // Shuffle questions if needed
    let questions = [...exam.questions];
    if (exam.shuffle_questions) questions = questions.sort(() => Math.random() - 0.5);
    
    // Remove correct answer info for student
    const safeQuestions = questions.map(q => ({
      id: q.id,
      content: q.content,
      difficulty: q.difficulty,
      choices: q.choices
        .sort((a, b) => exam.shuffle_choices ? Math.random() - 0.5 : a.order_index - b.order_index)
        .map(c => ({ id: c.id, content: c.content, order_index: c.order_index })),
    }));

    res.status(201).json({
      success: true,
      data: {
        attempt_id: attempt.id,
        exam: { id: exam.id, title: exam.title, duration_minutes: exam.duration_minutes },
        questions: safeQuestions,
        started_at: attempt.started_at,
      },
    });
  } catch (err) { next(err); }
};

// POST /api/attempts/:id/submit — submit exam
const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({ where: { id: req.params.id, student_id: req.user.id } });
    if (!attempt) return res.status(404).json({ success: false, message: 'Lượt làm bài không tồn tại' });
    if (attempt.status !== 'in_progress') return res.status(400).json({ success: false, message: 'Bài thi đã được nộp' });

    const { answers } = req.body; // [{ question_id, choice_id, time_spent }]
    const exam = await Exam.findByPk(attempt.exam_id);
    
    let totalCorrect = 0;
    const answerRecords = [];
    
    for (const a of answers) {
      const correctChoice = await Choice.findOne({ where: { question_id: a.question_id, is_correct: true } });
      const isCorrect = correctChoice && correctChoice.id === a.choice_id;
      if (isCorrect) totalCorrect++;
      
      answerRecords.push({
        attempt_id: attempt.id,
        question_id: a.question_id,
        selected_choice_id: a.choice_id || null,
        is_correct: isCorrect,
        time_spent_seconds: a.time_spent || 0,
      });
    }

    await AttemptAnswer.bulkCreate(answerRecords);
    const score = answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0;
    
    await attempt.update({ status: 'submitted', submitted_at: new Date(), score, total_correct: totalCorrect });

    // Return result with explanations
    const fullQuestions = await Question.findAll({
      where: { id: answers.map(a => a.question_id) },
      include: [{ model: Choice, as: 'choices' }],
    });

    res.json({
      success: true,
      data: {
        score,
        total_correct: totalCorrect,
        total_questions: answers.length,
        passed: score >= (exam.pass_score || 50),
        questions: fullQuestions.map(q => ({
          id: q.id,
          content: q.content,
          explanation: q.explanation,
          choices: q.choices,
          correct_choice_id: q.choices.find(c => c.is_correct)?.id,
          student_answer: answers.find(a => a.question_id === q.id)?.choice_id,
        })),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/attempts/my — student's history
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.findAll({
      where: { student_id: req.user.id, status: ['submitted', 'timed_out'] },
      include: [{ model: Exam, as: 'exam', include: [{ model: Subject, as: 'subject' }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: attempts });
  } catch (err) { next(err); }
};

// GET /api/attempts/:id/result
const getAttemptResult = async (req, res, next) => {
  try {
    const attempt = await Attempt.findOne({
      where: { id: req.params.id, student_id: req.user.id },
      include: [
        { model: Exam, as: 'exam' },
        {
          model: AttemptAnswer, as: 'answers',
          include: [
            { model: Question, as: 'question', include: [{ model: Choice, as: 'choices' }] },
            { model: Choice, as: 'selectedChoice' },
          ],
        },
      ],
    });
    if (!attempt) return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả' });
    res.json({ success: true, data: attempt });
  } catch (err) { next(err); }
};

module.exports = { startAttempt, submitAttempt, getMyAttempts, getAttemptResult };
