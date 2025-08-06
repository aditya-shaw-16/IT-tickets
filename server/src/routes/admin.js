import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ View all users (except admin themselves)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Create a new user (phone removed)
router.post("/create-user", authMiddleware, adminMiddleware, async (req, res) => {
  const { id, name, email, password, role } = req.body;

  if (!id || !name || !email || !password || !role) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const existingId = await prisma.user.findUnique({ where: { id } });
    if (existingId) {
      return res.status(409).json({ error: "Employee code already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id,
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});


// ✅ Delete user by ID and email
router.delete("/users", authMiddleware, adminMiddleware, async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).json({ error: "Employee ID and email are required" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id: parseInt(id), email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found with given ID and email" });
    }

    // Prevent deletion of ADMIN users for safety
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: "Cannot delete admin users" });
    }

    // Get the admin user who is performing the deletion
    const adminUser = req.user; // From authMiddleware

    // Get ticket statistics for logging
    const ticketStats = await prisma.ticket.groupBy({
      by: ['status'],
      where: { employeeId: user.id },
      _count: { status: true }
    });

    const totalTickets = await prisma.ticket.count({
      where: { employeeId: user.id }
    });

    console.log(`[DELETE USER] User: ${user.name} (${user.email}) has ${totalTickets} tickets:`, ticketStats);

    // Create a DeletedUser record to preserve user info for archived tickets
    const deletedUser = await prisma.deletedUser.create({
      data: {
        id: user.id, // Keep the same ID for referential integrity
        name: user.name,
        email: user.email,
        role: user.role,
        deletedBy: adminUser.email
      }
    });

    // First, close all open tickets and archive them
    const closedCount = await prisma.ticket.updateMany({
      where: { 
        employeeId: user.id,
        status: { not: "closed" }
      },
      data: {
        status: "closed",
        resolvedAt: new Date(),
        archived: true,
        archivedAt: new Date(),
        archiveReason: `User account deleted by admin (${adminUser.email}) - tickets auto-closed`,
      },
    });

    // Archive any remaining tickets that were already closed
    const archivedCount = await prisma.ticket.updateMany({
      where: { 
        employeeId: user.id,
        archived: false
      },
      data: {
        archived: true,
        archivedAt: new Date(),
        archiveReason: `User account deleted by admin (${adminUser.email})`,
      },
    });

    // Transfer tickets from User to DeletedUser
    await prisma.ticket.updateMany({
      where: { employeeId: user.id },
      data: { 
        employeeId: null, // Remove reference to active user
        deletedEmployeeId: deletedUser.id // Add reference to deleted user
      },
    });

    // Now safely delete the user
    await prisma.user.delete({ where: { id: user.id } });

    console.log(`[DELETE USER] Successfully deleted user ${user.name} and processed ${totalTickets} tickets`);

    res.json({ 
      message: `User '${user.name}' deleted successfully. ${totalTickets} tickets have been closed, archived, and preserved with user information.`,
      ticketsProcessed: totalTickets,
      ticketsClosed: closedCount.count,
      ticketsArchived: archivedCount.count
    });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user: " + err.message });
  }
});


export default router;
