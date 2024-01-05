import {
    AllowNull,
    Column,
    DeletedAt,
    Model,
    Table,
    Unique,
} from 'sequelize-typescript';

@Table
export class User extends Model {
    @DeletedAt
    @Column
    deletedAt?: Date;

    @AllowNull(false)
    @Unique
    @Column
    email: string;

    @AllowNull(false)
    @Column
    hashedPassword: Buffer;

    @Column({ defaultValue: true })
    isActive: boolean;

    @Column({ defaultValue: false })
    isEmailVerified: boolean;

    @AllowNull(false)
    @Column
    salt: Buffer;
}
