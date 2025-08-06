// server/routes/contacts.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Save or update contact details
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { itLeadName, itLeadEmail, managerName, managerEmail } = req.body;
  
  console.log("Received contact data:", { itLeadName, itLeadEmail, managerName, managerEmail });

  try {
    const existing = await prisma.notificationContacts.findFirst();
    console.log("Existing contact record:", existing);

    if (existing) {
      const updated = await prisma.notificationContacts.update({
        where: { id: existing.id },
        data: {
          itTeamLeadName: itLeadName,
          itTeamLeadEmail: itLeadEmail,
          managerName: managerName,
          managerEmail: managerEmail,
        },
      });
      console.log("Updated contact record:", updated);
      return res.json({ message: "Contact info updated", data: updated });
    } else {
      const created = await prisma.notificationContacts.create({
        data: { 
          itTeamLeadName: itLeadName,
          itTeamLeadEmail: itLeadEmail, 
          managerName: managerName, 
          managerEmail: managerEmail 
        },
      });
      console.log("Created new contact record:", created);
      return res.json({ message: "Contact info saved", data: created });
    }
  } catch (err) {
    console.error("Failed to save/update contact info:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get contact details
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const contacts = await prisma.notificationContacts.findFirst();
    if (!contacts) {
      return res.status(404).json({ message: "No contact info found" });
    }
    return res.json(contacts);
  } catch (err) {
    console.error("Failed to fetch contact info:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
