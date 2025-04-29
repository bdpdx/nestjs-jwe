import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller()
export class AppController {
    // @UseGuards(JweAuthGuard) // unnecessary if AppJweAuthGuard is registered
    @Get('test')
    async getTest(@Req() req: Request) {
        return {
            message: 'hello, world!',
            user: req.user,
        };
    }
}
