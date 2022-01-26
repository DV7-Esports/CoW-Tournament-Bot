const Discord = require('discord.js');
const generateImage = require("../tools/generateImage");
const welcomeChannelId = "935093312711430174";

module.exports = {
    name: 'guildMemberAdd',
    run: async (bot, member) => {
        const {client, prefix} = bot;

        console.log('New member of the guild.');

        const img = await generateImage(member);
        client.channels.cache.get(welcomeChannelId).send({
            content: `<@${member.id}> Welcome to the Tournament Realm!`,
            files: [img]
        });
    }
}