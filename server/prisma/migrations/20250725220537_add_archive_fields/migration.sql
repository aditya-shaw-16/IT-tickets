-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "archiveReason" TEXT,
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "archivedAt" TIMESTAMP(3);
