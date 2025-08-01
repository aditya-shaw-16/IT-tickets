/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `deadline` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "updatedAt",
ADD COLUMN "deadline" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
ADD COLUMN "resolvedAt" TIMESTAMP(3);

