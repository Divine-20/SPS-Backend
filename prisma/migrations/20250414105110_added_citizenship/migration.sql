-- CreateEnum
CREATE TYPE "CitizenshipStatus" AS ENUM ('RESIDENT', 'NON_RESIDENT');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "citizenship" "CitizenshipStatus" DEFAULT 'RESIDENT';
