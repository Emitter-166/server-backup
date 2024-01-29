import consola from "consola";
import { Client, Message } from "discord.js";
import { live_backup_msg_handler, live_backup_msg_update_handler } from "../services/liveBackupServices";

export const message_update_listener = (client: Client) => {
    client.on('messageUpdate', async (before, after) => {
        try{
          if(after.partial) after = await after.fetch();
          await live_backup_msg_update_handler(after as Message); //live backup msg update handler
        }catch(err: any){
            consola.error("Err at /events/messageCreate.ts/message_update_listener()");
            console.log(err);
        }
    })
}