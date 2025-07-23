-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'P2',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "deletionRequested" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Ticket_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("createdAt", "description", "employeeId", "id", "priority", "status", "subject", "updatedAt") SELECT "createdAt", "description", "employeeId", "id", "priority", "status", "subject", "updatedAt" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
