import api from './client.js';

export const getTasks = () => api.get('/tasks').then(r => r.data.tasks);
export const getHistory = () => api.get('/tasks/history').then(r => r.data.tasks);
export const createTask = (data) => api.post('/tasks', data).then(r => r.data.task);
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data).then(r => r.data.task);
export const completeTask = (id) => api.post(`/tasks/${id}/complete`).then(r => r.data.task);
export const reinstateTask = (id) => api.post(`/tasks/${id}/reinstate`).then(r => r.data.task);
export const setCompletionNote = (id, note) => api.patch(`/tasks/${id}/note`, { note }).then(r => r.data.task);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
