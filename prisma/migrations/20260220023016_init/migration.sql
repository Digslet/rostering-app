/*
  Warnings:

  - You are about to drop the column `shiftInstanceId` on the `ShiftClaim` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shiftAdvertisementId,employeeId]` on the table `ShiftClaim` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shiftAdvertisementId` to the `ShiftClaim` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('ACTIVE', 'FILLED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
ALTER TYPE "ShiftStatus" ADD VALUE 'OPEN';

-- DropForeignKey
ALTER TABLE "ShiftClaim" DROP CONSTRAINT "ShiftClaim_shiftInstanceId_fkey";

-- DropIndex
DROP INDEX "ShiftClaim_shiftInstanceId_employeeId_key";

-- AlterTable
ALTER TABLE "ShiftClaim" DROP COLUMN "shiftInstanceId",
ADD COLUMN     "shiftAdvertisementId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ShiftAdvertisement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "shiftInstanceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "shiftDefinitionId" TEXT NOT NULL,
    "status" "AdStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftAdvertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAvailability" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "preference" TEXT NOT NULL DEFAULT 'UNAVAILABLE',

    CONSTRAINT "EmployeeAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AdAllowedRoles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AdAllowedRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PreferredAvailabilityWards" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PreferredAvailabilityWards_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShiftAdvertisement_shiftInstanceId_key" ON "ShiftAdvertisement"("shiftInstanceId");

-- CreateIndex
CREATE INDEX "EmployeeAvailability_employeeId_date_idx" ON "EmployeeAvailability"("employeeId", "date");

-- CreateIndex
CREATE INDEX "_AdAllowedRoles_B_index" ON "_AdAllowedRoles"("B");

-- CreateIndex
CREATE INDEX "_PreferredAvailabilityWards_B_index" ON "_PreferredAvailabilityWards"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftClaim_shiftAdvertisementId_employeeId_key" ON "ShiftClaim"("shiftAdvertisementId", "employeeId");

-- AddForeignKey
ALTER TABLE "ShiftAdvertisement" ADD CONSTRAINT "ShiftAdvertisement_shiftInstanceId_fkey" FOREIGN KEY ("shiftInstanceId") REFERENCES "ShiftInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftAdvertisement" ADD CONSTRAINT "ShiftAdvertisement_shiftDefinitionId_fkey" FOREIGN KEY ("shiftDefinitionId") REFERENCES "ShiftDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftClaim" ADD CONSTRAINT "ShiftClaim_shiftAdvertisementId_fkey" FOREIGN KEY ("shiftAdvertisementId") REFERENCES "ShiftAdvertisement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftClaim" ADD CONSTRAINT "ShiftClaim_targetManagerId_fkey" FOREIGN KEY ("targetManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftClaim" ADD CONSTRAINT "ShiftClaim_homeManagerId_fkey" FOREIGN KEY ("homeManagerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAvailability" ADD CONSTRAINT "EmployeeAvailability_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdAllowedRoles" ADD CONSTRAINT "_AdAllowedRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdAllowedRoles" ADD CONSTRAINT "_AdAllowedRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "ShiftAdvertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredAvailabilityWards" ADD CONSTRAINT "_PreferredAvailabilityWards_A_fkey" FOREIGN KEY ("A") REFERENCES "EmployeeAvailability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferredAvailabilityWards" ADD CONSTRAINT "_PreferredAvailabilityWards_B_fkey" FOREIGN KEY ("B") REFERENCES "Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;
