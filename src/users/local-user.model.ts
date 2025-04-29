import {
    AllowNull,
    Column,
    Model,
    Table,
    Unique,
} from 'sequelize-typescript';
import { User } from './user.interface';

@Table
export class LocalUser extends Model implements Omit<User, 'id'> {
    @AllowNull(false)
    @Unique
    @Column
    email: string;

    @AllowNull(false)
    @Column
    hashedPassword: Buffer;

    @Column({ defaultValue: false })
    isDisabled: boolean;

    @Column({ defaultValue: false })
    isEmailVerified: boolean;

    @AllowNull(false)
    @Column({ defaultValue: 'user' })
    role: 'admin' | 'user';

    @AllowNull(false)
    @Column
    salt: Buffer;

    toUser(): User {
        return {
            createdAt: this.createdAt?.toISOString(),
            deletedAt: this.deletedAt?.toISOString(),
            id: this.id,
            email: this.email,
            isDisabled: this.isDisabled,
            isEmailVerified: this.isEmailVerified,
            role: this.role === 'admin' || this.role === 'user' ? this.role : 'user',
        };
    }
}
