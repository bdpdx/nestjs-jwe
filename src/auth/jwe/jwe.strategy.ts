// https://advancedweb.hu/how-to-sign-verify-and-encrypt-jwts-in-node/
// https://giub.com/panva/jose/tree/main/docs

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwePayload, JweProtectedHeader, JweVerifyResult } from './jwe.interfaces';
import { JweService } from './jwe.service';
import { LoggerService } from 'src/logger/logger.service';
import passport from 'passport';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';

// PassportStrategy:MixinStrategy:constructor() passes an async validator function into
// Strategy:constructor(). The validator function calls PassportStrategy:validate().
type Validator = (...args: any[]) => void;

class Strategy {
    constructor(...args: any[]) {
        this.name = 'jwe';

        const i = args.length - 1;
        if (i < 0) throw new TypeError('JweStrategy requires a verify handler');

        this.validator = args[i];

        // here to be consistent with other passport strategies and in
        // case we want to pass options later.
        // const options = --i < 0 ? {} : args[i];
    }

    name?: string;

    protected validator: Validator;
}

@Injectable()
export class JweStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private jweService: JweService,
        private loggerService: LoggerService,
    ) {
        super();

        this.loggerService.setContext(JweStrategy.name);
    }

    authenticate(
        this: JweStrategy & passport.StrategyCreated<this, this & passport.StrategyCreatedStatic>,
        req: Request,
        // options can be passed from JweAuthGuard if desired by implementing
        // JweAuthGuard:getAuthenticateOptions()
        _options?: any,
    ): any {
        const done = (err: any, user: any = null, info: any = null) => {
            if (err) {
                this.error(err);
            } else if (!user) {
                this.fail(info);
            } else {
                this.success(user, info);
            }
        };

        let jwe: string;

        try {
            jwe = this.jweFromAuthorizationHeaderBearerToken(req);
        } catch (err) {
            done(err);
            return;
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                const result: JweVerifyResult = await this.jweService.verify(jwe, {
                    audience: this.configService.get('JWT_AUDIENCE'),
                    // set currentDate to new Date(0) to disable expiration time verification
                    // currentDate: new Date(0),
                    issuer: this.configService.get('JWT_ISSUER'),
                });

                resolve(result);
            } catch (err) {
                this.loggerService.warn(`JWE verification failed: ${err}`);
                reject(new UnauthorizedException());
            }
        });

        promise
            .then((verifyResult: JweVerifyResult) => {
                const { payload, protectedHeader } = verifyResult;
                this.validator(payload, protectedHeader, req, done);
            })
            .catch((err) => {
                done(err);
            });
    }

    async validate(payload: JwePayload, _protectedHeader: JweProtectedHeader, _request: Request) {
        // 2024.01.04 bd: could throw here if iat is too old
        return this.stripJwtClaims(payload);
    }

    // passport-jwt allows a number of configurable extraction methods.
    // I'm only going to support Bearer authentication for now so I'm
    // combining several paths from strategy.js, auth_header.js, and extract_jwt.js
    // into one function that pulls the token from the auth header.
    // see https://github.com/mikenicholson/passport-jwt/tree/master/lib
    private jweFromAuthorizationHeaderBearerToken(req: Request): string {
        // express http converts all headers to lowercase
        const header = req.headers['authorization'];

        if (typeof header === 'string') {
            const re = /(\S+)\s+(\S+)/;
            const matches = header.match(re);

            if (matches && matches[1].toLowerCase() === 'bearer') {
                return matches[2];
            }
        }

        this.loggerService.warn('Invalid Authorization header');

        throw new BadRequestException();
    }

    private stripJwtClaims(payload: Record<string, any>): Record<string, any> {
        const { aud, exp, iat, iss, jti, nbf, sub, ...rest } = payload;

        return rest;
    }
}
