import { Message } from "discord.js";

export const fetch_msgs = async (channelId: string) => {
    try{

    }catch(err: any){
        console.log("Err at /services/messageServices.ts/fetch_msgs()");
        console.log(err);
        throw new Error(err.message);
    }   
}

export const fetch_msg_content = async (msg: Message) => {
    try{
    }catch(err: any){
        console.log("Err at /services/messageServices.ts/fetch_msg_content()");
        console.log(err);
        throw new Error(err.message);
    }
}