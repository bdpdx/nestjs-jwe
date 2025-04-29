import { AuthService } from './auth.service';
import { Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { DialectService } from '../common/services/dialect.service';
import { FirebaseOrLocalGuard } from './common/firebase-or-local.guard';
import { Public } from './jwe/jwe.guards';
import { Request } from 'express';
import { User } from 'src/users/user.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private dialectService: DialectService,
    ) {}

    @Public()
    @Post('login')
    @UseGuards(FirebaseOrLocalGuard)
    async login(@Req() request: Request) {
        const user = request.user as User;

        if (!user) throw new UnauthorizedException('User not found');

        if (!this.dialectService.isFirebase()) {
            // If LocalStrategy.validate() does not throw, passport will
            // assign the returned object to request.user.
            // see @nestjs/passport:auth.guard.js:createAuthGuard():MixinAuthGuard:canActivate():45
            return this.authService.localLogin(request.user);
        }

        const payload = {
            email: user.email,
            role: user.role,
            id: user.id,
        };
        const accessToken = await this.authService.generateFirebaseAccessToken(payload);

        return { accessToken };
    }
}
