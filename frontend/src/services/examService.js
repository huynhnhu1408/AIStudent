import api from './api';
export const getExams = (params) => api.get('/exams', { params });
export const getExam = (id) => api.get(`/exams/${id}`);
export const createExam = (data) => api.post('/exams', data);
export const updateExam = (id, data) => api.put(`/exams/${id}`, data);
export const activateExam = (id) => api.patch(`/exams/${id}/activate`);
export const closeExam = (id) => api.patch(`/exams/${id}/close`);

export const startAttempt = (exam_id) => api.post('/attempts', { exam_id });
export const submitAttempt = (id, answers) => api.post(`/attempts/${id}/submit`, { answers });
export const getMyAttempts = () => api.get('/attempts/my');
export const getAttemptResult = (id) => api.get(`/attempts/${id}/result`);

export const getMyStats = () => api.get('/stats/me');
export const getExamStats = (id) => api.get(`/stats/exam/${id}`);
