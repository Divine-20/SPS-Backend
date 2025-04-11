/*
  Warnings:

  - You are about to drop the column `parentServiceId` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[incidentTrackCode]` on the table `incidents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticketNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_parentServiceId_fkey";

-- AlterTable
ALTER TABLE "incidents" ADD COLUMN     "incidentTrackCode" TEXT;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "parentServiceId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ticketNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incidentTrackCode_key" ON "incidents"("incidentTrackCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_ticketNumber_key" ON "users"("ticketNumber");
