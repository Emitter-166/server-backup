import { Message } from "discord.js";
import { guild_id, live_backup } from "../config/config";
import { get_msg_content, save_msg_to_db, update_msg_to_db } from "./messageServices";
import consola from "consola";
import fs from 'fs/promises';

export const live_backup_msg_handler = async (msg: Message) => {
    try{
        //handling configs
        if(!live_backup) return;
        if(msg.guildId !== guild_id) return;

        const raw_data = await get_msg_content(msg);
        await save_msg_to_db(raw_data);
    }catch(err: any){
        consola.error("Err at /services/liveBackupServices.ts/live_backup_msg_handler()");
        console.log(err);
    }
}

export const live_backup_msg_update_handler = async (msg: Message) => {
    try{
        //handling configs
        if(!live_backup) return;
        if(msg.guildId !== guild_id) return;

        const raw_data = await get_msg_content(msg);
        await update_msg_to_db(raw_data);
    }catch(err: any){
        consola.error("Err at /services/liveBackupServices.ts/live_backup_msg_update_handler()");
        console.log(err);
    }
}