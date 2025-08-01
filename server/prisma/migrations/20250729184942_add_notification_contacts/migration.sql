-- CreateTable
CREATE TABLE "NotificationContacts" (
    "id" SERIAL NOT NULL,
    "itTeamLeadName" TEXT NOT NULL,
    "itTeamLeadEmail" TEXT NOT NULL,
    "managerName" TEXT NOT NULL,
    "managerEmail" TEXT NOT NULL,

    CONSTRAINT "NotificationContacts_pkey" PRIMARY KEY ("id")
);
