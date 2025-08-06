import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";
import { calculateDeadline } from "../utils/calculateDeadline.js";

const router = express.Router();
const prisma = new PrismaClient();

// POST /tickets - Create a new ticket
router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { subject, description, priority = "P2" } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ error: "Subject and description are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const deadline = calculateDeadline(priority);

    const newTicket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
        deadline,
        employeeId: user.id, // ✅ Use employeeId instead of connect
      },
    });

    res.status(201).json({ message: "Ticket created", ticket: newTicket });
  } catch (err) {
    console.error("Ticket creation error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// GET /tickets - Get all tickets (for IT/Admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        status: { in: ["open", "resolved"] }, // Don't include closed tickets
        archived: false, // Don't include archived tickets
      },
      include: { 
        employee: true,
        deletedEmployee: true 
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});


// GET /tickets/mine - Get user's own tickets
router.get("/mine", authMiddleware, async (req, res) => {
  try {
    const employeeId = req.user.id;

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const tickets = await prisma.ticket.findMany({
      where: {
        employeeId,
        status: { in: ["open", "resolved", "closed"] },
        createdAt: { gte: sixtyDaysAgo },
      },
      include: { 
        employee: true,
        deletedEmployee: true 
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

// PATCH /tickets/:id/confirm - Confirm ticket resolution
router.patch("/:id/confirm", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.employeeId !== userId)
      return res.status(403).json({ error: "Unauthorized action" });
    if (ticket.status !== "resolved")
      return res
        .status(400)
        .json({ error: "Only resolved tickets can be confirmed" });

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

// PATCH /tickets/:id/resolve - Resolve a ticket (for IT/Admin)
router.patch("/:id/resolve", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const user = req.user;

  console.log(`[RESOLVE TICKET] User: ${user.email} (${user.role}) trying to resolve ticket ${ticketId}`);

  // Check if user has IT or ADMIN role
  if (user.role !== 'IT' && user.role !== 'ADMIN') {
    console.log(`[RESOLVE TICKET] Access denied for role: ${user.role}`);
    return res.status(403).json({ error: "Only IT and Admin users can resolve tickets" });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ 
      where: { id: ticketId },
      include: { 
        employee: true,
        deletedEmployee: true 
      }
    });

    if (!ticket) {
      console.log(`[RESOLVE TICKET] Ticket ${ticketId} not found`);
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    if (ticket.status !== "open") {
      console.log(`[RESOLVE TICKET] Ticket ${ticketId} status is ${ticket.status}, not open`);
      return res.status(400).json({ error: "Only open tickets can be resolved" });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: { 
        status: "resolved",
        resolvedAt: new Date()
      },
    });

    console.log(`[RESOLVE TICKET] Successfully resolved ticket ${ticketId}`);
    res.json({ message: "Ticket resolved", ticket: updated });
  } catch (err) {
    console.error("Error resolving ticket:", err);
    res.status(500).json({ error: "Failed to resolve ticket" });
  }
});

// PATCH /tickets/:id/deny - Deny ticket resolution
router.patch("/:id/deny", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.employeeId !== userId)
      return res.status(403).json({ error: "Unauthorized action" });
    if (ticket.status !== "resolved")
      return res
        .status(400)
        .json({ error: "Only resolved tickets can be denied" });

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

// GET /tickets/summary - Dashboard summary
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
          where: { status: "open", createdAt: { gte: startOfToday } },
        }),
        prisma.ticket.count({
          where: { status: "open", createdAt: { lte: twoDaysAgo } },
        }),
      ]);

    res.json({ open, resolved, confirmed, newTickets, approachingDeadlines });
  } catch (err) {
    console.error("Error fetching summary:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// PATCH /tickets/:id/priority - Update ticket priority and deadline
router.patch("/:id/priority", authMiddleware, async (req, res) => {
  const ticketId = parseInt(req.params.id);
  const { priority } = req.body;

  if (!["P0", "P1", "P2"].includes(priority)) {
    return res.status(400).json({ error: "Invalid priority value" });
  }

  try {
    const newDeadline = calculateDeadline(priority); // ✅ Recalculate deadline

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        priority,
        deadline: newDeadline, // ✅ Also update deadline
      },
    });

    res.json({ message: "Priority and deadline updated", ticket: updated });
  } catch (err) {
    console.error("Error updating priority:", err);
    res.status(500).json({ error: "Failed to update priority" });
  }
});


// GET /tickets/closed - Get all closed tickets
router.get("/closed", authMiddleware, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { status: "closed", archived: false }, // ensure not archived
      include: { 
        employee: true,
        deletedEmployee: true 
      },
      orderBy: { resolvedAt: "desc" }, // ✅ use new field
    });

    res.json({ tickets });
  } catch (err) {
    console.error("Error fetching closed tickets:", err);
    res.status(500).json({ error: "Failed to fetch closed tickets" });
  }
});


// AUTO ARCHIVE FUNCTION
export const archiveOldTickets = async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 60); // 60 days ago

  await prisma.ticket.updateMany({
    where: {
      status: "closed",
      updatedAt: { lt: cutoffDate },
      archived: false,
    },
    data: {
      archived: true,
      archivedAt: new Date(),
      archiveReason: "Auto-archived (older than 60 days)",
    },
  });
};

// GET /tickets/archive - Get archived tickets
router.get("/archive", authMiddleware, async (req, res) => {
  try {
    const archivedTickets = await prisma.ticket.findMany({
      where: { archived: true },
      include: { 
        employee: true,
        deletedEmployee: true 
      },
      orderBy: { archivedAt: "desc" },
    });

    const formatted = archivedTickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      archivedAt: t.archivedAt,
      archiveReason: t.archiveReason,
      employeeId: t.employee?.id || t.deletedEmployee?.id,
      employeeName: t.employee?.name || t.deletedEmployee?.name || 'Deleted User',
      employeeEmail: t.employee?.email || t.deletedEmployee?.email || 'N/A',
    }));

    res.json({ tickets: formatted });
  } catch (err) {
    console.error("Error fetching archived tickets:", err);
    res.status(500).json({ error: "Failed to fetch archived tickets" });
  }
});

export default router;
