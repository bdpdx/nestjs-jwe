import { ConfigService } from '@nestjs/config';
import { DatabaseDialect } from '../enums/database-dialect.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DialectService {
    constructor(private readonly configService: ConfigService) {}

    get(): DatabaseDialect {
        return this.configService.get<DatabaseDialect>('DB_DIALECT') ?? DatabaseDialect.MYSQL;
    }

    isFirebase(): boolean {
        return this.get() === DatabaseDialect.FIREBASE;
    }
}
