module.exports = {
    name: 'ping',
    category: 'info',
    permissions: [],
    devOnly: false,
    run: async ({client, message, commandline, args}) => {
        message.reply("Pong");
    }
};