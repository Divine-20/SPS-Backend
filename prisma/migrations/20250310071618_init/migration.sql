-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VILLAGE_REPRESENTATIVE', 'CELL_REPRESENTATIVE', 'SECTOR_REPRESENTATIVE', 'DISTRICT_REPRESENTATIVE', 'ADMIN', 'RNP', 'FIRE_DEPARTMENT');

-- CreateEnum
CREATE TYPE "CaseType" AS ENUM ('LANDSLIDES', 'FLOODS', 'EARTHQUAKES', 'FIRE', 'VOLCANIC_ERRUPTION', 'RAIN_STORMS');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "geoLocationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporters" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "geoLocationId" TEXT NOT NULL,

    CONSTRAINT "reporters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL,
    "caseType" "CaseType" NOT NULL,
    "cause" TEXT NOT NULL,
    "startingTime" TIMESTAMP(3) NOT NULL,
    "actionTaken" TEXT,
    "description" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "reporterId" TEXT NOT NULL,
    "geoLocationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geo_locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationType" TEXT NOT NULL,
    "parentGeoLocationId" TEXT,

    CONSTRAINT "geo_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reporters_nationalId_key" ON "reporters"("nationalId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_geoLocationId_fkey" FOREIGN KEY ("geoLocationId") REFERENCES "geo_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporters" ADD CONSTRAINT "reporters_geoLocationId_fkey" FOREIGN KEY ("geoLocationId") REFERENCES "geo_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "reporters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_geoLocationId_fkey" FOREIGN KEY ("geoLocationId") REFERENCES "geo_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geo_locations" ADD CONSTRAINT "geo_locations_parentGeoLocationId_fkey" FOREIGN KEY ("parentGeoLocationId") REFERENCES "geo_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
