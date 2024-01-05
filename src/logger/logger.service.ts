/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';
import Environment from '../common/enums/environment.enum';
import { EnvironmentVariables } from 'src/config/env/env.validation';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
    #appName = 'Nest';

    constructor(private readonly configService: ConfigService<EnvironmentVariables, true>) {
        super();

        // Values in the array can be any combination of 'log', 'fatal', 'error', 'warn', 'debug', and 'verbose'
        const logLevels: LogLevel[] = ['error', 'fatal', 'log', 'warn'];

        if (this.configService.get<boolean>('ENABLE_VERBOSE_LOGGING')) {
            logLevels.push('verbose');
        }
        if (this.configService.get('NODE_ENV') === Environment.DEVELOPMENT) {
            logLevels.push('debug');
        }

        super.setLogLevels(logLevels);
    }

    formatPid(pid: number): string {
        return `[${this.#appName}] ${pid}  - `;
    }

    logRequest(request: Record<string, any>): void {
        const { hash, headers, ip, method, originalUrl } = request;
        const userAgent = headers['user-agent'] || '';

        this.log(`${hash} - [>>>] ${method} - ${originalUrl} - ${userAgent} - ${ip}`);
    }

    logResponse(request: Record<string, any>, response: Record<string, any>): void {
        const { hash, headers, ip, method, originalUrl } = request;
        const { statusCode } = response;
        const userAgent = headers['user-agent'] || '';

        this.log(`${hash} - [<<<] ${method} - ${originalUrl} - ${statusCode} - ${userAgent} - ${ip}`);
    }

    setAppName(name: string): void {
        this.#appName = name;
    }
}
