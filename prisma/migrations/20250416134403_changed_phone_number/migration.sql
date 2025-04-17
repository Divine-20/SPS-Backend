-- AlterEnum
ALTER TYPE "CitizenshipStatus" ADD VALUE 'ANONYMOUS';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phoneNumber" SET DATA TYPE TEXT;

-- RenameIndex
ALTER INDEX "users_phone_number_unique" RENAME TO "users_phoneNumber_key";
