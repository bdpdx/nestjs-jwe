export interface User {
    createdAt?: string;
    deletedAt?: string;
    email: string;
    id: number | string;
    isDisabled: boolean;
    isEmailVerified: boolean;
    role: 'admin' | 'user';
}
