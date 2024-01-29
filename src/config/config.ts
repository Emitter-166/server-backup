import { config } from "dotenv";
import readline from 'readline';
import consola from "consola";
import crypto from 'crypto';

config();

export const token = process.env.TOKEN?.trim();
// export let password: string | undefined = undefined; //deppreciated for security reasons. moved into using keys
export let key: Buffer | undefined = undefined;

export const guild_id = process.env.GUILD_ID?.trim();

export const get_pass_from_user = async () => {
    consola.warn('Keep the password ALWAYS the same. Or else the data may corrupt. You cannot change the password since everything in the DB is being encrypted with 1 password only.')
    consola.warn('You can enter an empty password to disable encryption.')
    let given_pass;
    let confirmed_pass;

    do{
        given_pass = await safe_question('Enter your password: ')
        confirmed_pass = await safe_question('Retype your password: ');
    
        if(given_pass!==confirmed_pass) {
            consola.error("Password did not match.")
        }
    }while(given_pass!==confirmed_pass);

    if(given_pass==='') given_pass = undefined;

    key = given_pass ? crypto.scryptSync(given_pass, 'salt', 32) : undefined;

    consola.success('Password successful')
    consola.info('You have to enter this exact same password while decrypting DB')
}

export const initial_backup = process.env.INITIAL_BACKUP?.trim().toLocaleLowerCase() === 'true';

export const initial_backup_worker_count = Number(process.env.INITIAL_BACKUP_WORKER_COUNT || "4");
export const live_backup = process.env.LIVE_BACKUP?.trim().toLowerCase() === 'true'

export const ignore_users = process.env.IGNORE_USERS?.split(",").map(v => v.trim()) || [];
export const ignore_channels = process.env.IGNORE_CHANNELS?.split(",").map(v => v.trim()) || [];

export const backup_db = process.env.BACKUP_DB?.trim().toLowerCase() === 'true';

const safe_question = async (query: string): Promise<string> => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        const stdin = process.openStdin();
        process.stdin.on("data", (char: string) => {
            char = char + "";
            switch (char) {
                case "\n": case "\r": case "\u0004":
                    stdin.pause();
                    break;
                default:
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    process.stdout.write(query + Array(rl.line.length + 1).join("*"));
                    break;
            }
        });

        rl.question(query, (value) => {
            resolve(value);
            rl.close();
        });
    });
};

