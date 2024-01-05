import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpLoggerMiddleware } from '../common/middleware/http-logger.middleware';
import { LoggerModule } from '../logger/logger.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeConfigService } from '../config/services/sequelize-config.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from 'src/users/users.module';
import { validate } from '../config/env/env.validation';
import { AppController } from './app.controller';
import { JweModule } from 'src/jwe/jwe.module';

@Module({
    controllers: [AppController],
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            validate: validate,
        }),
        JweModule,
        LoggerModule,
        SequelizeModule.forRootAsync({ useClass: SequelizeConfigService }),
        UsersModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
