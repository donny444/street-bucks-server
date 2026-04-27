import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? [
      "http://localhost:3000", // Local Next.js application
      "http://localhost:5500", // Swagger service in Docker container
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "content-type",
      "authorization",
      "accept",
      "branch-token",
      "admin-token",
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8085);
}
bootstrap();
