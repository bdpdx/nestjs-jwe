import { DatabaseDialect } from 'src/common/enums/database-dialect.enum';
import Environment from 'src/common/enums/environment.enum';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, validateSync } from 'class-validator';
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
    DB_DATABASE: string;

    // dialect of database we're connecting to
    @IsEnum(DatabaseDialect)
    @IsNotEmpty()
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
    DEFAULT_USER_EMAIL = 'admin@example.com';

    @IsNotEmpty()
    DEFAULT_USER_PASSWORD = 'admin';

    // true to enable logging of verbose messages
    @Transform(({ value }) => transformStringToBoolean(value))
    ENABLE_VERBOSE_LOGGING = false;

    @IsNotEmpty()
    JWE_ALGORITHM: string;

    // use with A256GCM
    JWE_SECRET: string;

    JWT_AUDIENCE: string = '';

    // the number of seconds a JWT token is valid
    JWT_EXPIRATION_TIME: string = '7d';

    @IsNotEmpty()
    JWT_ISSUER: string;

    // the JWE private key, needed if an RS* algorithm is used and
    // this server can create/sign JWEs.
    JWT_PRIVATE_KEY: string;

    // the JWT public key, needed if an RS* algorithm is used and
    // this server can only verify JWEs. This field is unnecessary
    // if JWT_PRIVATE_KEY is set.
    JWT_PUBLIC_KEY: string;

    JWT_REFRESH_EXPIRATION_TIME: string = '30d';

    // the JWT secret, needed if an HS* algorithm is used.
    // should be 128 hex-encoded bytes.
    JWT_SECRET: string;

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
