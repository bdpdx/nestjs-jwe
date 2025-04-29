import { DialectModule } from 'src/common/modules/dialect.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { LocalUser } from './local-user.model';
import { LoggerModule } from 'src/logger/logger.module';
import { Module, DynamicModule } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({})
export class UsersModule {
    static forFirebase(): DynamicModule {
        return {
            controllers: [UsersController],
            exports: [UsersService],
            imports: [
                DialectModule,
                FirebaseModule,
                LoggerModule,
            ],
            module: UsersModule,
            providers: [UsersService],
        };
    }

    static forLocal(): DynamicModule {
        return {
            controllers: [UsersController],
            exports: [UsersService],
            imports: [
                DialectModule,
                LoggerModule,
                SequelizeModule.forFeature([LocalUser]),
            ],
            module: UsersModule,
            providers: [UsersService],
        };
    }
}
