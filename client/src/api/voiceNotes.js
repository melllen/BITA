import api from './client.js';

export const uploadVoiceNote = (taskId, blob, durationMs) => {
  const form = new FormData();
  form.append('audio', blob, 'note.webm');
  if (durationMs) form.append('durationMs', String(durationMs));
  return api.post(`/voice-notes/${taskId}`, form).then(r => r.data.voiceNote);
};

export const getVoiceNote = (taskId) =>
  api.get(`/voice-notes/${taskId}`).then(r => r.data.voiceNote);
