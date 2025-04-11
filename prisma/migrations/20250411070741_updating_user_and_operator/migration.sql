/*
  Warnings:

  - You are about to drop the column `email` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `operators` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `operators` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `operators` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `operators` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "operators_email_key";

-- DropIndex
DROP INDEX "operators_phoneNumber_key";

-- AlterTable
ALTER TABLE "operators" DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phoneNumber",
DROP COLUMN "role",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "operatorId" TEXT,
ALTER COLUMN "nationalId" DROP NOT NULL,
ALTER COLUMN "role" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "operators_userId_key" ON "operators"("userId");

-- AddForeignKey
ALTER TABLE "operators" ADD CONSTRAINT "operators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
