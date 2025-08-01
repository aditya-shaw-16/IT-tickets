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
app.use('/tickets', ticketsRouter);
app.use("/api/admin", adminRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('IT Ticketing Backend is running ✅');
});

app.use('/api/contacts', contactRoutes);

// ✅ GET all tickets
// app.get('/tickets', async (req, res) => {
//   try {
//     const tickets = await prisma.ticket.findMany({
//       include: { employee: true },
//     });
//     res.json(tickets);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Error fetching tickets' });
//   }
// });

// ✅ POST create a new ticket
// app.post('/tickets', async (req, res) => {
//   try {
//     const { subject, description, employeeEmail, employeeName, employeePhone } = req.body;

//     if (!subject || !description || !employeeEmail || !employeeName) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Check if employee exists
//     let user = await prisma.user.findUnique({
//       where: { email: employeeEmail },
//     });

//     // Create user if not found
//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           name: employeeName,
//           email: employeeEmail,
//           phone: employeePhone || '',
//           role: 'employee',
//         },
//       });
//     }

//     // Create ticket
//     const ticket = await prisma.ticket.create({
//       data: {
//         subject,
//         description,
//         employeeId: user.id,
//       },
//     });

//     res.status(201).json(ticket);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to create ticket' });
//   }
// });

app.patch('/tickets/:id/resolve', async (req, res) => {
  try {
    const updated = await prisma.ticket.update({
      where: { id: Number(req.params.id) },
      data: {
        status: 'resolved',
        resolvedAt: new Date(), // ✅ Correct field
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error resolving ticket' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../client/dist');

app.use(express.static(distPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Server listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
});