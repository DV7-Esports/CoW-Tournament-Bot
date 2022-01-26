const {getFiles} = require("../tools/functions");

module.exports = (bot, reload) => {
    const {client} = bot;

    let events = getFiles("./events/", ".js");

    if (events.length === 0) {
        console.log ("No events to load.");
    }

    events.forEach((f, i) => {
        if (reload) {
            delete require.cache[require.resolve(`../events/${f}`)];
        }

        const event = require(`../events/${f}`);

        client.events.set (event.name, event);
        if (!reload) {
            console.log (`${i+1}. ${f} loaded.`);
        }
    });

    if (!reload) {
        initEvents(bot);
    }
};

function triggerHandler(bot, event, ...args) {
    const {client} = bot;

    try {
        if (client.events.has(event)) {
            client.events.get(event).run (bot, ...args);
        }
        else {
            throw new Error (`Event ${event} does not exist.`);
        }
    }
    catch {
        console.error (err);
    }
}

function initEvents(bot) {
    const {client} = bot;

    client.on('ready', () => {
        triggerHandler(bot, 'ready');
    });

    client.on('messageCreate', (message) => {
        triggerHandler(bot, 'messageCreate', message);
    });

    client.on('guildMemberAdd', (member) => {
        triggerHandler(bot, 'guildMemberAdd', member);
    });
}