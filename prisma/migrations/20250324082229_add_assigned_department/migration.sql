-- AlterEnum
-- This migration adds the PENDING value to the CaseStatus enum,
-- using a workaround for PostgreSQL's limitation with ALTER TYPE ... ADD VALUE

-- Create a new enum type with all values
CREATE TYPE "CaseStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED');

-- Update the column to use the new enum type
ALTER TABLE "cases" ALTER COLUMN "status" TYPE "CaseStatus_new" USING ("status"::text::"CaseStatus_new");

-- Drop the old enum type
DROP TYPE "CaseStatus";

-- Rename the new enum type to the old name
ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";

-- Now add the assignedDepartment column
ALTER TABLE "cases" ADD COLUMN "assignedDepartment" "Department";