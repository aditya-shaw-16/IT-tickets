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

    // ✅ Archive tickets of this user
    await prisma.ticket.updateMany({
      where: { employeeId: user.id },
      data: {
        archived: true,
        archivedAt: new Date(),
        archiveReason: "User deleted by admin",
      },
    });

    // ✅ Delete the user
    await prisma.user.delete({ where: { id: user.id } });

    res.json({ message: "User deleted successfully, and their tickets archived." });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});


export default router;
