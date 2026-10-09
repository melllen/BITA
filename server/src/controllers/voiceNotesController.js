import pool from '../config/db.js';
import { uploadAudio, getPresignedUrl } from '../services/s3Service.js';
import { v4 as uuidv4 } from 'uuid';

export async function upload(req, res, next) {
  try {
    const { taskId } = req.params;
    const userId = req.user.sub;

    const { rows: taskRows } = await pool.query(
      `SELECT id FROM tasks WHERE id = $1 AND user_id = $2 AND status = 'completed'`,
      [taskId, userId]
    );
    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found or not completed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const key = `voice-notes/${userId}/${taskId}/${uuidv4()}.webm`;
    await uploadAudio(req.file.buffer, key, req.file.mimetype || 'audio/webm');

    const durationMs = req.body.durationMs ? parseInt(req.body.durationMs, 10) : null;

    const { rows } = await pool.query(
      `INSERT INTO voice_notes (task_id, user_id, s3_key, duration_ms)
       VALUES ($1, $2, $3, $4)
       RETURNING id, duration_ms`,
      [taskId, userId, key, durationMs]
    );

    const presignedUrl = await getPresignedUrl(key);
    res.status(201).json({ voiceNote: { id: rows[0].id, durationMs: rows[0].duration_ms, presignedUrl } });
  } catch (err) {
    next(err);
  }
}

export async function getVoiceNote(req, res, next) {
  try {
    const { taskId } = req.params;
    const userId = req.user.sub;

    const { rows } = await pool.query(
      `SELECT vn.id, vn.s3_key, vn.duration_ms
       FROM voice_notes vn
       JOIN tasks t ON t.id = vn.task_id
       WHERE vn.task_id = $1 AND t.user_id = $2`,
      [taskId, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Voice note not found' });
    }

    const vn = rows[0];
    const presignedUrl = await getPresignedUrl(vn.s3_key);
    res.json({ voiceNote: { id: vn.id, durationMs: vn.duration_ms, presignedUrl } });
  } catch (err) {
    next(err);
  }
}
