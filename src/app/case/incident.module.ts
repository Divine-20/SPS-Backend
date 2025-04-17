import { Module } from "@nestjs/common";
import { IncidentService } from "./incident.service";
import { IncidentController } from "./incident.controller";
import { SmsModule } from "../sms/sms.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [SmsModule, EmailModule],
  controllers: [IncidentController],
  providers: [IncidentService],
  exports: [IncidentService],
})
export class IncidentModule {}
