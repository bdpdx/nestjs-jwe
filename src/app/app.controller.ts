import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
    // @UseGuards(JweAuthGuard) // unnecessary if JweGlobalAuthGuard is registered
    @Get('profile')
    async profile(@Req() req: Request) {
        return req.user;
    }

    @Get('public')
    async public(@Req() _req: Request) {
        return 'public';
    }
}
