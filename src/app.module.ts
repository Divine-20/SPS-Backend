import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./app/prisma/prisma.module";
import { UserModule } from "./app/user/user.module";
import { AuthModule } from "./app/auth/auth.module";
import { LocationModule } from "./app/location/location.module";
import { IncidentModule } from "./app/case/incident.module";
import { OperatorModule } from "./app/operator/operator.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    IncidentModule,
    LocationModule,
    OperatorModule,
  ],
})
export class AppModule {}
