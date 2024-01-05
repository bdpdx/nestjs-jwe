import { LoggerModule } from 'src/logger/logger.module';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    controllers: [UsersController],
    exports: [UsersService],
    imports: [LoggerModule, SequelizeModule.forFeature([User])],
    providers: [UsersService],
})
export class UsersModule {}
