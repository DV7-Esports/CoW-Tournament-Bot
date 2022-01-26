const {db} = require('../../tools/db/init');

const team_channels_categoryId = "935114455048654878";
const teamRequestChannelId="935138348480221204";
const accountRegions = ['EUNE', 'EUW', 'NA', 'BR', 'LAN', 'LAS', 'OCE', 'KR', 'RU', 'TR', 'JP'];

const helpTooltip = `In order to create a team, you need to send us a request using the command. Example of the usage below:
\`\`Command:\`\` createTeam (Team name) (Abbreviature up to 4 signs) (Color for your Discord role) (Mention manager) (Mention captain) (Mention player 1 : Summoner name1#Region1, Summoner name2#Region2) (Mention player 2 : Summoner name1#Region1, Summoner name2#Region2) _etc._
\`\`Example:\`\` createTeam (Coders) (CDRS) (#00ff00) ( <@!934889586952376390> ) ( <@!934889586952376390> ) ( <@!934889586952376390> : Coder of worlds#EUW, Top TTS#EUNE) _..._`;

function rosterGenerator(name, abbrev, manager, captain, members) {
    let roster = 
                `<@&935147009495674900>\n`+
                `Team ${name} (${abbrev}) _applied to join the tournament_\n`+
                `\`\`Team manager:\`\` <@${manager}>\n`+
                `\`\`Team captain:\`\` <@${captain}>\n`;
    members.forEach((player) => {
        roster = roster + `\`\`      Player:\`\` <@${player.userId}>\n`;
        player.igns.forEach(x => {
            roster = roster + `\`\`             \`\` <https://www.leagueofgraphs.com/summoner/${x.region.toLowerCase()}/${encodeURIComponent(x.ign)}>\n`;
        });
    });
    return roster;
}

module.exports = {
    name: 'createTeam',
    category: 'teams',
    permissions: [],
    devOnly: false,
    run: async ({client, message, commandline, autoArgs}) => {
        if (commandline.split(' ')[1] === 'help') {
            message.reply(helpTooltip);
            return;
        }
        let params, args, name, abbrev, color, manager, captain, members;
        try {
            params = commandline.slice('createTeam'.length);
            args = params.split(/\(|\)/).filter(x => x.trim().length !== 0).map(x => x.trim());
            name = args[0];
            abbrev = args[1];
            color = args[2];
            manager = args[3].split('').filter(x => '0' <= x && x <= '9').join('');
            captain = args[4].split('').filter(x => '0' <= x && x <= '9').join('');
            let warningMessage = '';
            members = args.slice(5).map((mentionAndIGNs) => {
                const userId = mentionAndIGNs.split('>')[0].split('').filter(x => '0' <= x && x <= '9').join('');
                const igns = mentionAndIGNs.split(':')[1].split(',').map(x => x.trim()).map((ign) => {
                    let accountInfo = {
                        'ign': ign.split('#')[0],
                        'region': ign.split('#')[1].toUpperCase()
                    };

                    if (!(accountRegions.includes(accountInfo.region))) {
                        warningMessage += `${accountInfo.ign} **(${accountInfo.region})** is not from a valid region.\n`;
                    }

                    return accountInfo;
                });
                return {
                    'userId': userId,
                    'igns': igns
                }
            });

            if (warningMessage.length !== 0) {
                warningMessage += `**The regions are ${accountRegions.join(', ').toString()}.**`
                await message.reply(warningMessage);
                return;
            }

            if (members.length < 5) {
                await message.reply('Your team is incomplete. You do not have enough (at least 5) players.');
                return;
            }
        } catch (err) {
            throw '?Invalid syntax of the command.\n' + err.toString();
        }

        client.channels.cache.get(teamRequestChannelId).send(rosterGenerator(name, abbrev, manager, captain, members));

        await message.reply("Request received.");
    }
};

//  user: createTeam (name) (abbrev) (color) (@mention manager) (@mention captain) (@mention : IGNs)