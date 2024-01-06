import { AppJweAuthGuard } from './jwe/jwe.guards';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JweModule } from 'src/auth/jwe/jwe.module';
import { JweUser } from './models/jwe-user.model';
import { LocalStrategy } from './local/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from 'src/users/users.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    controllers: [AuthController],
    exports: [AuthService],
    imports: [
        JweModule,
        LoggerModule,
        PassportModule,
        SequelizeModule.forFeature([JweUser]),
        UsersModule,
    ],
    providers: [AppJweAuthGuard, AuthService, LocalStrategy],
})
export class AuthModule {}
