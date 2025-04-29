import { AppJweAuthGuard } from './jwe/jwe.guards';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DialectModule } from 'src/common/modules/dialect.module';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseOrLocalGuard } from './common/firebase-or-local.guard';
import { JweModule } from './jwe/jwe.module';
import { LocalAuthGuard } from './local/local.guard';
import { LocalStrategy } from './local/local.strategy';
import { LoggerModule } from 'src/logger/logger.module';
import { Module, DynamicModule, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';

@Module({})
export class AuthModule {
    static forFirebase(): DynamicModule {
        return {
            controllers: [AuthController],
            exports: [AuthService, FirebaseOrLocalGuard],
            imports: [
                DialectModule,
                FirebaseModule,
                JweModule,
                LoggerModule,
                PassportModule,
                UsersModule.forFirebase(),
            ],
            module: AuthModule,
            providers: [
                AppJweAuthGuard,
                AuthService,
                FirebaseAuthGuard,
                FirebaseOrLocalGuard,
            ],
        };
    }

    static forLocal(): DynamicModule {
        return {
            controllers: [AuthController],
            exports: [AuthService, FirebaseOrLocalGuard],
            imports: [
                DialectModule,
                JweModule,
                LoggerModule,
                PassportModule,
                UsersModule.forLocal(),
            ],
            module: AuthModule,
            providers: [
                AppJweAuthGuard,
                AuthService,
                FirebaseOrLocalGuard,
                LocalAuthGuard,
                LocalStrategy,
            ],
        };
    }
}
