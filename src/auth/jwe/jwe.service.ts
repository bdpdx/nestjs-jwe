import { ConfigService } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import * as jose from 'jose';
import {
    JWE_MODULE_OPTIONS,
    JweAlgorithm,
    JweKey,
    JweModuleOptions,
    JwePayload,
    JweSignOptions,
    JweVerifyResult,
} from './jwe.interfaces';

type JweKind = jose.EncryptJWT | jose.SignJWT;

@Injectable()
export class JweService {
    constructor(
        @Inject(JWE_MODULE_OPTIONS)
        private readonly options: JweModuleOptions,
    ) {}

    // sign() signs or encrypts the payload as appropriate given the app-wide JWE/JWT option.
    async sign(payload?: JwePayload, options?: JweSignOptions): Promise<string> {
        const algorithm = this.options.algorithm;
        const signOptions = {
            audience: options?.audience ?? this.options.signOptions?.audience,
            expirationTime: options?.expirationTime ?? this.options.signOptions?.expirationTime,
            issuedAt: options?.issuedAt ?? this.options.signOptions?.issuedAt,
            issuer: options?.issuer ?? this.options.signOptions?.issuer,
            jwtId: options?.jwtId ?? this.options.signOptions?.jwtId,
            notBefore: options?.notBefore ?? this.options.signOptions?.notBefore,
            subject: options?.subject ?? this.options.signOptions?.subject,
        };

        switch (algorithm) {
            case JweAlgorithm.A256CGM:
                return this.encrypt(payload, signOptions);
            default:
                return this._sign(payload, signOptions);
        }
    }

    async signRefreshToken(payload: { id: number | string }): Promise<string> {
        return await new jose.SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(this.options.refreshExpirationTime)
            .sign(this.options.jwtSecret);
        }

    async verify(jwt: string, options: jose.JWTVerifyOptions = {}): Promise<JweVerifyResult> {
        const algorithm = this.options.algorithm;
        let result;

        switch (algorithm) {
            case JweAlgorithm.A256CGM: {
                const decryptOptions: jose.JWTDecryptOptions = {
                    ...options,
                    contentEncryptionAlgorithms: [algorithm],
                    keyManagementAlgorithms: ['dir'],
                };

                result = await jose.jwtDecrypt(jwt, this.options.key, decryptOptions);
            } break;

            default: {
                result = await jose.jwtVerify(jwt, this.options.key, options);
            } break;
        }
        return result;
    }

    async verifyRefreshToken(jwt: string): Promise<{ payload: any }> {
        const { payload } = await jose.jwtVerify(jwt, this.options.jwtSecret, { algorithms: ['HS256'] });

        return { payload };
    }

    // private methods

    private async encrypt(payload?: JwePayload, options?: JweSignOptions): Promise<string> {
        const algorithm = this.options.algorithm;
        const jwe = new jose.EncryptJWT(payload);

        jwe.setProtectedHeader({
            alg: 'dir',
            enc: algorithm,
        });

        this.setClaims(jwe, options);

        return await jwe.encrypt(this.options.key);
    }

    private setClaims(jwe: JweKind, options?: JweSignOptions) {
        if (!options) return;

        if (options.audience) jwe.setAudience(options.audience);
        if (options.expirationTime) jwe.setExpirationTime(options.expirationTime);
        if (options.issuedAt !== false) {
            let iat: Date | number | string | undefined;

            if (options.issuedAt !== true) iat = options.issuedAt;

            jwe.setIssuedAt(iat);
        }
        if (options.issuer) jwe.setIssuer(options.issuer);
        if (options.jwtId) jwe.setJti(options.jwtId);
        if (options.notBefore) jwe.setNotBefore(options.notBefore);
        if (options.subject) jwe.setSubject(options.subject);
    }

    private async _sign(payload?: JwePayload, options?: JweSignOptions): Promise<string> {
        const algorithm = this.options.algorithm;
        const jwt = new jose.SignJWT(payload);

        jwt.setProtectedHeader({ alg: algorithm });

        this.setClaims(jwt, options);

        return jwt.sign(this.options.key);
    }
}
