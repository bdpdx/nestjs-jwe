import DatabaseDialect from 'src/common/enums/database-dialect.enum';
import Environment from 'src/common/enums/environment.enum';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    validateSync,
} from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';

function transformStringToBoolean(value: string): boolean {
    if (value === undefined || value === null) return false;

    const intValue = parseInt(value);
    if (!isNaN(intValue)) return intValue != 0;

    switch (value.toLowerCase()) {
        case 'enabled':
        case 'on':
        case 'true':
        case 'y':
        case 'yes':
            return true;
    }

    return false;
}

export class EnvironmentVariables {
    APP_NAME = 'My App';

    // hostname to listen on - use '0.0.0.0' to bind to all interfaces
    BIND_HOST = '127.0.0.1';

    // the port the web server listens on
    @IsInt()
    @Type(() => Number)
    BIND_PORT = 3000;

    // name of the database file
    @IsNotEmpty()
    DB_DATABASE: string;

    // dialect of database we're connecting to
    @IsEnum(DatabaseDialect)
    DB_DIALECT = DatabaseDialect.MYSQL;

    // hostname of the database to connect to
    DB_HOST = 'localhost';

    // password for the database user
    DB_PASSWORD = '';

    // port number to connect to @ DB_HOST
    @IsNumber()
    @Type(() => Number)
    DB_PORT = 3306;

    // username of the database user
    DB_USERNAME = '';

    @IsNotEmpty()
    DEFAULT_USER_EMAIL = 'admin@wvcc.biz';

    @IsNotEmpty()
    DEFAULT_USER_PASSWORD = 'admin';

    // true to enable logging of verbose messages
    @Transform(({ value }) => transformStringToBoolean(value))
    ENABLE_VERBOSE_LOGGING = false;

    @IsNotEmpty()
    JWE_ALGORITHM: string;

    JWE_AUDIENCE: string = '';

    // the number of seconds a JWT token is valid
    JWE_EXPIRATION_TIME: string = '15m';

    @IsNotEmpty()
    JWE_ISSUER: string;

    // the JWT private key
    @IsNotEmpty()
    JWE_PRIVATE_KEY: string;

    // the JWT public key - probably not needed as I can derive it from the private key
    @IsNotEmpty()
    JWE_PUBLIC_KEY: string;

    // the JWT public key - probably not needed as I can derive it from the private key
    @IsNotEmpty()
    JWE_SECRET: string;

    // set to a non-empty string to disable color in log output
    NO_COLOR = '';

    // the runtime environment
    @IsEnum(Environment)
    NODE_ENV = Environment.PRODUCTION;
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
