import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        private readonly firebase: FirebaseService,
        private readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const idToken = request.headers.authorization?.split('Bearer ')[1].trim();
        if (!idToken) throw new UnauthorizedException('Missing or malformed Authorization header');

        try {
            const decodedToken = await this.firebase.getAuth().verifyIdToken(idToken);
            if (!decodedToken.email) throw new UnauthorizedException('User not found');
            
            const user = await this.usersService.getUser(decodedToken.email);
            if (!user) throw new UnauthorizedException('User not found');

            request.user = user;

            return true;
        } catch (err) {
            throw new UnauthorizedException('Invalid Firebase ID token');
        }
    }
}
