import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEscalationEmail } from '../utils/email.js';

const prisma = new PrismaClient();

const runEscalationCheck = async () => {
  const now = new Date();

  const overdueTickets = await prisma.ticket.findMany({
    where: {
      resolvedAt: null,
      deadline: {
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()) // any deadline before today
      }
    },
    include: {
      employee: true,
      deletedEmployee: true,
    }
  });

  const escalationContacts = await prisma.notificationContacts.findFirst();

  for (const ticket of overdueTickets) {
    const daysOverdue =
      Math.floor((now - new Date(ticket.deadline)) / (1000 * 60 * 60 * 24));

    // Get employee info (active or deleted)
    const employeeName = ticket.employee?.name || ticket.deletedEmployee?.name || 'Unknown Employee';
    const employeeEmail = ticket.employee?.email || ticket.deletedEmployee?.email || 'N/A';

    if (daysOverdue === 1 && escalationContacts?.itTeamLeadEmail) {
      await sendEscalationEmail(
        escalationContacts.itTeamLeadEmail,
        `Escalation: Ticket #${ticket.id} missed its deadline`,
        `
          <p>Ticket <strong>#${ticket.id}</strong> created by ${employeeName} (${employeeEmail}) has missed its deadline of <strong>${ticket.deadline.toDateString()}</strong>.</p>
          <p>Please ensure it is addressed immediately.</p>
        `
      );
    } else if (daysOverdue >= 2 && escalationContacts?.managerEmail) {
      await sendEscalationEmail(
        escalationContacts.managerEmail,
        `Critical Escalation: Ticket #${ticket.id} unresolved for 2+ days`,
        `
          <p>Ticket <strong>#${ticket.id}</strong> created by ${employeeName} (${employeeEmail}) has remained unresolved for over <strong>${daysOverdue}</strong> days past its deadline (<strong>${ticket.deadline.toDateString()}</strong>).</p>
          <p>This requires immediate attention.</p>
        `
      );
    }
  }
};

// Schedule the task to run every day at 11:59 PM (check overdue tickets)
cron.schedule('59 23 * * *', async () => {
  console.log('Running escalation check at 11:59 PM...');
  await runEscalationCheck();
});

// Schedule the task to run every day at 9:00 AM (send notifications)
cron.schedule('0 9 * * *', async () => {
  console.log('Running escalation check at 9:00 AM...');
  await runEscalationCheck();
});
