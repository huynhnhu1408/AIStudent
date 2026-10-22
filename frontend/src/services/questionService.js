import api from './api';
export const getQuestions = (params) => api.get('/questions', { params });
export const getQuestion = (id) => api.get(`/questions/${id}`);
export const createQuestion = (data) => api.post('/questions', data);
export const updateQuestion = (id, data) => api.put(`/questions/${id}`, data);
export const updateStatus = (id, status) => api.patch(`/questions/${id}/status`, { status });
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);
export const generateAI = (data) => api.post('/ai/generate', data);
export const extractText = (formData) => api.post('/ai/extract', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
