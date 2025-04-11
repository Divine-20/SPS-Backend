import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./app/prisma/prisma.module";
import { SharedModule } from "./app/shared/shared.module";
import { UserModule } from "./app/user/user.module";
import { AuthModule } from "./app/auth/auth.module";
import { LocationModule } from "./app/location/location.module";
import { IncidentModule } from "./app/case/incident.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SharedModule,
    UserModule,
    AuthModule,
    IncidentModule,
    LocationModule,
  ],
})
export class AppModule {}
