/*
  Warnings:

  - You are about to drop the column `geoLocationId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[passportNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_geoLocationId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "geoLocationId",
ADD COLUMN     "passportNumber" TEXT,
ALTER COLUMN "role" SET DEFAULT 'REPORTER';

-- CreateIndex
CREATE UNIQUE INDEX "users_passportNumber_key" ON "users"("passportNumber");
