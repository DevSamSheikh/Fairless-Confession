import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import homeRoutes from './routes/home.js';
import societyRoutes from './routes/societies.js';
import createSocietyRoutes from './routes/createSociety.js';
import savedSocietiesRoutes from './routes/savedSocieties.js';
import postRoutes from './routes/post.js';
import interactionRoutes from './routes/interactions.js';
import meRoutes from './routes/me.js';
import myConfessionsRoutes from './routes/myConfessions.js';
import myReactionsRoutes from './routes/myReactions.js';
import searchRoutes from './routes/search.js';
import reportRoutes from './routes/report.js';
import leaveSocietyRoutes from './routes/leaveSociety.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Auth: /api/auth/register, /api/auth/login, /api/auth/forget-password, /api/auth/logout
app.use('/api/auth', authRoutes);

// Home: /api/home, /api/home/trending
app.use('/api/home', homeRoutes);

// Societies: /api/societies, /api/societies/confessions, /api/societies/discover, /api/societies/joined, /api/societies/you, /api/societies/:id, join, leave
app.use('/api/societies', societyRoutes);

// Create society: POST /api/create-society
app.use('/api/create-society', createSocietyRoutes);

// Saved societies: GET/POST/DELETE /api/saved-societies
app.use('/api/saved-societies', savedSocietiesRoutes);

// Leave society: POST /api/leave-society (body: { societyId })
app.use('/api/leave-society', leaveSocietyRoutes);

// Post: POST /api/post, GET /api/post/:id (share link)
app.use('/api/post', postRoutes);

// Interactions: POST /api/interactions/react, POST /api/interactions/comment, GET /api/interactions/post/:postId
app.use('/api/interactions', interactionRoutes);

// Profile: GET /api/me
app.use('/api/me', meRoutes);

// My confessions: GET /api/my-confessions, DELETE /api/my-confession/delete/:id, PATCH /api/my-confession/edit/:id
app.use('/api/my-confessions', myConfessionsRoutes);
app.use('/api/my-confession', myConfessionsRoutes);

// My reactions: GET /api/my-reactions
app.use('/api/my-reactions', myReactionsRoutes);

// Search: GET /api/search?q=
app.use('/api/search', searchRoutes);

// Report: POST /api/report/:postid
app.use('/api/report', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on 0.0.0.0:${PORT}`);
});
