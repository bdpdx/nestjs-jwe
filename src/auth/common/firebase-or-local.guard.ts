import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { DialectService } from 'src/common/services/dialect.service';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { isObservable, lastValueFrom } from 'rxjs';
import { LocalAuthGuard } from '../local/local.guard';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class FirebaseOrLocalGuard implements CanActivate {
    constructor(
        private readonly dialectService: DialectService,
        private readonly moduleRef: ModuleRef
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const guard = this.dialectService.isFirebase()
            ? await this.moduleRef.resolve(FirebaseAuthGuard)
            : await this.moduleRef.resolve(LocalAuthGuard);

        if (!guard) {
            throw new Error('Failed to resolve appropriate auth guard');
        }
        
        const result = guard.canActivate(context);

        if (isObservable(result)) {
            return await lastValueFrom(result);
        }

        return await result;
    }
}
