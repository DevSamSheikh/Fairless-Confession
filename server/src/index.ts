import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import societyRoutes from './routes/societies.js';
import reactionRoutes from './routes/reactions.js';
import commentRoutes from './routes/comments.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/societies', societyRoutes);
app.use('/reactions', reactionRoutes);
app.use('/comments', commentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
