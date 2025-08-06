-- DropForeignKey
ALTER TABLE "public"."Ticket" DROP CONSTRAINT "Ticket_employeeId_fkey";

-- AlterTable
ALTER TABLE "public"."Ticket" ADD COLUMN     "deletedEmployeeId" INTEGER,
ALTER COLUMN "employeeId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."DeletedUser" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedBy" TEXT NOT NULL,

    CONSTRAINT "DeletedUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ticket" ADD CONSTRAINT "Ticket_deletedEmployeeId_fkey" FOREIGN KEY ("deletedEmployeeId") REFERENCES "public"."DeletedUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
