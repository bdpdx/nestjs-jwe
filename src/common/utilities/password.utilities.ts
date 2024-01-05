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
    const _iterations = iterations ?? 600000;
    const _salt = salt ?? crypto.randomBytes(16);

    const hash = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(
            password,
            _salt,
            _iterations,
            32,
            'sha256',
            (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
            },
        );
    });

    return { hash, salt: _salt };
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
