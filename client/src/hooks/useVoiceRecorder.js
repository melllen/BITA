import { useState, useRef, useCallback } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState(null);
  const [durationMs, setDurationMs] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const startTime = useRef(null);

  const start = useCallback(async () => {
    try {
      setBlob(null);
      setDurationMs(null);
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      chunks.current = [];
      mr.ondataavailable = e => e.data.size > 0 && chunks.current.push(e.data);
      mr.onstop = () => {
        const b = new Blob(chunks.current, { type: 'audio/webm' });
        setBlob(b);
        setDurationMs(Date.now() - startTime.current);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      startTime.current = Date.now();
      mediaRecorder.current = mr;
      setIsRecording(true);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorder.current?.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBlob(null);
    setDurationMs(null);
    setError(null);
  }, []);

  return { isRecording, blob, durationMs, error, start, stop, reset };
}
