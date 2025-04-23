import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./app/prisma/prisma.module";
import { UserModule } from "./app/user/user.module";
import { AuthModule } from "./app/auth/auth.module";
import { LocationModule } from "./app/location/location.module";
import { IncidentModule } from "./app/case/incident.module";
import { OperatorModule } from "./app/operator/operator.module";
import { ServiceModule } from "./app/service/service.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/incidents/images",
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    IncidentModule,
    LocationModule,
    OperatorModule,
    ServiceModule,
  ],
})
export class AppModule {}
