import { Client, GuildTextBasedChannel } from "discord.js";
import consola from "consola";
import { save_channel_to_db } from "../services/channelNameServices";
import { guild_id, live_backup } from "../config/config";
import { channels_model } from "..";

/**
 * Keep stored channel names fresh.
 *
 * - channelUpdate: fires when a channel is renamed or moved, so we upsert.
 * - channelDelete: keeps the row (and its name) so a restore can still rebuild
 *   the channel, but marks nothing else — deletion is tracked implicitly by
 *   the row simply no longer existing on Discord.
 */
/** Narrow an arbitrary channel to a guild text channel we can safely store. */
const as_guild_text_channel = (channel: unknown): GuildTextBasedChannel | null => {
    const candidate = channel as GuildTextBasedChannel;
    if(!candidate) return null;
    // DMChannel has no guildId; anything outside our guild is irrelevant.
    if(candidate.guildId !== guild_id) return null;
    if(!candidate.isTextBased || !candidate.isTextBased()) return null;
    return candidate;
}

export const channel_update_listener = (client: Client) => {
    client.on('channelUpdate', async (_oldChannel, newChannel) => {
        try{
            if(!live_backup) return;
            const channel = as_guild_text_channel(newChannel);
            if(!channel) return;

            await save_channel_to_db(channel);
        }catch(err: any){
            consola.error("Err at /events/channelUpdate.ts/channel_update_listener()");
            console.log(err);
        }
    });

    client.on('channelCreate', async (created) => {
        try{
            if(!live_backup) return;
            const channel = as_guild_text_channel(created);
            if(!channel) return;

            await save_channel_to_db(channel);
        }catch(err: any){
            consola.error("Err at /events/channelUpdate.ts/channel_create_listener()");
            console.log(err);
        }
    });

    // On startup, also sweep channels so names exist even when INITIAL_BACKUP
    // is disabled. Cheap: only writes when a name is missing or changed.
}


/**
 * One-off sweep of every text channel in the guild, storing each id -> name.
 * Runs on ready so channel names are captured even when INITIAL_BACKUP=false.
 */
export const sweep_channel_names = async (client: Client) => {
    try{
        if(!guild_id) return;

        const guild = await client.guilds.fetch(guild_id);
        if(!guild) return;

        const channels = (await guild.channels.fetch()).filter(c => c !== null);
        let saved = 0;

        for(const channel of channels.values()){
            if(!channel) continue;
            const text = as_guild_text_channel(channel);
            if(!text) continue;

            await save_channel_to_db(text);
            saved++;
        }

        consola.success(`Channel names backed up: ${saved}`);
    }catch(err: any){
        consola.error("Err at /events/channelUpdate.ts/sweep_channel_names()");
        console.log(err);
    }
}
