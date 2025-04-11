/*
  Warnings:

  - You are about to drop the column `serviceId` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `calls` table. All the data in the column will be lost.
  - You are about to drop the column `locationType` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `parentGeoLocationId` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `parentServiceId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `operatorId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `faqs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reporterId` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `geo_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latitude` to the `geo_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `geo_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `geo_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `incident_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "IncidentStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "IncidentStatus" ADD VALUE 'CLOSED';

-- DropForeignKey
ALTER TABLE "calls" DROP CONSTRAINT "calls_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "calls" DROP CONSTRAINT "calls_userId_fkey";

-- DropForeignKey
ALTER TABLE "geo_locations" DROP CONSTRAINT "geo_locations_parentGeoLocationId_fkey";

-- DropForeignKey
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_parentServiceId_fkey";

-- AlterTable
ALTER TABLE "calls" DROP COLUMN "serviceId",
DROP COLUMN "userId",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "reporterId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "geo_locations" DROP COLUMN "locationType",
DROP COLUMN "name",
DROP COLUMN "parentGeoLocationId",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "incident_images" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "incidents" ALTER COLUMN "departmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "parentServiceId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "operatorId";

-- DropTable
DROP TABLE "faqs";

-- CreateTable
CREATE TABLE "department_assignments" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_assignments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_assignments" ADD CONSTRAINT "department_assignments_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_assignments" ADD CONSTRAINT "department_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_assignments" ADD CONSTRAINT "department_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
