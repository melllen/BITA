import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { list, create, update, complete, remove, history, reinstate, addNote } from '../controllers/tasksController.js';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueAt: z.string().datetime().optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  ballColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const updateSchema = createSchema.partial();

router.get('/', list);
router.get('/history', history);
router.post('/', validate(createSchema), create);
router.patch('/:id', validate(updateSchema), update);
router.post('/:id/complete', complete);
router.post('/:id/reinstate', reinstate);
router.patch('/:id/note', addNote);
router.delete('/:id', remove);

export default router;
