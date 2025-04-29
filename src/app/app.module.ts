import { AppController } from './app.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseDialect } from 'src/common/enums/database-dialect.enum';
import { DialectService } from 'src/common/services/dialect.service';
import { FirebaseOrSequelizeModule } from 'src/common/modules/firebase-or-sequelize.module';
import { HttpLoggerMiddleware } from 'src/common/middleware/http-logger.middleware';
import { LoggerModule } from 'src/logger/logger.module';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { validate } from '../config/env/env.validation';

@Module({
    controllers: [AppController],
    exports: [DialectService],
    imports: [
        ConfigModule.forRoot({
            cache: true,
            isGlobal: true,
            validate,
        }),
        FirebaseOrSequelizeModule.register(),
        LoggerModule,

        ...(function selectModules() {
            const config = new ConfigService();
            const dialect = config.get<DatabaseDialect>('DB_DIALECT');

            return [
                dialect === DatabaseDialect.FIREBASE
                    ? AuthModule.forFirebase()
                    : AuthModule.forLocal(),

                dialect === DatabaseDialect.FIREBASE
                    ? UsersModule.forFirebase()
                    : UsersModule.forLocal(),
            ];
        })(),
    ],
    providers: [DialectService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpLoggerMiddleware).forRoutes('*');
    }
}
