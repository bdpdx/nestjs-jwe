// https://advancedweb.hu/how-to-sign-verify-and-encrypt-jwts-in-node/
// https://github.com/panva/jose/tree/main/docs

import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    JwePayload,
    JweProtectedHeader,
    JweVerifyResult,
} from './jwe.interfaces';
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

        this._validator = args[i];

        // here to be consistent with other passport strategies and in
        // case we want to pass options later.
        // const options = --i < 0 ? {} : args[i];
    }

    name?: string;

    _validator: Validator;

    authenticate(
        this: passport.StrategyCreated<
            this,
            this & passport.StrategyCreatedStatic
        >,
        req: Request,
        options?: any,
    ): any {
        const loggerService: LoggerService = options.loggerService;

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
            jwe = this.jweFromRequest(req);
        } catch (e) {
            loggerService.warn('Invalid Authorization header');

            done(e);
            return;
        }

        const promise = new Promise(async (resolve, reject) => {
            try {
                const configService: ConfigService = options.configService;
                const jweService: JweService = options.jweService;

                const result: JweVerifyResult = await jweService.verify(jwe, {
                    audience: configService.get('JWT_AUDIENCE'),
                    issuer: configService.get('JWT_ISSUER'),
                });

                resolve(result);
            } catch (e) {
                loggerService.warn(`JWE verification failed: ${e}`);
                reject(new UnauthorizedException());
            }
        });

        promise
            .then((verifyResult: JweVerifyResult) => {
                const { payload, protectedHeader } = verifyResult;
                this._validator(payload, protectedHeader, req, done);
            })
            .catch((err) => {
                done(err, null, null);
            });
    }

    // passport-jwt allows a number of configurable extraction methods.
    // I'm only going to support Bearer authentication for now so I'm
    // combining several paths from strategy.js, auth_header.js, and extract_jwt.js
    // into one function that pulls the token from the auth header.
    // see https://github.com/mikenicholson/passport-jwt/tree/master/lib
    jweFromRequest(req: Request): string {
        // express http converts all headers to lowercase
        const header = req.headers['authorization'];

        if (typeof header === 'string') {
            const re = /(\S+)\s+(\S+)/;
            const matches = header.match(re);

            if (matches && matches[1].toLowerCase() === 'bearer') {
                return matches[2];
            }
        }

        throw new BadRequestException();
    }
}

@Injectable()
export class JweStrategy extends PassportStrategy(Strategy) {
    async validate(
        payload: JwePayload,
        _protectedHeader: JweProtectedHeader,
        _request: Request,
    ) {
        // 2024.01.04 bd: could throw here if iat is too old
        // payload is {"email":null,"scope":null,"sub":1,"iat":1700643660,"exp":1700653740,"iss":"biz.wvcc.web-api"}

        return {
            email: payload.email,
            id: payload.sub,
            // roles: payload.scope,
        };
    }
}
