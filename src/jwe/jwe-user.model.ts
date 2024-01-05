import {
    AllowNull,
    Column,
    ForeignKey,
    Model,
    Table,
    Unique,
} from 'sequelize-typescript';
import { User } from 'src/users/models/user.model';

@Table({ timestamps: false })
export class JweUser extends Model {
    @Column
    tokenInvalidBeforeDate?: Date;

    @AllowNull(false)
    @ForeignKey(() => User)
    @Unique
    @Column
    userId: number;
}
