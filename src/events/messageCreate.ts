import { Client } from "discord.js";
import  consola from "consola";
import { live_backup_msg_handler } from "../services/liveBackupServices";

export const message_create_listener = (client: Client) => {
    client.on('messageCreate', async msg => {
        try{
          await live_backup_msg_handler(msg); //live backup msg handler

        }catch(err: any){
            consola.error("Err at /events/messageCreate.ts/message_create_listener()");
            console.log(err);
        }
    })
}


