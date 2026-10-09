import pool from '../config/db.js';

const BALL_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#8b5cf6', '#10b981', '#f97316', '#06b6d4',
];

function randomColor() {
  return BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
}

function computeOverdueStage(dueAt, createdAt) {
  if (!dueAt) return 0;
  const now = Date.now();
  const due = new Date(dueAt).getTime();
  if (now < due) return 0;
  const msOverdue = now - due;
  return msOverdue >= 24 * 60 * 60 * 1000 ? 2 : 1;
}

export async function getTasks(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM tasks WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map(t => ({ ...t, overdue_stage: computeOverdueStage(t.due_at, t.created_at) }));
}

export async function createTask(userId, { title, description, dueAt, estimatedMinutes, tags, ballColor }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (user_id, title, description, due_at, estimated_minutes, ball_color, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, title, description ?? null, dueAt ?? null, estimatedMinutes ?? null, ballColor ?? randomColor(), tags ?? []]
  );
  return rows[0];
}

export async function updateTask(userId, taskId, fields) {
  const allowed = ['title', 'description', 'due_at', 'estimated_minutes'];
  const updates = [];
  const values = [];
  let i = 1;

  if (fields.title !== undefined)            { updates.push(`title = $${i++}`);             values.push(fields.title); }
  if (fields.description !== undefined)      { updates.push(`description = $${i++}`);        values.push(fields.description); }
  if (fields.dueAt !== undefined)            { updates.push(`due_at = $${i++}`);             values.push(fields.dueAt); }
  if (fields.estimatedMinutes !== undefined) { updates.push(`estimated_minutes = $${i++}`);  values.push(fields.estimatedMinutes); }
  if (fields.tags !== undefined)            { updates.push(`tags = $${i++}`);               values.push(fields.tags); }
  if (fields.ballColor !== undefined)       { updates.push(`ball_color = $${i++}`);         values.push(fields.ballColor); }

  if (updates.length === 0) {
    const err = new Error('No fields to update');
    err.status = 400;
    throw err;
  }

  values.push(taskId, userId);
  const { rows } = await pool.query(
    `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i++} AND user_id = $${i} AND status = 'active' RETURNING *`,
    values
  );
  if (rows.length === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

export async function completeTask(userId, taskId) {
  const { rows } = await pool.query(
    `UPDATE tasks SET status = 'completed', completed_at = NOW()
     WHERE id = $1 AND user_id = $2 AND status = 'active'
     RETURNING *`,
    [taskId, userId]
  );
  if (rows.length === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

export async function deleteTask(userId, taskId) {
  const { rows } = await pool.query(
    `UPDATE tasks SET status = 'deleted' WHERE id = $1 AND user_id = $2 AND status = 'active' RETURNING id`,
    [taskId, userId]
  );
  if (rows.length === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
}

export async function reinstateTask(userId, taskId) {
  const { rows } = await pool.query(
    `UPDATE tasks SET status = 'active', completed_at = NULL, overdue_stage = 0
     WHERE id = $1 AND user_id = $2 AND status = 'completed'
     RETURNING *`,
    [taskId, userId]
  );
  if (rows.length === 0) {
    const err = new Error('Task not found or not completed');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

export async function setCompletionNote(userId, taskId, note) {
  const { rows } = await pool.query(
    `UPDATE tasks SET completion_note = $1
     WHERE id = $2 AND user_id = $3 AND status = 'completed'
     RETURNING *`,
    [note, taskId, userId]
  );
  if (rows.length === 0) {
    const err = new Error('Task not found');
    err.status = 404;
    throw err;
  }
  return rows[0];
}

export async function getHistory(userId) {
  const { rows } = await pool.query(
    `SELECT t.*, vn.id AS vn_id, vn.s3_key, vn.duration_ms
     FROM tasks t
     LEFT JOIN voice_notes vn ON vn.task_id = t.id
     WHERE t.user_id = $1 AND t.status IN ('completed', 'deleted')
     ORDER BY t.completed_at DESC NULLS LAST, t.created_at DESC`,
    [userId]
  );
  return rows;
}
