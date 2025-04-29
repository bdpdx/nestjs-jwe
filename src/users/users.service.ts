import { ConfigService } from '@nestjs/config';
import { DialectService } from 'src/common/services/dialect.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { firebaseUserConverter } from 'src/firebase/firebase-user.converter';
import { hashPassword } from 'src/common/utilities/password.utilities';
import { getModelToken, InjectModel } from '@nestjs/sequelize';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { LocalUser } from './local-user.model';
import { User } from './user.interface';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class UsersService implements OnModuleInit {
    private firebase?: FirebaseService;
    private localUserModel?: typeof LocalUser;

    constructor(
        private readonly configService: ConfigService,
        private readonly dialectService: DialectService,
        private readonly loggerService: LoggerService,
        private readonly moduleRef: ModuleRef,
    ) {
        this.loggerService.setContext(UsersService.name);
    }

    async createDefaultAdminUser() {
        const email = this.configService.get('DEFAULT_USER_EMAIL');
        const password = this.configService.get('DEFAULT_USER_PASSWORD');

        let count;

        if (this.dialectService.isFirebase()) {
            count = (await this.firebase!.getAuth().listUsers(1)).users.length;
        } else {
            count = await this.localUserModel!.count();
        }

        if (count > 0) return;

        this.loggerService.log('Creating default user');

        await this.createUser(email, password, true);
    }

    async createUser(email: string, password: string, isAdmin = false, isEmailVerified = false): Promise<User> {
        this.loggerService.log(`Creating user ${email}`);

        const role = isAdmin ? 'admin' : 'user';

        if (this.dialectService.isFirebase()) {
            const auth = this.firebase!.getAuth();
            const authUser = await auth.createUser({
                email,
                emailVerified: isEmailVerified,
                password,
            });

            if (isAdmin) {
                await auth.setCustomUserClaims(authUser.uid, { role: 'admin' });
            }

            const firestore = this.firebase!.getFirestore();
            const users = firestore.collection('users').withConverter(firebaseUserConverter);

            const user: User = {
                createdAt: new Date().toISOString(),
                email,
                id: authUser.uid,
                isDisabled: false,
                isEmailVerified,
                role,
            };

            await users.doc(authUser.uid).set(user, { merge: true });

            return user;
        } else {
            const { hash, salt } = await hashPassword(password);

            const localUser = await this.localUserModel!.create({
                email,
                hashedPassword: hash,
                isEmailVerified,
                role,
                salt,
            })
            
            return localUser?.toUser();
        }
    }

    async getAllUsers(): Promise<User[]> {
        if (this.dialectService.isFirebase()) {
            const firestore = this.firebase!.getFirestore();
            const users = firestore.collection('users').withConverter(firebaseUserConverter);
            const snapshot = await users.get();

            return snapshot.docs.map(doc => doc.data());
        } else {
            const localUsers = this.localUserModel!.findAll({
                attributes: {
                    exclude: ['hashedPassword', 'salt'],
                },
            });

            return (await localUsers).map(user => user.toUser());
        }
    }

    async getLocalUser(email: string): Promise<LocalUser | null> {
        const user = await this.localUserModel!.findOne({
            where: { email },
        });

        return user;
    }

    async getUser(email: string): Promise<User | null> {
        if (this.dialectService.isFirebase()) {
            try {
                const auth = this.firebase!.getAuth();
                const authUser = await auth.getUserByEmail(email);
                const firestore = this.firebase!.getFirestore();
                const users = firestore.collection('users').withConverter(firebaseUserConverter);
                const doc = await users.doc(authUser.uid).get();

                if (doc.exists) return doc.data() ?? null;
            } catch (error) {
                this.loggerService.warn(`failed to retrieve user '${email}': ${error.message}`);
            }
        } else {
            const user = this.getLocalUser(email);

            if (user instanceof LocalUser) return user.toUser();
        }

        return null;
    }

    async onModuleInit() {
        if (this.dialectService.isFirebase()) {
            this.firebase = await this.moduleRef.get(FirebaseService, { strict: false });
        } else {
            this.localUserModel = await this.moduleRef.get(getModelToken(LocalUser), { strict: false });
        }

        await this.createDefaultAdminUser();
    }

    async remove(idOrUid: string): Promise<void> {
        if (this.dialectService.isFirebase()) {
            const auth = this.firebase!.getAuth();
            const firestore = this.firebase!.getFirestore();

            await auth.deleteUser(idOrUid);
            await firestore.collection('users').doc(idOrUid).delete();
        } else {
            const user = await this.localUserModel!.findOne({
                where: { id: idOrUid },
            });

            if (user) {
                await user.destroy();
            }
        }
    }
}
