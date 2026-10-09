import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import voiceNoteRoutes from './routes/voiceNotes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Disable CSP so Google Fonts and Vite assets work without extra config
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: isProd
    ? (process.env.CLIENT_ORIGIN || false) // same-origin in prod — no CORS needed
    : (process.env.CLIENT_ORIGIN || 'http://localhost:5173'),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/voice-notes', voiceNoteRoutes);

// Serve built React app in production
if (isProd) {
  const dist = path.join(__dirname, '../../client/dist');
  app.use(express.static(dist));
  // SPA fallback — let React Router handle client-side routes
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
