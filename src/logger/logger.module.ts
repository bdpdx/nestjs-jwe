import { LoggerService } from './logger.service';
import { Module } from '@nestjs/common';

@Module({
    exports: [LoggerService],
    providers: [LoggerService],
})
export class LoggerModule {}
