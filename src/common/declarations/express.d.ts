import { User } from 'src/users/user.interface';

declare module 'express' {
    interface Request {
        user: User;
    }
}
