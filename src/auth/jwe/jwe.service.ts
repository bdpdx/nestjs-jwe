import { Inject, Injectable } from '@nestjs/common';
import * as jose from 'jose';
import {
    JWE_MODULE_OPTIONS,
    JweModuleOptions,
    JwePayload,
    JweSignOptions,
    JweVerifyResult,
} from './jwe.interfaces';

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
        const jwt = new jose.SignJWT(payload);

        const algorithm = this.options.algorithm;
        const audience =
            options?.audience ?? this.options.signOptions?.audience;
        const expirationTime =
            options?.expirationTime ?? this.options.signOptions?.expirationTime;
        const issuedAt =
            options?.issuedAt ?? this.options.signOptions?.issuedAt;
        const issuer = options?.issuer ?? this.options.signOptions?.issuer;
        const jwtId = options?.jwtId ?? this.options.signOptions?.jwtId;
        const notBefore =
            options?.notBefore ?? this.options.signOptions?.notBefore;
        const subject = options?.subject ?? this.options.signOptions?.subject;

        jwt.setProtectedHeader({ alg: algorithm });

        if (audience) jwt.setAudience(audience);
        if (expirationTime) jwt.setExpirationTime(expirationTime);
        if (issuedAt !== false) {
            let iat: Date | number | string | undefined;

            if (issuedAt !== true) iat = issuedAt;

            jwt.setIssuedAt(iat);
        }
        if (issuer) jwt.setIssuer(issuer);
        if (jwtId) jwt.setJti(jwtId);
        if (notBefore) jwt.setNotBefore(notBefore);
        if (subject) jwt.setSubject(subject);

        return jwt.sign(this.options.key);
    }

    async verify(
        jwt: string,
        options: jose.JWTVerifyOptions = {},
    ): Promise<JweVerifyResult> {
        return await jose.jwtVerify(jwt, this.options.key, options);
    }
}
