import { BadRequestException, Injectable } from '@nestjs/common';
import isEmail from 'validator/lib/isEmail';
import { isPasswordMatched } from 'src/common/utilities/password.utilities';
import { JweService } from 'src/auth/jwe/jwe.service';
import { JWTPayload } from 'jose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private jweService: JweService,
        private usersService: UsersService,
    ) {}

    async generateFirebaseAccessToken(payload: JWTPayload): Promise<string> {
        return await this.jweService.sign(payload);
    }

    async localLogin(user: any) {
        const payload = { email: user.email, id: user.id };
        const signOptions = { subject: user.id };
        const token = await this.jweService.sign(payload, signOptions);

        return { accessToken: token };
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
}
