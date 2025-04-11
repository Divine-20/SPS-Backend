-- AlterTable
ALTER TABLE "services" ADD COLUMN     "parentServiceId" TEXT;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_parentServiceId_fkey" FOREIGN KEY ("parentServiceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
