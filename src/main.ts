import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Citizen Emergency Reporting API")
    .setDescription("API for reporting and managing emergency cases")
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("cases", "Emergency case management")
    .addTag("users", "User management")
    .addTag("locations", "Location management")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(5000);
}
bootstrap();
