import { Client, GuildTextBasedChannel, IntentsBitField } from "discord.js";
import { Sequelize } from "sequelize";
import { get_pass_from_user, token } from "./config/config";
import { define_messages } from "./database/models/messages";
import { define_attachments } from "./database/models/attachments";
import { define_channels } from "./database/models/channels";
import { message_create_listener } from "./events/messageCreate";
import { initial_backup_scraper } from "./services/initialBackupServices";
import consola from "consola";
import { message_update_listener } from "./events/messageEdit";
import { channel_update_listener, sweep_channel_names } from "./events/channelUpdate";


// A single unhandled rejection (e.g. an attachment fetch that slipped through)
// used to terminate the whole process mid-scrape. Log and continue instead —
// losing one item is far better than losing a 40-minute backup run.
process.on('unhandledRejection', (reason) => {
    consola.error(`Unhandled rejection (ignored): ${reason}`);
});

process.on('uncaughtException', (err) => {
    consola.error(`Uncaught exception (ignored): ${err?.message}`);
});

const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.MessageContent]
})

client.once('ready', async (client) => {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    
    //adding listeners
    message_create_listener(client);
    message_update_listener(client);
    channel_update_listener(client);

    // Capture channel names even when INITIAL_BACKUP is disabled, so the
    // backup always knows which channel id maps to which human readable name.
    await sweep_channel_names(client);

    await main();
})

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'server.db',
    logging: false
})

export const messages_model = define_messages(sequelize);
export const attachments_model = define_attachments(sequelize);
export const channels_model = define_channels(sequelize);

consola.warn('Syncing DB may take a while... please be patient.')
sequelize.sync({alter: true}).then(async () => {
    console.log("DB synced.");
    await get_pass_from_user();
    await client.login(token);
});

const main = async () => {
    await initial_backup_scraper();
}
