
/**
 * We are using a multithreaded approach
 * Where we 
 * 1. Load up all_channels array with all the channels we need to scrape
 * 2. Spawn instances of initial_backup_process, this process will pull channelIds from the array and work on it each at a time. More processes = more hands (faster)
 */

import consola from "consola";

let all_channels: string[] = [];
let get_a_channel = () => all_channels.pop();

export const initial_backup_scraper = async () => {
    try{
        //fetch all channels
    }catch(err: any){
        consola.error("Err at /services/initialBackupServices.ts/initial_backup_scraper()");
        console.log(err);
        throw new Error(err.message);
    }
}

//this works with 1 channel at a time
export const initial_backup_process = async () => {
    try{
        
    }catch(err: any){
        consola.error("Err at /services/initialBackupServices.ts/initial_backup_scraper()");
        console.log(err);
        throw new Error(err.message);
    }
}