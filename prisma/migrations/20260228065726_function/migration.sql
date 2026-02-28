CREATE UNIQUE INDEX "UniqueActiveEmployee" 
ON "Employee" ("organizationId", "userId") 
WHERE "archivedAt" IS NULL AND "userId" IS NOT NULL;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "ShiftInstance" ADD CONSTRAINT "NoOverlappingShifts"
EXCLUDE USING gist (
  "organizationId" WITH =, 
  "employeeId" WITH =, 
  tsrange("startTime", "endTime") WITH &&
) WHERE ("employeeId" IS NOT NULL AND "archivedAt" IS NULL);