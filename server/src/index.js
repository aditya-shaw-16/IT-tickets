import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js'; 
import ticketsRouter from './routes/tickets.js';
import contactRoutes from './routes/contacts.js';

import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/api/tickets', ticketsRouter);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'IT Ticketing Backend is running ✅' });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../client/dist');

app.use(express.static(distPath));

app.use((req, res, next) => {
  // If it's an API route, continue to next middleware
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/auth')) {
    return next();
  }
  // Otherwise, serve the React app
  res.sendFile(path.join(distPath, 'index.html'));
});

// Server listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
});