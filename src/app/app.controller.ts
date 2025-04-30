import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { LoggerService } from 'src/logger/logger.service';

@Controller()
export class AppController {
    constructor(
        private readonly log: LoggerService,
    ) {}

    // @UseGuards(JweAuthGuard) // unnecessary if AppJweAuthGuard is registered
    @Get('test')
    async getTest(@Req() req: Request) {
        this.log.debug('test endpoint hit, user is ', req.user);

        return {
            message: 'hello, world!',
        };
    }
}
