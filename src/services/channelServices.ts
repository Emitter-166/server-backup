import { Collection, GuildTextBasedChannel, NonThreadGuildBasedChannel } from "discord.js";
import { client } from "..";

export const fetch_channels = async (guildId: string) => {
    try{
        if(!client.isReady()) throw new Error("Client is not ready.");

        const guild = await client.guilds.fetch(guildId);

        if(!guild) throw new Error('Guild not found.');

        let all_channels = (await guild.channels.fetch()).filter(v => v !== null);

        all_channels = all_channels.filter(v => v?.isTextBased);

        let final = all_channels.map( v => v as GuildTextBasedChannel);

        return final;
    }catch(err: any){
        console.log("Err at /services/channelServices.ts/fetch_channels()");
        console.log(err);
        throw new Error(err.message);
    }
}