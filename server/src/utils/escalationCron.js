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
    }
  });

  const escalationContacts = await prisma.adminEscalationConfig.findFirst(); // assuming only one row

  for (const ticket of overdueTickets) {
    const daysOverdue =
      Math.floor((now - new Date(ticket.deadline)) / (1000 * 60 * 60 * 24));

    if (daysOverdue === 1 && escalationContacts?.itTeamLeadEmail) {
      await sendEscalationEmail(
        escalationContacts.itTeamLeadEmail,
        `Escalation: Ticket #${ticket.id} missed its deadline`,
        `
          <p>Ticket <strong>#${ticket.id}</strong> created by ${ticket.employee.name} (${ticket.employee.email}) has missed its deadline of <strong>${ticket.deadline.toDateString()}</strong>.</p>
          <p>Please ensure it is addressed immediately.</p>
        `
      );
    } else if (daysOverdue >= 2 && escalationContacts?.managerEmail) {
      await sendEscalationEmail(
        escalationContacts.managerEmail,
        `Critical Escalation: Ticket #${ticket.id} unresolved for 2+ days`,
        `
          <p>Ticket <strong>#${ticket.id}</strong> created by ${ticket.employee.name} (${ticket.employee.email}) has remained unresolved for over <strong>${daysOverdue}</strong> days past its deadline (<strong>${ticket.deadline.toDateString()}</strong>).</p>
          <p>This requires immediate attention.</p>
        `
      );
    }
  }
};

// Schedule the task to run every day at 9:30 AM
cron.schedule('30 9 * * *', async () => {
  console.log('Running escalation check...');
  await runEscalationCheck();
});
