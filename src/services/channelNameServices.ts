import { GuildTextBasedChannel } from "discord.js";
import consola from "consola";
import { channels_model } from "..";
import { ignore_channels } from "../config/config";

/**
 * Upsert a single channel's name into the DB.
 *
 * Safe to call repeatedly: it updates in place if the channel id already
 * exists, so renames are picked up rather than duplicated.
 */
export const save_channel_to_db = async (channel: GuildTextBasedChannel) => {
    try{
        //respecting the same ignore list used for messages
        if(ignore_channels.includes(channel.id)) return;

        const previous = await channels_model.findOne({where: {channelId: channel.id}});

        const data = {
            channelId: channel.id,
            name: channel.name,
            type: channel.type,
            parentId: channel.parentId ?? null
        };

        if(previous){
            //only write when something actually changed
            if(
                previous.get('name') === data.name &&
                previous.get('parentId') === data.parentId
            ) return;

            await previous.update(data);
            return;
        }

        await channels_model.create(data);
    }catch(err: any){
        consola.error("Err at /services/channelNameServices.ts/save_channel_to_db()");
        console.log(err);
    }
}
