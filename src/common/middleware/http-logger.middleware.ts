import { Injectable, NestMiddleware } from '@nestjs/common';
import LoggerContext from '../enums/logger-context.enum';
import { LoggerService } from '../../logger/logger.service';
import { randomUUID } from 'crypto';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
    constructor(private readonly loggerService: LoggerService) {
        this.loggerService.setContext(LoggerContext.HTTP);
    }

    use(request: any, response: any, next: any): void {
        const hash = randomUUID();

        Object.defineProperty(request, 'hash', {
            value: hash,
            enumerable: true,
        });

        this.loggerService.logRequest(request);

        response.on('finish', () => {
            this.loggerService.logResponse(request, response);
        });

        next();
    }
}
