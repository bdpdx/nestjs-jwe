/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { Dialect } from 'sequelize';
import Environment from '../../common/enums/environment.enum';
import { EnvironmentVariables } from '../env/env.validation';
import { Injectable } from '@nestjs/common';
import {
    SequelizeModuleOptions,
    SequelizeOptionsFactory,
} from '@nestjs/sequelize';

@Injectable()
export class SequelizeConfigService implements SequelizeOptionsFactory {
    private readonly database: string;
    private readonly dialect: Dialect;
    private readonly host: string;
    private readonly password: string;
    private readonly port: number;
    private readonly syncDrop: boolean;
    private readonly username: string;

    constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {
        this.database = this.configService.get<string>('DB_DATABASE');
        this.dialect = this.configService.get<Dialect>('DB_DIALECT');
        this.host = this.configService.get<string>('DB_HOST');
        this.password = this.configService.get<string>('DB_PASSWORD');
        this.port = this.configService.get<number>('DB_PORT');
        this.syncDrop = this.configService.get<Environment>('NODE_ENV') !== Environment.PRODUCTION;
        this.username = this.configService.get<string>('DB_USERNAME');
    }

    createSequelizeOptions(): SequelizeModuleOptions {
        return {
            autoLoadModels: true,
            database: this.database,
            define: {
                charset: 'utf8',
                defaultScope: {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'deletedAt'],
                    },
                    paranoid: true,
                },
            },
            dialect: this.dialect,
            host: this.host,
            logging: false,
            password: this.password,
            port: this.port,
            sync: {
                alter: {
                    drop: this.syncDrop
                },
            },
            // synchronize: true,   // can lose data in production?
            username: this.username,
        };
    }
}
