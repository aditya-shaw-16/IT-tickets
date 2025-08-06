import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  const password1 = await bcrypt.hash("123456", 10);  // Matches your login
  const password2 = await bcrypt.hash("emp456", 10);
  const password3 = await bcrypt.hash("123456", 10); 
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.createMany({
    data: [
      {
        id: 1,
        name: "Alice Sharma", 
        email: "alice@company.com",
        password: password1,
        role: "EMPLOYEE",
      },
      {
        id: 2,
        name: "Ravi Singh",
        email: "ravi@company.com",
        password: password2,
        role: "EMPLOYEE",
      },
      {
        id: 3,
        name: "IT Support",
        email: "imadishaw@gmail.com",
        password: password3,
        role: "IT",
      },
      {
        id: 4,
        name: "Admin User",
        email: "admin@company.com", 
        password: adminPassword,
        role: "ADMIN",
      },
    ],
  });

  // Create some sample tickets for testing
  await prisma.ticket.createMany({
    data: [
      {
        subject: "Computer not starting",
        description: "My computer won't boot up this morning",
        employeeId: 1,
        priority: "P1",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      },
      {
        subject: "Email not working",
        description: "Cannot send or receive emails",
        employeeId: 2,
        priority: "P2", 
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
      },
    ],
  });

  console.log("✅ Seeded 4 users (2 employees, 1 IT, 1 admin) and 2 tickets");
  await prisma.$disconnect();
}

seed();
