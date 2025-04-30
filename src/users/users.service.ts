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
        private readonly config: ConfigService,
        private readonly dialect: DialectService,
        private readonly log: LoggerService,
        private readonly module: ModuleRef,
    ) {
        this.log.setContext(UsersService.name);
    }

    async createDefaultAdminUser() {
        const email = this.config.get('DEFAULT_USER_EMAIL');
        const password = this.config.get('DEFAULT_USER_PASSWORD');

        let count;

        if (this.dialect.isFirebase()) {
            count = (await this.firebase!.getAuth().listUsers(1)).users.length;
        } else {
            count = await this.localUserModel!.count();
        }

        if (count > 0) return;

        this.log.log('Creating default user');

        await this.createUser(email, password, true, true);
    }

    async createUser(email: string, password: string, isAdmin = false, isEmailVerified = false): Promise<User> {
        this.log.log(`Creating user ${email}`);

        const role = isAdmin ? 'admin' : 'user';

        if (this.dialect.isFirebase()) {
            const auth = this.firebase!.getAuth();
            const authUser = await auth.createUser({
                email,
                emailVerified: isEmailVerified,
                password,
            });

            const uid = authUser.uid;

            if (!uid) throw new Error('Failed to get uid from Firebase');

            if (isAdmin) await auth.setCustomUserClaims(uid, { role: 'admin' });

            const firestore = this.firebase!.getFirestore();
            const users = firestore.collection('users').withConverter(firebaseUserConverter);

            const user: User = {
                createdAt: new Date().toISOString(),
                email,
                id: uid,
                isDisabled: false,
                isEmailVerified,
                role,
            };

            await users.doc(uid).set(user, { merge: true });

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
        if (this.dialect.isFirebase()) {
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
        if (this.dialect.isFirebase()) {
            try {
                const auth = this.firebase!.getAuth();
                const authUser = await auth.getUserByEmail(email);
                const firestore = this.firebase!.getFirestore();
                const users = firestore.collection('users').withConverter(firebaseUserConverter);
                const doc = await users.doc(authUser.uid).get();

                if (doc.exists) return doc.data() ?? null;
            } catch (error) {
                this.log.warn(`failed to retrieve user '${email}': ${error.message}`);
            }
        } else {
            const user = this.getLocalUser(email);

            if (user instanceof LocalUser) return user.toUser();
        }

        return null;
    }

    async getUserById(id: number | string): Promise<User | null> {
        if (this.dialect.isFirebase()) {
            const auth = this.firebase!.getAuth(); // your lazy-loaded FirebaseService
            const authUser = await auth.getUser(id.toString());
            const firestore = this.firebase!.getFirestore();
            const userDoc = await firestore.collection('users').doc(authUser.uid).get();
    
            if (!userDoc.exists) return null;
    
            return userDoc.data() as User;
        } else {
            const localUser = await this.localUserModel!.findOne({ where: { id } });
    
            return localUser ? localUser.toUser() : null;
        }
    }
    
    async onModuleInit() {
        if (this.dialect.isFirebase()) {
            this.firebase = await this.module.get(FirebaseService, { strict: false });
        } else {
            this.localUserModel = await this.module.get(getModelToken(LocalUser), { strict: false });
        }

        await this.createDefaultAdminUser();
    }

    async remove(idOrUid: string): Promise<void> {
        if (this.dialect.isFirebase()) {
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
