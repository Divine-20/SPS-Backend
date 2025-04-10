import { Module } from "@nestjs/common";
import { CaseController } from "./case.controller";
import { CaseService } from "./case.service";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [NotificationModule],
  controllers: [CaseController],
  providers: [CaseService],
  exports: [CaseService],
})
export class CaseModule {}
