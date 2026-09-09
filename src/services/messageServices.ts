import { Message, blockQuote } from "discord.js";
import { AttachmentData, ExtractedContent, MessageData } from "../..";
import { encrypt } from "./encryptionServices";
import { ignore_channels, ignore_users } from "../config/config";
import { attachments_model, messages_model } from "..";
import consola from "consola";

export const fetch_and_save_msgs = async (channelId: string) => {
    try{

    }catch(err: any){
        consola.error("Err at /services/messageServices.ts/fetch_and_save_msgs()");
        console.log(err);
        throw new Error(err.message);
    }   
}

/**
 * Download one attachment with retries.
 *
 * The Discord CDN regularly exceeds a 10s connect budget on slow links, and a
 * single timeout used to propagate up and kill the entire scrape. We now retry
 * with backoff and give up quietly: a missing attachment is acceptable, an
 * aborted 40-minute backup is not.
 */
const FETCH_ATTEMPTS = 3;
const FETCH_TIMEOUT_MS = 30_000;

const fetch_attachment = async (url: string): Promise<Buffer | null> => {
    for(let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++){
        try{
            const response = await fetch(url, {
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
            });

            if(!response.ok) throw new Error(`HTTP ${response.status}`);

            const array_buffer = await response.arrayBuffer();
            if(!array_buffer) return null;

            return Buffer.from(array_buffer);
        }catch(err: any){
            const is_last = attempt === FETCH_ATTEMPTS;
            if(is_last){
                consola.warn(`Attachment download failed after ${FETCH_ATTEMPTS} attempts (${err?.code || err?.message}) - skipping`);
                return null;
            }
            // exponential backoff: 2s, 4s
            await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
    }
    return null;
}

export const get_msg_content = async (msg: Message) => {
    try{
        
        let data: ExtractedContent = {
            channelId: msg.channelId,
            userId: msg.author.id,
            messageId: msg.id,
            time: new Date(msg.createdTimestamp).getTime(),
            text: msg.content,
            attachments: new Map<string, Buffer>(),
            thread: null
        }

        //fetching attachments
        const attachments_raw = msg.attachments.map(v => v);        
        for(let attachment of attachments_raw){
            const buffer = await fetch_attachment(attachment.url);

            //non-fatal: keep the message text even if the attachment is lost
            if(!buffer) continue;

            const [raw_name, extension] = attachment.name.split(".");
            const name = `${raw_name}__${Date.now()}.${extension}`;

            data.attachments.set(name, buffer);
        }


        //fetching thread
        if(!msg.hasThread) return data;

        const thread = await msg.thread?.fetch();

        if(!thread) return data;
    
        data.thread = thread;

        return data;
    }catch(err: any){
        consola.error("Err at /services/messageServices.ts/fetch_msg_content()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const save_msg_to_db = async (raw_data: ExtractedContent) => {
    try{
        const {channelId, messageId, userId, time, text, attachments: attachments_raw, thread} = raw_data;
        
        //making sure we arent working on a duplicate
        const previous_message = await messages_model.findOne({where: {messageId}});
        if(previous_message) return;

        //ignoring from configs
        if(ignore_channels.includes(channelId)) return;
        if(ignore_users.includes(userId)) return;

        const attachments = Array.from(attachments_raw);

        //extracting & encrypting message data
        const message_data: MessageData = {
            channelId,
            messageId,
            userId,
            time,
            text: encrypt(Buffer.from(text)),
            attachments: attachments.map(v=> v[0]).join(',')
        }

        //extracing & encrypting attachment data

        for(let attachment of attachments){
            let data: AttachmentData = {
                name: attachment[0],
                messageId,
                data: encrypt(attachment[1])
            };
            await attachments_model.create(data); //if you are wondering why we are not using a bulkCreate, because the query can sometimes exceed javascript string length limit
        }

        //saving it to DB

        await messages_model.create(message_data)
    }catch(err: any){
        consola.error("Err at /services/messageServices.ts/save_msg_to_db()");
        console.log(err);
        throw new Error(err.message);
    }
}

export const update_msg_to_db = async (raw_data: ExtractedContent) => {
    try{
        const {channelId, messageId, userId, time, text, attachments: attachments_raw, thread} = raw_data;
        
        //ignoring from configs
        if(ignore_channels.includes(channelId)) return;
        if(ignore_users.includes(userId)) return;

        //making sure we have smth to update
        const previous_message = await messages_model.findOne({where: {messageId}});
        if(previous_message) {
            const attachments = Array.from(attachments_raw);

            //extracting & encrypting message data
            const message_data: MessageData = {
                channelId,
                messageId,
                userId,
                time,
                text: encrypt(Buffer.from(text)),
                attachments: attachments.map(v=> v[0]).join(',')
            }
    
            //extracing & encrypting attachment data
    
            for(let attachment of attachments){
                let data: AttachmentData = {
                    name: attachment[0],
                    messageId,
                    data: encrypt(attachment[1])
                };
                await attachments_model.create(data); //if you are wondering why we are not using a bulkCreate, because the query can sometimes exceed javascript string length limit
            }
    
            //updating model
            await previous_message.update(message_data)
        };
    }catch(err: any){
        consola.error("Err at /services/messageServices.ts/save_msg_to_db()");
        console.log(err);
        throw new Error(err.message);
    }
}