import { DialectService } from 'src/common/services/dialect.service';
import { Module } from '@nestjs/common';

@Module({
    providers: [DialectService],
    exports: [DialectService],
})
export class DialectModule {}
