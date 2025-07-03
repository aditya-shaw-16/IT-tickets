import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seed() {
  const password1 = await bcrypt.hash("123456", 10);  // Matches your login
  const password2 = await bcrypt.hash("emp456", 10);
  const password3 = await bcrypt.hash("123456", 10); 

  await prisma.user.createMany({
    data: [
      {
        name: "Alice Sharma",
        email: "alice@company.com",
        phone: "9876543210",
        password: password1,
        role: "EMPLOYEE",
      },
      {
        name: "Ravi Singh",
        email: "ravi@company.com",
        phone: "9123456780",
        password: password2,
        role: "EMPLOYEE",
      },
      {
        name: "IT",
        email: "imadishaw@gmail.com",
        phone: "8287277566",
        password: password3,
        role: "IT",
      },
    ],
  });

  console.log("✅ Seeded 2 employee users");
  await prisma.$disconnect();
}

seed();
