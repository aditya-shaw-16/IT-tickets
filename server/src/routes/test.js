import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEscalationEmail } from '../utils/email.js';

const router = express.Router();
const prisma = new PrismaClient();

// Test endpoint to manually trigger escalation check
router.post('/trigger-escalation', async (req, res) => {
  try {
    const now = new Date();

    const overdueTickets = await prisma.ticket.findMany({
      where: {
        resolvedAt: null,
        deadline: {
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate())
        }
      },
      include: {
        employee: true,
        deletedEmployee: true,
      }
    });

    console.log(`Found ${overdueTickets.length} overdue tickets`);

    const escalationContacts = await prisma.notificationContacts.findFirst();
    
    if (!escalationContacts) {
      return res.status(404).json({ 
        error: 'No escalation contacts configured. Please set up escalation contacts first.' 
      });
    }

    console.log('Escalation contacts:', {
      itTeamLeadEmail: escalationContacts.itTeamLeadEmail,
      managerEmail: escalationContacts.managerEmail
    });

    let emailsSent = 0;

    for (const ticket of overdueTickets) {
      const daysOverdue = Math.floor((now - new Date(ticket.deadline)) / (1000 * 60 * 60 * 24));
      
      const employeeName = ticket.employee?.name || ticket.deletedEmployee?.name || 'Unknown Employee';
      const employeeEmail = ticket.employee?.email || ticket.deletedEmployee?.email || 'N/A';

      console.log(`Ticket #${ticket.id}: ${daysOverdue} days overdue`);

      if (daysOverdue === 1 && escalationContacts?.itTeamLeadEmail) {
        await sendEscalationEmail(
          escalationContacts.itTeamLeadEmail,
          `Escalation: Ticket #${ticket.id} missed its deadline`,
          `
            <p>Ticket <strong>#${ticket.id}</strong> created by ${employeeName} (${employeeEmail}) has missed its deadline of <strong>${ticket.deadline.toDateString()}</strong>.</p>
            <p>Please ensure it is addressed immediately.</p>
          `
        );
        emailsSent++;
        console.log(`✅ Sent email to IT Team Lead for ticket #${ticket.id}`);
      } else if (daysOverdue >= 2 && escalationContacts?.managerEmail) {
        await sendEscalationEmail(
          escalationContacts.managerEmail,
          `Critical Escalation: Ticket #${ticket.id} unresolved for 2+ days`,
          `
            <p>Ticket <strong>#${ticket.id}</strong> created by ${employeeName} (${employeeEmail}) has remained unresolved for over <strong>${daysOverdue}</strong> days past its deadline (<strong>${ticket.deadline.toDateString()}</strong>).</p>
            <p>This requires immediate attention.</p>
          `
        );
        emailsSent++;
        console.log(`✅ Sent email to Manager for ticket #${ticket.id}`);
      }
    }

    res.json({
      message: 'Escalation check completed',
      overdueTickets: overdueTickets.length,
      emailsSent: emailsSent,
      escalationContactsConfigured: !!escalationContacts
    });

  } catch (error) {
    console.error('Error in escalation test:', error);
    res.status(500).json({ error: 'Failed to run escalation check', details: error.message });
  }
});

export default router;
