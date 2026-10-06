import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://friendzone-417c2.firebaseapp.com', 'https://friendzone-417c2.web.app'],
  credentials: true
}));
app.use(express.json());

// 2. Added a Logger: This will print every request to your terminal so you know it's working
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// --- SERVE FRONTEND STATIC FILES ---
// Serves static assets from the 'dist' folder (make sure your frontend build folder is named 'dist')
app.use(express.static(path.join(__dirname, 'dist')));

// Wildcard catch-all route: sends index.html for any frontend client routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BACKEND IS LIVE`);
  //console.log(`Local:            http://localhost:${PORT}`);
  //console.log(`Network (IPv4):   http://127.0.0.1:${PORT}`);
  console.log(`Health Check:     http://127.0.0.1:${PORT}/health`);
});
