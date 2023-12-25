import { Client, GuildTextBasedChannel, IntentsBitField } from "discord.js";
import { Sequelize } from "sequelize";
import { token } from "./config/config";
import { define_messages } from "./database/models/messages";
import { define_attachments } from "./database/models/attachments";
import { message_create_listener } from "./events/messageCreate";



const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.MessageContent]
})

client.once('ready', async (client) => {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    
    //adding listeners
    message_create_listener(client);

    await main();
})

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'server.db',
    logging: false
})
export const messages_model = define_messages(sequelize);
export const attachments_model = define_attachments(sequelize);

sequelize.sync({alter: true}).then(async () => {
    console.log("DB synced.");
    await client.login(token);
});

const main = async () => {

}
