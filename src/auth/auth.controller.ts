import { AuthService } from './auth.service';
import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { FirebaseOrLocalGuard } from './common/firebase-or-local.guard';
import { Public } from './jwe/jwe.guards';
import { Request } from 'express';
import { User } from 'src/users/user.interface';
import { JweService } from './jwe/jwe.service';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly jweService: JweService,
        private readonly usersService: UsersService,
    ) {}

    @Post('login')
    @Public()
    @UseGuards(FirebaseOrLocalGuard)
    async login(@Req() request: Request) {
        const user = request.user as User;
        if (!user) throw new UnauthorizedException('User not found');

        const accessToken = await this.authService.generateAccessToken(user);
        const refreshToken = await this.authService.generateRefreshToken(user);

        return { accessToken, refreshToken };
    }

    @Post('refresh')
    @Public()
    async refresh(@Body() body: { refreshToken: string }) {
        let { refreshToken } = body;

        try {
            let { payload } = await this.jweService.verifyRefreshToken(refreshToken);

            const user = await this.usersService.getUserById(payload.id);
            if (!user) throw new UnauthorizedException('User not found');

            const accessToken = await this.authService.generateAccessToken(user);

            return { accessToken };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
