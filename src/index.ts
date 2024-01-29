import { Client, GuildTextBasedChannel, IntentsBitField } from "discord.js";
import { Sequelize } from "sequelize";
import { get_pass_from_user, token } from "./config/config";
import { define_messages } from "./database/models/messages";
import { define_attachments } from "./database/models/attachments";
import { message_create_listener } from "./events/messageCreate";
import { initial_backup_scraper } from "./services/initialBackupServices";
import consola from "consola";
import { message_update_listener } from "./events/messageEdit";



const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.MessageContent]
})

client.once('ready', async (client) => {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    
    //adding listeners
    message_create_listener(client);
    message_update_listener(client);

    await main();
})

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'server.db',
    logging: false
})

export const messages_model = define_messages(sequelize);
export const attachments_model = define_attachments(sequelize);

consola.warn('Syncing DB may take a while... please be patient.')
sequelize.sync({alter: true}).then(async () => {
    console.log("DB synced.");
    await get_pass_from_user();
    await client.login(token);
});

const main = async () => {
    await initial_backup_scraper();
}
