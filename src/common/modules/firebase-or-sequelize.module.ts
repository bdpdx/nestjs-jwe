import { ConfigService } from '@nestjs/config';
import { DatabaseDialect } from 'src/common/enums/database-dialect.enum';
import { DynamicModule, Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { SequelizeConfigService } from 'src/config/services/sequelize-config.service';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({})
export class FirebaseOrSequelizeModule {
    static register(): DynamicModule {
        const config = new ConfigService();
        const dialect = config.get<DatabaseDialect>('DB_DIALECT');

        const imports = dialect === DatabaseDialect.FIREBASE
            ? [FirebaseModule]
            : [SequelizeModule.forRootAsync({ useClass: SequelizeConfigService })];

        return {
            module: FirebaseOrSequelizeModule,
            imports,
        };
    }
}
