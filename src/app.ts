import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    const config = new DocumentBuilder()
        .setTitle('Opa eval Service')
        .setDescription('Opa eval Service')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('apiDoc', app, document);
    app.useGlobalPipes(new ValidationPipe());

    await app.listen(parseInt(process.env.HTTP_PORT || '3000', 10));
}
