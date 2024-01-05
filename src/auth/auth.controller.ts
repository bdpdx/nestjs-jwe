import { AuthService } from './auth.service';
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from '../jwe/jwe.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() request: Request) {
        // If LocalStrategy.validate() does not throw, passport will
        // assign the returned object to request.user.
        // see @nestjs/passport:auth.guard.js:createAuthGuard():MixinAuthGuard:canActivate():45
        return this.authService.login(request.user);
    }
}
