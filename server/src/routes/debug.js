import express from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEscalationEmail } from '../utils/email.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

// Test escalation email system
router.post('/escalation-test', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    console.log(`\n🔍 [ESCALATION TEST] Starting at ${now.toISOString()}`);

    // Find overdue tickets
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

    console.log(`📊 Found ${overdueTickets.length} overdue tickets`);

    // Get escalation contacts
    const escalationContacts = await prisma.notificationContacts.findFirst();
    
    if (!escalationContacts) {
      console.log('❌ No escalation contacts configured');
      return res.status(404).json({ 
        success: false,
        error: 'No escalation contacts configured. Please set up escalation contacts first.',
        overdueTickets: overdueTickets.length
      });
    }

    console.log('📧 Escalation contacts found:', {
      itTeamLeadEmail: escalationContacts.itTeamLeadEmail,
      managerEmail: escalationContacts.managerEmail
    });

    let emailsSent = 0;
    let emailDetails = [];

    for (const ticket of overdueTickets) {
      const daysOverdue = Math.floor((now - new Date(ticket.deadline)) / (1000 * 60 * 60 * 24));
      
      const employeeName = ticket.employee?.name || ticket.deletedEmployee?.name || 'Unknown Employee';
      const employeeEmail = ticket.employee?.email || ticket.deletedEmployee?.email || 'N/A';

      console.log(`🎫 Ticket #${ticket.id}: ${daysOverdue} days overdue (Deadline: ${ticket.deadline.toDateString()})`);

      if (daysOverdue === 1 && escalationContacts?.itTeamLeadEmail) {
        try {
          await sendEscalationEmail(
            escalationContacts.itTeamLeadEmail,
            `[TEST] Escalation: Ticket #${ticket.id} missed its deadline`,
            `
              <h3>🚨 Escalation Alert - Ticket Overdue</h3>
              <p><strong>Ticket #${ticket.id}</strong> created by ${employeeName} (${employeeEmail}) has missed its deadline of <strong>${ticket.deadline.toDateString()}</strong>.</p>
              <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
              <p>Please ensure it is addressed immediately.</p>
              <p><em>This is a test email from the escalation system.</em></p>
            `
          );
          emailsSent++;
          emailDetails.push({
            ticketId: ticket.id,
            recipient: 'IT Team Lead',
            email: escalationContacts.itTeamLeadEmail,
            daysOverdue: daysOverdue,
            reason: '1 day overdue'
          });
          console.log(`✅ Email sent to IT Team Lead for ticket #${ticket.id}`);
        } catch (error) {
          console.log(`❌ Failed to send email for ticket #${ticket.id}:`, error.message);
          emailDetails.push({
            ticketId: ticket.id,
            recipient: 'IT Team Lead',
            email: escalationContacts.itTeamLeadEmail,
            error: error.message,
            status: 'failed'
          });
        }
      } else if (daysOverdue >= 2 && escalationContacts?.managerEmail) {
        try {
          await sendEscalationEmail(
            escalationContacts.managerEmail,
            `[TEST] Critical Escalation: Ticket #${ticket.id} unresolved for ${daysOverdue}+ days`,
            `
              <h3>🔴 Critical Escalation Alert</h3>
              <p><strong>Ticket #${ticket.id}</strong> created by ${employeeName} (${employeeEmail}) has remained unresolved for over <strong>${daysOverdue}</strong> days past its deadline (<strong>${ticket.deadline.toDateString()}</strong>).</p>
              <p><strong>Days Overdue:</strong> ${daysOverdue}</p>
              <p>This requires immediate attention.</p>
              <p><em>This is a test email from the escalation system.</em></p>
            `
          );
          emailsSent++;
          emailDetails.push({
            ticketId: ticket.id,
            recipient: 'Manager',
            email: escalationContacts.managerEmail,
            daysOverdue: daysOverdue,
            reason: `${daysOverdue}+ days overdue`
          });
          console.log(`✅ Email sent to Manager for ticket #${ticket.id}`);
        } catch (error) {
          console.log(`❌ Failed to send email for ticket #${ticket.id}:`, error.message);
          emailDetails.push({
            ticketId: ticket.id,
            recipient: 'Manager',
            email: escalationContacts.managerEmail,
            error: error.message,
            status: 'failed'
          });
        }
      } else {
        console.log(`⏳ Ticket #${ticket.id}: ${daysOverdue} days overdue - No email criteria met`);
        emailDetails.push({
          ticketId: ticket.id,
          daysOverdue: daysOverdue,
          reason: 'Not eligible for escalation yet (needs 1+ days)'
        });
      }
    }

    console.log(`\n📈 Escalation test completed: ${emailsSent} emails sent\n`);

    res.json({
      success: true,
      message: 'Escalation test completed',
      overdueTickets: overdueTickets.length,
      emailsSent: emailsSent,
      escalationContactsConfigured: true,
      contacts: {
        itTeamLead: escalationContacts.itTeamLeadEmail,
        manager: escalationContacts.managerEmail
      },
      emailDetails: emailDetails,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('❌ Error in escalation test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to run escalation test', 
      details: error.message 
    });
  }
});

// Create test overdue ticket for email testing
router.post('/create-overdue-ticket', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { daysOverdue = 1 } = req.body;
    
    // Create a deadline that's X days in the past
    const pastDeadline = new Date();
    pastDeadline.setDate(pastDeadline.getDate() - daysOverdue);
    pastDeadline.setHours(23, 59, 59, 999); // End of that day
    
    const testTicket = await prisma.ticket.create({
      data: {
        subject: `Test Overdue Ticket (${daysOverdue} days overdue)`,
        description: `This is a test ticket created to be ${daysOverdue} days overdue for escalation email testing.`,
        priority: 'P1',
        deadline: pastDeadline,
        employeeId: 1, // Admin user
      }
    });

    console.log(`🎫 Created test ticket #${testTicket.id} with deadline ${daysOverdue} days ago`);
    
    res.json({
      success: true,
      message: `Created test ticket that is ${daysOverdue} days overdue`,
      ticket: {
        id: testTicket.id,
        subject: testTicket.subject,
        deadline: testTicket.deadline,
        daysOverdue: daysOverdue
      }
    });

  } catch (error) {
    console.error('❌ Error creating test ticket:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create test ticket', 
      details: error.message 
    });
  }
});

export default router;
