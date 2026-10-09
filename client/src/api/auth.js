import api from './client.js';

export const getMe = () => api.get('/auth/me').then(r => r.data.user);
export const signup = (data) => api.post('/auth/signup', data).then(r => r.data.user);
export const login = (data) => api.post('/auth/login', data).then(r => r.data.user);
export const logout = () => api.post('/auth/logout');
