import * as crypto from 'crypto';

interface PasswordHash {
    hash: Buffer;
    salt: Buffer;
}

export async function hashPassword(
    password: string,
    salt?: Buffer,
    iterations?: number,
): Promise<PasswordHash> {
    // iterations default via https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    iterations ??= 1048576;
    salt ??= crypto.randomBytes(16);

    const hash = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, 32, 'sha256', (err, hash) => {
            if (err) reject(err);
            else resolve(hash);
        });
    });

    return { hash, salt };
}

export async function isPasswordMatched(
    password: string,
    hashedPassword: Buffer,
    salt: Buffer,
    iterations?: number,
): Promise<boolean> {
    const { hash } = await hashPassword(password, salt, iterations);
    return crypto.timingSafeEqual(hash, hashedPassword);
}
