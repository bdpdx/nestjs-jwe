import {
    AllowNull,
    Column,
    ForeignKey,
    Model,
    Table,
    Unique,
} from 'sequelize-typescript';
import { IsInt, IsNotEmpty } from 'class-validator';
import { User } from './user.model';

@Table({ timestamps: false })
export class FederatedCredential extends Model {
    @AllowNull(false)
    @Unique('provider-subject')
    @Column
    provider: string;

    @AllowNull(false)
    @Unique('provider-subject')
    @Column
    subject: string;

    @AllowNull(false)
    @ForeignKey(() => User)
    @IsInt()
    @IsNotEmpty()
    @Column
    userId: number;
}
