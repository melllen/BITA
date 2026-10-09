import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { upload, getVoiceNote } from '../controllers/voiceNotesController.js';

const router = Router();
router.use(requireAuth);

const memStorage = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/:taskId', memStorage.single('audio'), upload);
router.get('/:taskId', getVoiceNote);

export default router;
