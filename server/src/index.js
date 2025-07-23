import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js'; 
import ticketsRouter from './routes/tickets.js';


dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/tickets', ticketsRouter);
app.use('/admin', adminRoutes); 

// Health check route
app.get('/', (req, res) => {
  res.send('IT Ticketing Backend is running ✅');
});

// ✅ GET all tickets
app.get('/tickets', async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { employee: true },
    });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching tickets' });
  }
});

// ✅ POST create a new ticket
app.post('/tickets', async (req, res) => {
  try {
    const { subject, description, employeeEmail, employeeName, employeePhone } = req.body;

    if (!subject || !description || !employeeEmail || !employeeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if employee exists
    let user = await prisma.user.findUnique({
      where: { email: employeeEmail },
    });

    // Create user if not found
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: employeeName,
          email: employeeEmail,
          phone: employeePhone || '',
          role: 'employee',
        },
      });
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        employeeId: user.id,
      },
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

app.patch('/tickets/:id/resolve', async (req, res) => {
  try {
    const updated = await prisma.ticket.update({
      where: { id: Number(req.params.id) },
      data: {
        status: 'resolved',
        updatedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error resolving ticket' });
  }
});

// PATCH: Confirm resolution (employee)
app.patch('/tickets/:id/confirm', async (req, res) => {
  try {
    const updated = await prisma.ticket.update({
      where: { id: Number(req.params.id) },
      data: {
        status: 'closed',
        updatedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error confirming ticket' });
  }
});

// PATCH: Reopen a resolved ticket
app.patch('/tickets/:id/reopen', async (req, res) => {
  try {
    const updated = await prisma.ticket.update({
      where: { id: Number(req.params.id) },
      data: {
        status: 'open',
        updatedAt: new Date(),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error reopening ticket' });
  }
});

// Server listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});