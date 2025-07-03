import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /tickets
router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { subject, description, priority = 'P2' } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ error: "Subject and description are required" });
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
          connect: { id: user.id },
        },
      },
    });

    res.status(201).json({ message: "Ticket created", ticket: newTicket });
  } catch (err) {
    console.error("Ticket creation error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// GET /tickets/mine
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const employeeId = req.user.id;

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const tickets = await prisma.ticket.findMany({
      where: {
        employeeId,
        status: {
          in: ["open", "resolved", "closed"],
        },
        createdAt: {
          gte: sixtyDaysAgo,
        },
      },
      include: {
        employee: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// PATCH /tickets/:id/confirm
router.patch("/:id/confirm", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.employeeId !== userId) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    if (ticket.status !== "resolved") {
      return res
        .status(400)
        .json({ error: "Only resolved tickets can be confirmed" });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "closed" },
    });

    res.json({ message: "Ticket confirmed", ticket: updated });
  } catch (err) {
    console.error("Error confirming ticket:", err);
    res.status(500).json({ error: "Failed to confirm ticket" });
  }
});

// PATCH /tickets/:id/deny
router.patch("/:id/deny", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.employeeId !== userId) {
      return res.status(403).json({ error: "Unauthorized action" });
    }

    if (ticket.status !== "resolved") {
      return res
        .status(400)
        .json({ error: "Only resolved tickets can be denied" });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: "open" },
    });

    res.json({ message: "Ticket sent back to open", ticket: updated });
  } catch (err) {
    console.error("Error denying ticket:", err);
    res.status(500).json({ error: "Failed to deny ticket" });
  }
});

// In ticket.js
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const [open, resolved, confirmed, newTickets, approachingDeadlines] =
      await Promise.all([
        prisma.ticket.count({ where: { status: "open" } }),
        prisma.ticket.count({ where: { status: "resolved" } }),
        prisma.ticket.count({ where: { status: "closed" } }),
        prisma.ticket.count({
          where: {
            status: "open",
            createdAt: { gte: startOfToday },
          },
        }),
        prisma.ticket.count({
          where: {
            status: "open",
            createdAt: { lte: twoDaysAgo },
          },
        }),
      ]);

    res.json({
      open,
      resolved,
      confirmed,
      newTickets,
      approachingDeadlines,
    });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// PATCH /tickets/:id/priority
router.patch("/:id/priority", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { priority } = req.body;

  if (!["P0", "P1", "P2"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority value" });
  }

  try {
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { priority },
    });
    res.json({ message: "Priority updated", ticket: updated });
  } catch (err) {
    console.error("Error updating priority:", err);
    res.status(500).json({ error: "Failed to update priority" });
  }
});

// GET /tickets/closed
router.get('/closed', authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { status: 'closed' },
      include: { employee: true },
      orderBy: { updatedAt: 'desc' }
    });
    res.json({ tickets });
  } catch (err) {
    console.error('Error fetching closed tickets:', err);
    res.status(500).json({ error: 'Failed to fetch closed tickets' });
  }
});


export default router;
