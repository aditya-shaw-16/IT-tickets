import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Try adding auth routes
app.use('/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IT Ticketing Backend is running ✅' });
});

// Server listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
});
