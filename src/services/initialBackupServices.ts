
/**
 * We are using a multithreaded approach
 * Where we 
 * 1. Load up all_channels array with all the channels we need to scrape
 * 2. Spawn instances of initial_backup_process, this process will pull channels from the array and work on it each at a time. More processes = more hands (faster)
 */

import consola from "consola";
import { Collection, GuildTextBasedChannel, Message } from "discord.js";
import { get_msg_content, save_msg_to_db } from "./messageServices";
import { fetch_channels } from "./channelServices";
import { guild_id, initial_backup } from "../config/config";

let all_channels: GuildTextBasedChannel[] = [];
let get_a_channel = () => all_channels.pop();

//stats
let processed_total = 0;
let initial_length_of_all_channels = 0;
let number_of_processes = 3;
let startedAt = 0;

export const initial_backup_scraper = async () => {
    try{
        if(!initial_backup) return;

        consola.warn("Starting Initial Back Up... Please change configs from .env if you dont want this to happen");
        startedAt = Date.now();

        if(!guild_id) throw new Error('Please set a proper "guild_id" in .env');
        all_channels = await fetch_channels(guild_id);
        initial_length_of_all_channels = all_channels.length;

        let proceses = [];

        for(let i = 0; i<number_of_processes; i++){
            consola.info(`Spawning process ${i+1}/${number_of_processes}`);
            proceses.push(initial_backup_process());
        }

        await Promise.all(proceses);

        consola.success("Initial Backup Complete!");
    }catch(err: any){
        consola.error("Err at /services/initialBackupServices.ts/initial_backup_scraper()");
        console.log(err);
        throw new Error(err.message);
    }
}

//this works with 1 channel at a time
export const initial_backup_process = async () => {
    try{
        do{
            const channel = get_a_channel();
            if(!channel) break; //successfully went through all the channels

            let last_msg: Message | undefined = undefined;
            let fetched_messages  = new Collection<string,Message>();;
            
            do{
                fetched_messages = !last_msg ? await channel.messages.fetch({limit: 100}) : await channel.messages.fetch({limit: 100, before: last_msg.id});

                processed_total += fetched_messages.size;
        
                last_msg = Array.from(fetched_messages)[fetched_messages.size-1][1]; //setting the last message, this is very important so we can keep the loop going

                for(let raw_msg of fetched_messages){
                    const msg = raw_msg[1];
                    
                    const raw_data = await get_msg_content(msg);
                    await save_msg_to_db(raw_data)

                    if(raw_data.thread) all_channels.push(raw_data.thread); //making sure we also scrape the threads
                }

                //logging
                consola.success(`${all_channels.length+number_of_processes}/${initial_length_of_all_channels} Total Msg Processed: ${processed_total} Seconds Passed: ${((Date.now()-startedAt)/1000).toFixed(0)} Last: ${last_msg.url}`);
            }while(fetched_messages.size===100);

        }while(all_channels.length!==0);


    }catch(err: any){
        consola.error("Err at /services/initialBackupServices.ts/initial_backup_scraper()");
        console.log(err);
        throw new Error(err.message);
    }
}