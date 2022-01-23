const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES"
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
    console.log(message.toJSON());
    if (message.content === "hi") {
        message.reply('Hello world!');
    }
});

client.on('guildMemberAdd', (member) => {
    const img = await generateImage(member)
    member.guild.channels.cache.get(welcomeChannelId).send({
        content: `<@${member.id}> Welcome to the Tournament Realm!`,
        files: [img]
    })
});

client.login(process.env.TOKEN);