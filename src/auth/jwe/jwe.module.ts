import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, Module } from '@nestjs/common';
import * as jose from 'jose';
import { JWE_MODULE_OPTIONS, JweAlgorithm, JweKey } from './jwe.interfaces';
import { JweService } from './jwe.service';
import { JweStrategy } from './jwe.strategy';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    exports: [JweService, JweStrategy],
    imports: [LoggerModule],
    providers: [
        {
            inject: [ConfigService],
            provide: JWE_MODULE_OPTIONS,
            useFactory: jweModuleOptionsFactory,
        },
        JweService,
        JweStrategy,
    ],
})
export class JweModule {
    // 2024.01.04 bd: I don't see any reason right now to support a global
    // JweModule (it's only used by the AuthModule), so I'm commenting out
    // this register() method. If for some reason it becomes necessary to
    // support a global JweModule or provide additional module metadata then
    // this can be used.
    /*
    static register(metadata: JweModuleMetadata = {}): DynamicModule {
        const providers = [
            ...(metadata.providers ?? []),
            {
                inject: [ConfigService],
                provide: JWE_MODULE_OPTIONS,
                useFactory: jweModuleOptionsFactory,
            },
        ];

        return {
            global: metadata?.global,
            imports: metadata?.imports,
            module: JweModule,
            providers: providers,
        };
    }
    */
}

async function jweModuleOptionsFactory(config: ConfigService) {
    const algorithm = config.getOrThrow('JWE_ALGORITHM');
    const jwtSecret = config.getOrThrow('JWT_SECRET');
    const jwtSecretKey = Uint8Array.from(Buffer.from(jwtSecret, 'hex'));

    let key: JweKey;

    switch (algorithm) {
        case JweAlgorithm.A256CGM:
            const jweSecret = config.getOrThrow('JWE_SECRET');
            key = Uint8Array.from(Buffer.from(jweSecret, 'hex'));
            break;

        case JweAlgorithm.HS256:
            key = jwtSecretKey;
            break;

        case JweAlgorithm.RS256:
            const privateKey = config.get('JWT_PRIVATE_KEY');

            if (privateKey) {
                // application can sign and verify
                key = await jose.importPKCS8(privateKey, algorithm);
            } else {
                // application can verify only
                const publicKey = config.getOrThrow('JWT_PUBLIC_KEY');
                key = await jose.importSPKI(publicKey, algorithm);
            }
            break;

        default:
            throw new InternalServerErrorException();
    }

    const audience = config.getOrThrow('JWT_AUDIENCE');
    const expirationTime = config.getOrThrow('JWT_EXPIRATION_TIME');
    const issuer = config.getOrThrow('JWT_ISSUER');
    const refreshExpirationTime = config.getOrThrow('JWT_REFRESH_EXPIRATION_TIME');
    const signOptions = {
        audience: audience,
        expirationTime: expirationTime,
        issuer: issuer,
    };

    return {
        algorithm,
        jwtSecret: jwtSecretKey,
        key,
        refreshExpirationTime,
        signOptions,
    };
}
