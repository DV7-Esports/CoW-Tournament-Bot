const Discord = require('discord.js');
require('dotenv').config();

const welcomeChannelId = 934887657794846791;

const intents = ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES"];
const client = new Discord.Client({intents: intents, ws: {intents: intents}});

let bot = {
    client,
    prefix: "cow.",
    owners: ["374295851222171679"]
};

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload);
client.loadEvents(bot, false);

client.loadCommands = (bot, reload) => require("./handlers/commands")(bot, reload);
client.loadCommands(bot, false);

module.exports = bot;

client.login(process.env.TOKEN);