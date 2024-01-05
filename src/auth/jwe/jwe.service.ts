import { Inject, Injectable } from '@nestjs/common';
import * as jose from 'jose';
import {
    JWE_MODULE_OPTIONS,
    JweAlgorithm,
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
        private options: JweModuleOptions,
    ) {}

    async sign(
        payload?: JwePayload,
        options?: JweSignOptions,
    ): Promise<string> {
        const algorithm = this.options.algorithm;
        const signOptions = {
            audience: options?.audience ?? this.options.signOptions?.audience,
            expirationTime:
                options?.expirationTime ??
                this.options.signOptions?.expirationTime,
            issuedAt: options?.issuedAt ?? this.options.signOptions?.issuedAt,
            issuer: options?.issuer ?? this.options.signOptions?.issuer,
            jwtId: options?.jwtId ?? this.options.signOptions?.jwtId,
            notBefore:
                options?.notBefore ?? this.options.signOptions?.notBefore,
            subject: options?.subject ?? this.options.signOptions?.subject,
        };

        switch (algorithm) {
            case JweAlgorithm.A256CGM:
                return this._encrypt(payload, signOptions);
            default:
                return this._sign(payload, signOptions);
        }
    }

    async verify(
        jwt: string,
        options: jose.JWTVerifyOptions = {},
    ): Promise<JweVerifyResult> {
        const algorithm = this.options.algorithm;

        switch (algorithm) {
            case JweAlgorithm.A256CGM:
                const decryptOptions: jose.JWTDecryptOptions = {
                    ...options,
                    contentEncryptionAlgorithms: [algorithm],
                    keyManagementAlgorithms: ['dir'],
                };

                return await jose.jwtDecrypt(
                    jwt,
                    this.options.key,
                    decryptOptions,
                );
            default:
                return await jose.jwtVerify(jwt, this.options.key, options);
        }
    }

    // private methods

    async _encrypt(
        payload?: JwePayload,
        options?: JweSignOptions,
    ): Promise<string> {
        const algorithm = this.options.algorithm;
        const jwe = new jose.EncryptJWT(payload);

        jwe.setProtectedHeader({
            alg: 'dir',
            enc: algorithm,
        });

        this._setClaims(jwe, options);

        return jwe.encrypt(this.options.key);
    }

    _setClaims(jwe: JweKind, options?: JweSignOptions) {
        if (!options) return;

        if (options.audience) jwe.setAudience(options.audience);
        if (options.expirationTime)
            jwe.setExpirationTime(options.expirationTime);
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

    async _sign(
        payload?: JwePayload,
        options?: JweSignOptions,
    ): Promise<string> {
        const algorithm = this.options.algorithm;
        const jwt = new jose.SignJWT(payload);

        jwt.setProtectedHeader({ alg: algorithm });

        this._setClaims(jwt, options);

        return jwt.sign(this.options.key);
    }
}
