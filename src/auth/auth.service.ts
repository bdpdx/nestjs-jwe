import { BadRequestException, Injectable } from '@nestjs/common';
import isEmail from 'validator/lib/isEmail';
import { isPasswordMatched } from 'src/common/utilities/password.utilities';
import { UsersService } from 'src/users/users.service';
import { JweService } from 'src/auth/jwe/jwe.service';

@Injectable()
export class AuthService {
    constructor(
        private jweService: JweService,
        private usersService: UsersService,
    ) {}

    async login(user: any) {
        console.log('in AuthService.login(), generating jweToken');

        const payload = { email: user.email };
        const signOptions = { subject: user.id };
        const token = await this.jweService.sign(payload, signOptions);

        return { accessToken: token };
    }

    async validateUser(email: string, password: string): Promise<any> {
        if (email.length < 1 || password.length < 1 || !isEmail(email)) {
            throw new BadRequestException();
        }

        const user = await this.usersService.findOne(email);

        if (
            user != null &&
            user.hashedPassword != null &&
            user.isActive &&
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
