const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Question, Choice } = require('../models');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildPrompt = (content, numQuestions, difficulty) => `
Bạn là một giáo viên chuyên nghiệp. Hãy tạo ${numQuestions} câu hỏi trắc nghiệm độ khó "${difficulty}" (easy=dễ, medium=trung bình, hard=khó) dựa trên nội dung bên dưới.

Yêu cầu:
- Mỗi câu có đúng 4 lựa chọn (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Câu hỏi rõ ràng, không mơ hồ
- Giải thích ngắn gọn tại sao đáp án đúng

Trả về JSON hợp lệ theo format sau, KHÔNG kèm bất kỳ text nào khác:
[
  {
    "question": "Câu hỏi ở đây?",
    "choices": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correct_index": 0,
    "explanation": "Giải thích đáp án đúng..."
  }
]

Nội dung bài học:
${content}
`;

// POST /api/ai/generate
const generateQuestions = async (req, res, next) => {
  try {
    const { topic_id, content, num_questions = 5, difficulty = 'medium' } = req.body;
    
    if (!content || content.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Nội dung quá ngắn, cần ít nhất 50 ký tự' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildPrompt(content.substring(0, 8000), num_questions, difficulty);
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Clean and parse JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(502).json({ success: false, message: 'AI không trả về định dạng JSON hợp lệ' });
    }
    
    const aiQuestions = JSON.parse(jsonMatch[0]);
    
    // Save to DB as pending
    const saved = [];
    for (const q of aiQuestions) {
      const question = await Question.create({
        topic_id,
        content: q.question,
        difficulty,
        explanation: q.explanation,
        status: 'pending',
        created_by: req.user.id,
        ai_generated: true,
      });
      
      const choices = await Choice.bulkCreate(
        q.choices.map((c, i) => ({
          question_id: question.id,
          content: c,
          is_correct: i === q.correct_index,
          order_index: i,
        }))
      );
      
      saved.push({ ...question.toJSON(), choices });
    }

    res.status(201).json({
      success: true,
      message: `Đã tạo ${saved.length} câu hỏi thành công`,
      data: saved,
    });
  } catch (err) {
    if (err.message?.includes('API_KEY')) {
      return res.status(500).json({ success: false, message: 'Gemini API key không hợp lệ' });
    }
    next(err);
  }
};

// POST /api/ai/extract-text  (for uploaded PDF)
const extractAndGenerate = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được upload' });
    }

    let extractedText = '';
    
    if (req.file.mimetype === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(req.file.buffer);
      extractedText = pdfData.text;
    } else {
      // For .txt files
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Không thể trích xuất nội dung từ file' });
    }

    res.json({
      success: true,
      data: { extracted_text: extractedText.substring(0, 10000) },
    });
  } catch (err) { next(err); }
};

module.exports = { generateQuestions, extractAndGenerate };
