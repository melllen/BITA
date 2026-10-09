import {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
  getHistory,
  reinstateTask,
  setCompletionNote,
} from '../services/tasksService.js';
import { getPresignedUrl } from '../services/s3Service.js';

export async function list(req, res, next) {
  try {
    const tasks = await getTasks(req.user.sub);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const task = await createTask(req.user.sub, req.body);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const task = await updateTask(req.user.sub, req.params.id, req.body);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function complete(req, res, next) {
  try {
    const task = await completeTask(req.user.sub, req.params.id);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteTask(req.user.sub, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function reinstate(req, res, next) {
  try {
    const task = await reinstateTask(req.user.sub, req.params.id);
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function addNote(req, res, next) {
  try {
    const task = await setCompletionNote(req.user.sub, req.params.id, req.body.note ?? '');
    res.json({ task });
  } catch (err) {
    next(err);
  }
}

export async function history(req, res, next) {
  try {
    const rows = await getHistory(req.user.sub);
    const tasks = await Promise.all(
      rows.map(async row => {
        let voiceNote = null;
        if (row.s3_key) {
          const url = await getPresignedUrl(row.s3_key);
          voiceNote = { id: row.vn_id, presignedUrl: url, durationMs: row.duration_ms };
        }
        const { vn_id, s3_key, duration_ms, ...task } = row;
        return { ...task, voiceNote };
      })
    );
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
}
