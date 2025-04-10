/*
  Warnings:

  - You are about to drop the column `images` on the `cases` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cases" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "case_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "case_images" ADD CONSTRAINT "case_images_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
