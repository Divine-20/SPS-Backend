/*
  Warnings:

  - You are about to drop the column `notes` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `national_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `passport_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nationalId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[passportNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `serviceId` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_national_id_unique";

-- DropIndex
DROP INDEX "users_passport_number_unique";

-- DropIndex
DROP INDEX "users_phone_number_unique";

-- AlterTable
ALTER TABLE "calls" DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "created_at",
DROP COLUMN "national_id",
DROP COLUMN "passport_number",
DROP COLUMN "phone_number",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nationalId" VARCHAR,
ADD COLUMN     "passportNumber" VARCHAR,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_national_id_unique" ON "users"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "users_passport_number_unique" ON "users"("passportNumber");

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
