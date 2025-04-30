import { BadRequestException, Injectable } from '@nestjs/common';
import isEmail from 'validator/lib/isEmail';
import { isPasswordMatched } from 'src/common/utilities/password.utilities';
import { JwePayload } from './jwe/jwe.interfaces';
import { JweService } from 'src/auth/jwe/jwe.service';
import { User } from 'src/users/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private jweService: JweService,
        private usersService: UsersService,
    ) {}

    async generateAccessToken(user: User): Promise<string> {
        const payload = this.jwtPayload(user);
        const signOptions = { subject: user.id.toString() };
        const accessToken = await this.jweService.sign(payload, signOptions);

        return accessToken;
    }

    async generateRefreshToken(user: User): Promise<string> {
        const refreshToken = await this.jweService.signRefreshToken({ id: user.id });

        return refreshToken;
    }

    async localValidateUser(email: string, password: string): Promise<any> {
        if (email.length < 1 || password.length < 1 || !isEmail(email)) {
            throw new BadRequestException();
        }

        const user = await this.usersService.getLocalUser(email);

        if (
            user != null &&
            user.hashedPassword != null &&
            !user.isDisabled &&
            user.salt != null &&
            (await isPasswordMatched(password, user.hashedPassword, user.salt))
        ) {
            return {
                email: user.email,
                id: user.id,
            };
        }

        return null;
    }

    jwtPayload(user: User): JwePayload {
        return {
            email: user.email,
            id: user.id,
            role: user.role,
        };
    }
}
