import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { METHODS } from "http";

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
    .setTitle("Smart Reporting Services API")
    .setDescription("API for accessing smart reporting services")
    .setVersion("1.0")
    .addTag("auth", "Authentication endpoints")
    .addTag("incidents", "Incidents management")
    .addTag("users", "User management")
    .addTag("locations", "Location management")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(8080);
}
bootstrap();
