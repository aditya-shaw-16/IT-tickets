import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestDeletedUser() {
  try {
    // Create a test deleted user record so it shows up in Prisma Studio
    const deletedUser = await prisma.deletedUser.create({
      data: {
        id: 999,
        name: "Test Deleted User",
        email: "test@deleted.com",
        role: "EMPLOYEE",
        deletedBy: "system@test.com"
      }
    });
    
    console.log("✅ Created test DeletedUser record:", deletedUser);
    console.log("Now DeletedUser model should be visible in Prisma Studio");
    
  } catch (error) {
    console.error("❌ Error creating DeletedUser:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDeletedUser();
