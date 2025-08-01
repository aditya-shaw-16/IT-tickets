-- CreateTable
CREATE TABLE "Archive" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeName" TEXT NOT NULL,
    "employeeEmail" TEXT NOT NULL,

    CONSTRAINT "Archive_pkey" PRIMARY KEY ("id")
);
