const {getFiles} = require('../tools/functions');
const fs = require('fs');

module.exports = (bot, reload) => {
    const {client} = bot;

    fs.readdirSync('./commands/').forEach((category) => {
        let commands = getFiles (`./commands/${category}`, '.js');

        commands.forEach ((f) => {
            if (reload) {
                delete require.cache[require.resolve(`../events/${f}`)];
            }

            const command = require(`../commands/${category}/${f}`);
            command.name = command.name.toLowerCase();
            
            client.commands.set(command.name, command);

            console.log (`Loaded command ${category} ${command.name}.`);
        });
    });

    console.log(`Loaded ${client.commands.size} commands.`);
};