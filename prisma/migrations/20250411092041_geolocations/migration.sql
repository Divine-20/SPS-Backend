/*
  Warnings:

  - You are about to drop the column `address` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `geo_locations` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `geo_locations` table. All the data in the column will be lost.
  - Added the required column `locationType` to the `geo_locations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `geo_locations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "geo_locations" DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "updatedAt",
ADD COLUMN     "locationType" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentGeoLocationId" TEXT;

-- AddForeignKey
ALTER TABLE "geo_locations" ADD CONSTRAINT "geo_locations_parentGeoLocationId_fkey" FOREIGN KEY ("parentGeoLocationId") REFERENCES "geo_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
