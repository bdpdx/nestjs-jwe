import { ConfigService } from '@nestjs/config';
import { hashPassword } from 'src/common/utilities/password.utilities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { User } from './models/user.model';

@Injectable()
export class UsersService implements OnModuleInit {
    constructor(
        private readonly configService: ConfigService,
        private readonly loggerService: LoggerService,
        @InjectModel(User)
        private readonly userModel: typeof User,
    ) {
        this.loggerService.setContext(UsersService.name);
    }

    async createDefaultAdminUser() {
        if ((await this.userModel.count()) > 0) return;

        const email = this.configService.get('DEFAULT_USER_EMAIL');
        const password = this.configService.get('DEFAULT_USER_PASSWORD');

        await this.createUser(email, password, true);
    }

    async createUser(email: string, password: string, isEmailVerified = false) {
        const { hash, salt } = await hashPassword(password);

        this.loggerService.log(`Creating user ${email}`);

        await User.create({
            email: email,
            hashedPassword: hash,
            isEmailVerified: isEmailVerified,
            salt: salt,
        });
    }

    async findAll(): Promise<User[]> {
        return this.userModel.findAll({
            attributes: {
                exclude: ['hashedPassword', 'salt'],
            },
        });
    }

    async findOne(email: string): Promise<User | null> {
        return this.userModel.findOne({
            where: { email },
        });
    }

    async onModuleInit() {
        await this.createDefaultAdminUser();
    }

    async remove(id: string): Promise<void> {
        const user = await this.userModel.findOne({
            where: { id },
        });

        if (user) {
            await user.destroy();
        }
    }
}
