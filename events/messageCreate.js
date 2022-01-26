const Discord = require('discord.js');

module.exports = {
    name: 'messageCreate',
    run: async (bot, message) => {
        const {client, prefix} = bot;

        if (!message.guild) return;
        
        if (message.author.bot) return;

        if (!message.content.startsWith(prefix)) return;

        const commandline = message.content.slice(prefix.length);
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmdstr = args.shift().toLowerCase();

        const command = client.commands.get(cmdstr);

        if (!command) return;

        const member = message.member;

        if (command.devOnly && !owners.includes(member.id)) {
            return message.reply ("This command is only available to the bot owners.");
        }

        if (command.premission && member.premission.missing(command.premissions).length !== 0) {
            return message.reply ("You do not have permissions to use this command.");
        }

        try {
            await command.run({...bot, message, commandline, args});
        } 
        catch (err) {
            let errMsg = err.toString();

            if (errMsg.startsWith("?")) {
                errMsg = errMsg.slice(1);
                await message.reply(errMsg);
            } 
            else {
                console.error(errMsg);
            }
        }
    }
}