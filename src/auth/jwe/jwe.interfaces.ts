import * as jose from 'jose';
import { ModuleMetadata } from '@nestjs/common';

export const JWE_MODULE_OPTIONS = 'JWE_MODULE_OPTIONS';

export enum JweAlgorithm {
    A256CGM = 'A256GCM',
    HS256 = 'HS256',
    RS256 = 'RS256',
}

export type JweKey = jose.KeyLike | Uint8Array;

export interface JweModuleMetadata extends Pick<ModuleMetadata, 'imports' | 'providers'> {
    global?: boolean;
    signOptions?: JweSignOptions;
}

export interface JweModuleOptions {
    algorithm: string;
    key: jose.KeyLike | Uint8Array;
    signOptions?: JweSignOptions;
}

export type JweProtectedHeader = jose.JWTHeaderParameters;

export type JwePayload = jose.JWTPayload;

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
