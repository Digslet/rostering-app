/*
  Warnings:

  - You are about to drop the column `accessLevel` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `homeDepartmentId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `homeWardId` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `wardId` on the `RosterPattern` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `ShiftAdvertisement` table. All the data in the column will be lost.
  - You are about to drop the column `shiftDefinitionId` on the `ShiftAdvertisement` table. All the data in the column will be lost.
  - You are about to drop the column `wardId` on the `ShiftAdvertisement` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `ShiftDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `ShiftDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `wardId` on the `ShiftDefinition` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `ShiftInstance` table. All the data in the column will be lost.
  - You are about to drop the column `leaveCategoryId` on the `ShiftInstance` table. All the data in the column will be lost.
  - You are about to drop the column `wardId` on the `ShiftInstance` table. All the data in the column will be lost.
  - You are about to drop the column `wardId` on the `StaffingRequirement` table. All the data in the column will be lost.
  - You are about to drop the `Ward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DeptManagers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_OrgAdmins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PreferredAvailabilityWards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_WardManagers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `organizationId` to the `AssignedPattern` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organizationId` to the `EmployeeAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `LeaveRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `PatternItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `RosterPattern` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `ShiftAdvertisement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ShiftClaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMinutes` to the `ShiftDefinition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `ShiftDefinition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTimeMinutes` to the `ShiftDefinition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `ShiftInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `StaffingRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `StaffingRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ManagerLevel" AS ENUM ('ORG', 'DEPT', 'LOCATION');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_homeDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_homeWardId_fkey";

-- DropForeignKey
ALTER TABLE "RosterPattern" DROP CONSTRAINT "RosterPattern_wardId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftAdvertisement" DROP CONSTRAINT "ShiftAdvertisement_shiftDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftDefinition" DROP CONSTRAINT "ShiftDefinition_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftDefinition" DROP CONSTRAINT "ShiftDefinition_wardId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftInstance" DROP CONSTRAINT "ShiftInstance_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftInstance" DROP CONSTRAINT "ShiftInstance_leaveCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftInstance" DROP CONSTRAINT "ShiftInstance_shiftDefinitionId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftInstance" DROP CONSTRAINT "ShiftInstance_wardId_fkey";

-- DropForeignKey
ALTER TABLE "StaffingRequirement" DROP CONSTRAINT "StaffingRequirement_wardId_fkey";

-- DropForeignKey
ALTER TABLE "Ward" DROP CONSTRAINT "Ward_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "_DeptManagers" DROP CONSTRAINT "_DeptManagers_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeptManagers" DROP CONSTRAINT "_DeptManagers_B_fkey";

-- DropForeignKey
ALTER TABLE "_OrgAdmins" DROP CONSTRAINT "_OrgAdmins_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrgAdmins" DROP CONSTRAINT "_OrgAdmins_B_fkey";

-- DropForeignKey
ALTER TABLE "_PreferredAvailabilityWards" DROP CONSTRAINT "_PreferredAvailabilityWards_A_fkey";

-- DropForeignKey
ALTER TABLE "_PreferredAvailabilityWards" DROP CONSTRAINT "_PreferredAvailabilityWards_B_fkey";

-- DropForeignKey
ALTER TABLE "_WardManagers" DROP CONSTRAINT "_WardManagers_A_fkey";

-- DropForeignKey
ALTER TABLE "_WardManagers" DROP CONSTRAINT "_WardManagers_B_fkey";

-- DropIndex
DROP INDEX "Employee_userId_key";

-- DropIndex
DROP INDEX "EmployeeAvailability_employeeId_date_idx";

-- DropIndex
DROP INDEX "ShiftInstance_wardId_date_idx";

-- AlterTable
ALTER TABLE "AssignedPattern" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "accessLevel",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "homeDepartmentId",
DROP COLUMN "homeWardId",
DROP COLUMN "lastName",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "EmployeeAvailability" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmployeeRole" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LeaveCategory" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PatternItem" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RosterPattern" DROP COLUMN "wardId",
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShiftAdvertisement" DROP COLUMN "date",
DROP COLUMN "shiftDefinitionId",
DROP COLUMN "wardId",
ADD COLUMN     "locationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShiftClaim" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShiftDefinition" DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "wardId",
ADD COLUMN     "durationMinutes" INTEGER NOT NULL,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "startTimeMinutes" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ShiftInstance" DROP COLUMN "date",
DROP COLUMN "leaveCategoryId",
DROP COLUMN "wardId",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "locationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StaffingRequirement" DROP COLUMN "wardId",
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Ward";

-- DropTable
DROP TABLE "_DeptManagers";

-- DropTable
DROP TABLE "_OrgAdmins";

-- DropTable
DROP TABLE "_PreferredAvailabilityWards";

-- DropTable
DROP TABLE "_WardManagers";

-- DropEnum
DROP TYPE "AccessLevel";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeLocationAffiliation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "EmployeeLocationAffiliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagementRole" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "locationId" TEXT,
    "level" "ManagerLevel" NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "ManagementRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PreferredAvailabilityLocations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PreferredAvailabilityLocations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "EmployeeLocationAffiliation_organizationId_locationId_idx" ON "EmployeeLocationAffiliation"("organizationId", "locationId");

-- CreateIndex
CREATE INDEX "EmployeeLocationAffiliation_organizationId_employeeId_idx" ON "EmployeeLocationAffiliation"("organizationId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLocationAffiliation_employeeId_locationId_key" ON "EmployeeLocationAffiliation"("employeeId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementRole_employeeId_organizationId_departmentId_locat_key" ON "ManagementRole"("employeeId", "organizationId", "departmentId", "locationId");

-- CreateIndex
CREATE INDEX "_PreferredAvailabilityLocations_B_index" ON "_PreferredAvailabilityLocations"("B");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_targetId_idx" ON "AuditLog"("organizationId", "targetId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_timestamp_idx" ON "AuditLog"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_timestamp_idx" ON "AuditLog"("actorId", "timestamp");

-- CreateIndex
CREATE INDEX "Employee_organizationId_userId_idx" ON "Employee"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "EmployeeAvailability_organizationId_employeeId_date_idx" ON "EmployeeAvailability"("organizationId", "employeeId", "date");

-- CreateIndex
CREATE INDEX "ShiftInstance_organizationId_locationId_startTime_endTime_idx" ON "ShiftInstance"("organizationId", "locationId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "ShiftInstance_employeeId_startTime_idx" ON "ShiftInstance"("employeeId", "startTime");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLocationAffiliation" ADD CONSTRAINT "EmployeeLocationAffiliation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLocationAffiliation" ADD CONSTRAINT "EmployeeLocationAffiliation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLocationAffiliation" ADD CONSTRAINT "EmployeeLocationAffiliation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementRole" ADD CONSTRAINT "ManagementRole_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementRole" ADD CONSTRAINT "ManagementRole_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementRole" ADD CONSTRAINT "ManagementRole_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagementRole" ADD CONSTRAINT "ManagementRole_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftDefinition" ADD CONSTRAINT "ShiftDefinition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftDefinition" ADD CONSTRAINT "ShiftDefinition_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftDefinition" ADD CONSTRAINT "ShiftDefinition_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffingRequirement" ADD CONSTRAINT "StaffingRequirement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffingRequirement" ADD CONSTRAINT "StaffingRequirement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterPattern" ADD CONSTRAINT "RosterPattern_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterPattern" ADD CONSTRAINT "RosterPattern_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RosterPattern" ADD CONSTRAINT "RosterPattern_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatternItem" ADD CONSTRAINT "PatternItem_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedPattern" ADD CONSTRAINT "AssignedPattern_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftInstance" ADD CONSTRAINT "ShiftInstance_shiftDefinitionId_fkey" FOREIGN KEY ("shiftDefinitionId") REFERENCES "ShiftDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftInstance" ADD CONSTRAINT "ShiftInstance_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftInstance" ADD CONSTRAINT "ShiftInstance_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftInstance" ADD CONSTRAINT "ShiftInstance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftAdvertisement" ADD CONSTRAINT "ShiftAdvertisement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftClaim" ADD CONSTRAINT "ShiftClaim_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAvailability" ADD CONSTRAINT "EmployeeAvailability_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredAvailabilityLocations" ADD CONSTRAINT "_PreferredAvailabilityLocations_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredAvailabilityLocations" ADD CONSTRAINT "_PreferredAvailabilityLocations_B_fkey" FOREIGN KEY ("B") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
