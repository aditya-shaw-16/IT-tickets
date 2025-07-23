import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendResetEmail } from '../utils/email.js'; // ✅ USE THIS

const router = express.Router();
const prisma = new PrismaClient();

// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// ✅ FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15); // 15 mins

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log(`[🔐 RESET LINK] ${resetUrl}`);

    await sendResetEmail(email, resetUrl); // ✅ use the actual utility function

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: "Server error. Check console for details." });
  }
});

// ✅ RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword)
    return res.status(400).json({ error: "Token and new password are required" });

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // token must not be expired
        },
      },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(500).json({ error: "Server error. Try again later." });
  }
});

// PATCH /auth/changePassword
router.patch('/changePassword', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new password required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

// PATCH /auth/changePhone
router.patch('/changePhone', authMiddleware, async (req, res) => {
  const { currentPassword, newPhone } = req.body;

  if (!currentPassword || !newPhone) {
    return res.status(400).json({ error: 'Both current password and new phone are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { phone: newPhone },
    });

    res.json({ message: 'Phone number updated successfully' });
  } catch (err) {
    console.error('Change phone error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




export default router;
