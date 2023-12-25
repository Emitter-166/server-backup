import { password } from "../config/config";
import crypto from 'crypto';

export const encrypt = (data: Buffer) => {
    if(!password) return data;
    const key = crypto.scryptSync(password, 'salt', 32);

    let cipher = crypto.createCipheriv('aes256', key, Buffer.alloc(16, 0));

    let encrypted = cipher.update(data);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted;
}