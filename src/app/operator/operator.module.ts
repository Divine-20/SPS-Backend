import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { OperatorController } from "./operator.controller";
import { OperatorService } from "./operator.service";

@Module({
  imports: [PrismaModule],
  controllers: [OperatorController],
  providers: [OperatorService, PrismaService],
  exports: [OperatorService],
})
export class UserModule {}
