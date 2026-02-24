/*
  Warnings:

  - The `status` column on the `LeaveRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `ShiftInstance` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'PENDING_HOME_APPROVAL', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "homeDepartmentId" TEXT;

-- AlterTable
ALTER TABLE "LeaveRequest" DROP COLUMN "status",
ADD COLUMN     "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ShiftDefinition" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ShiftInstance" DROP COLUMN "status",
ADD COLUMN     "status" "ShiftStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Ward" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ShiftClaim" (
    "id" TEXT NOT NULL,
    "shiftInstanceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "targetManagerId" TEXT,
    "homeManagerId" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DeptManagers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DeptManagers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_OrgAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OrgAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShiftClaim_shiftInstanceId_employeeId_key" ON "ShiftClaim"("shiftInstanceId", "employeeId");

-- CreateIndex
CREATE INDEX "_DeptManagers_B_index" ON "_DeptManagers"("B");

-- CreateIndex
CREATE INDEX "_OrgAdmins_B_index" ON "_OrgAdmins"("B");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_homeDepartmentId_fkey" FOREIGN KEY ("homeDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftClaim" ADD CONSTRAINT "ShiftClaim_shiftInstanceId_fkey" FOREIGN KEY ("shiftInstanceId") REFERENCES "ShiftInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftClaim" ADD CONSTRAINT "ShiftClaim_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeptManagers" ADD CONSTRAINT "_DeptManagers_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeptManagers" ADD CONSTRAINT "_DeptManagers_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgAdmins" ADD CONSTRAINT "_OrgAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrgAdmins" ADD CONSTRAINT "_OrgAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
