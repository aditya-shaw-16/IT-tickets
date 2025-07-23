import express from "express";
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

// ✅ Delete a user (IT or Employee)
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
