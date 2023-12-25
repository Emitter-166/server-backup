import { Client, IntentsBitField } from "discord.js";
import { Sequelize } from "sequelize";



const F = IntentsBitField.Flags;
export const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.MessageContent]
})

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'server.db'
})

sequelize.sync({alter: true}).then(async () => {
    console.log("DB synced.");
    await main();
});

const main = async () => {
    client.login(process.env._TOKEN);
}

client.once('ready', (client) => {
    console.log(`Logged in as ${client.user.username}#${client.user.discriminator}`);
})