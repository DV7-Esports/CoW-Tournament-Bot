const Discord = require('discord.js');
require('dotenv').config();
const generateImage = require("./tools/generateImage")

const welcomeChannelId = 934887657794846791;

const intents = ["GUILDS", "GUILD_MEMBERS"];
const client = new Discord.Client({intents: intents, ws: {intents: intents}});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    if (message.content === "hi") {
        message.reply('Hello world!');
    }
});

client.on('guildMemberAdd', async (member) => {
    console.log("New member");
    const img = await generateImage(member);
    member.guild.systemChannel.send({
        content: `<@${member.id}> Welcome to the Tournament Realm!`,
        files: [img]
    });
});

client.login(process.env.TOKEN);