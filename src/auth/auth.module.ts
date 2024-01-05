import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JweGlobalAuthGuard } from '../jwe/jwe.guard';
import { JweModule } from 'src/jwe/jwe.module';
import { JweStrategy } from 'src/jwe/jwe.strategy';
import { JweUser } from '../jwe/jwe-user.model';
import { LocalStrategy } from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from 'src/users/users.module';

@Module({
    controllers: [AuthController],
    exports: [AuthService],
    imports: [
        JweModule,
        PassportModule,
        SequelizeModule.forFeature([JweUser]),
        UsersModule,
    ],
    providers: [
        AuthService,
        JweGlobalAuthGuard,
        JweStrategy,
        LocalStrategy,
    ],
})
export class AuthModule {}
