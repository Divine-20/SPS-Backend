import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./app/prisma/prisma.module";
import { SharedModule } from "./app/shared/shared.module";
import { UserModule } from "./app/user/user.module";
import { AuthModule } from "./app/auth/auth.module";
import { CaseModule } from "./app/case/case.module";
import { LocationModule } from "./app/location/location.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SharedModule,
    UserModule,
    AuthModule,
    CaseModule,
    LocationModule,
  ],
})
export class AppModule {}
