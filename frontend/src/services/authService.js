import api from './api';
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const refresh = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const getMe = () => api.get('/auth/me');
