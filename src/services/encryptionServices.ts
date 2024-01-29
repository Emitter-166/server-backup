import { key } from "../config/config";
import crypto from 'crypto';

export const encrypt = (data: Buffer) => {
    if(!key) return data;

    let cipher = crypto.createCipheriv('aes256', key, Buffer.alloc(16, 0));

    let encrypted = cipher.update(data);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return encrypted;
}