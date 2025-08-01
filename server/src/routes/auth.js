import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import authMiddleware from '../middleware/authMiddleware.js';
import { sendResetEmail } from '../utils/email.js'; // ✅ USE THIS
import nodemailer from 'nodemailer';

const router = express.Router();
const prisma = new PrismaClient();

const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const otp = generateOTP();
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('OTP Error:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// -------------------- REGISTER WITH OTP --------------------
router.post('/register', async (req, res) => {
  const { name, email, password, otp, employeeId } = req.body;

  if (!name || !email || !password || !otp || !employeeId) {
    return res.status(400).json({ error: 'All fields and OTP are required' });
  }

  const otpData = otpStore.get(email);
  if (!otpData || otpData.otp !== otp || otpData.expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        id: parseInt(employeeId), // ✅ Treat employeeId as primary key `id`
        name,
        email,
        password: hashedPassword,
        role: 'EMPLOYEE',
      },
    });

    otpStore.delete(email);

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


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

export default router;
