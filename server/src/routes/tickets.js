import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /tickets
router.post('/', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: "Subject and description are required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newTicket = await prisma.ticket.create({
      data: {
        subject,
        description,
        employee: {
          connect: { id: user.id }
        }
      },
    });

    res.status(201).json({ message: "Ticket created", ticket: newTicket });
  } catch (err) {
    console.error("Ticket creation error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// GET /tickets/mine
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const employeeId = req.user.id;

    const tickets = await prisma.ticket.findMany({
      where: {
        employeeId,
        status: {
          in: ['OPEN', 'RESOLVED']
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tickets });
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// PATCH /tickets/:id/confirm
router.patch('/:id/confirm', authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.employeeId !== userId) {
      return res.status(403).json({ error: 'Unauthorized action' });
    }

    if (ticket.status !== 'RESOLVED') {
      return res.status(400).json({ error: 'Only resolved tickets can be confirmed' });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CONFIRMED' },
    });

    res.json({ message: 'Ticket confirmed', ticket: updated });
  } catch (err) {
    console.error('Error confirming ticket:', err);
    res.status(500).json({ error: 'Failed to confirm ticket' });
  }
});

export default router;
