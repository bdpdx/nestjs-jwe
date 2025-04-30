import * as jose from 'jose';
import { ModuleMetadata } from '@nestjs/common';

export const JWE_MODULE_OPTIONS = 'JWE_MODULE_OPTIONS';

export enum JweAlgorithm {
    A256CGM = 'A256GCM',
    HS256 = 'HS256',
    RS256 = 'RS256',
}

export type JweKey = Uint8Array | object;

export interface JweModuleMetadata extends Pick<ModuleMetadata, 'imports' | 'providers'> {
    global?: boolean;
    signOptions?: JweSignOptions;
}

export interface JweModuleOptions {
    algorithm: string;
    jwtSecret: JweKey;
    key: JweKey;
    refreshExpirationTime: string;
    signOptions?: JweSignOptions;
}

export type JweProtectedHeader = jose.JWTHeaderParameters;

export interface JwePayload extends jose.JWTPayload {
    email: string;
    id: number | string;
    role: 'admin' | 'user';
}

// https://github.com/panva/jose/blob/HEAD/docs/classes/jwt_sign.SignJWT.md
export interface JweSignOptions {
    audience?: string;
    expirationTime?: Date | number | string;
    // iat will not be included if issuedAt is false
    // iat will be set to the current time if issuedAt is undefined or true
    issuedAt?: boolean | Date | number | string;
    issuer?: string;
    jwtId?: string;
    notBefore?: Date | number | string;
    subject?: string;
}

export type JweVerifyResult = jose.JWTVerifyResult;
