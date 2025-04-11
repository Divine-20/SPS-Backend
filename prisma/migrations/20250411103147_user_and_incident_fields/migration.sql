/*
  Warnings:

  - You are about to drop the column `incidentTrackCode` on the `incidents` table. All the data in the column will be lost.
  - You are about to drop the column `ticketNumber` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tracking_code]` on the table `incidents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ticket_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tracking_code` to the `incidents` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "incidents_incidentTrackCode_key";

-- DropIndex
DROP INDEX "users_ticketNumber_key";

-- AlterTable
ALTER TABLE "incidents" DROP COLUMN "incidentTrackCode",
ADD COLUMN     "tracking_code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "ticketNumber",
ADD COLUMN     "ticket_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "incidents_tracking_code_key" ON "incidents"("tracking_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_ticket_number_key" ON "users"("ticket_number");
