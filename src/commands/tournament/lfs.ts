import { ColorResolvable, Message, MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import Command from '../../structures/Command';
import db from '../../structures/db';
import DiscordClient from '../../structures/DiscordClient';
import IDb from '../../structures/IDb';
import Team from '../../structures/Team';
import constants from '../../utils/constants';
import teamUtils from '../../utils/teamUtils';
import dotenv from 'dotenv';

export default class createTeam extends Command {
    private tooltipEmbed: MessageEmbed;

    constructor(client: DiscordClient) {
        super(client, {
            name: 'lfs',
            group: 'Tournament',
            enabled: true,
            onlyNsfw: false,
            examples: [
                'lfs (team) (date) (time) (format) (elo)'
            ],
            description: 'Posts that the team is looking for a scrim.',
            cooldown: 30
        });

        this.tooltipEmbed = new MessageEmbed({
            color: 'BLUE',
            title: 'Help',
            fields: [
                {
                    name: 'Usage',
                    value: this.info.examples ? this.info.examples.map(x => `\`${x}\``).join('\n') : 'No examples'
                },
                {
                    name: 'Description',
                    value: this.info.description ? this.info.description : 'No description'
                },
                {
                    name: 'Notes',
                    value: 'Make sure to put the brackets!'
                }
            ]
        });
    }

    async run(message: Message, args: string[]) {
        if (args[0] === 'help') {
            message.reply({ embeds: [this.tooltipEmbed] });
            return;
        }

        if (!message.guild) return;

        // Notify for processing
        const reply: Message = await message.reply('_Processing..._');

        // Parse parameters
        args = args.join(' ')
            .split(/\(|\)/)
            .filter(x => x.trim().length !== 0)
            .map(x => x.trim());

        // Gather the team to edit
        const teamRoleId: string = args[0]
            .split('')
            .filter(x => '0' <= x && x <= '9')
            .join('');
        args = args.splice(1);

        let team: Team = {} as Team;
        await db(async (tables) => {
            team = await tables.teams.findOne({'role': teamRoleId}) as Team;
        });

        const post = await (await message.guild.channels.cache.get(constants.lfs) as TextChannel).send(`<@&${team.role}> is looking for a scrim.
🗓️ ${args[0]}
⏰ ${args[1]}
⚔️ ${args[2]}
🆚 ${args[3]}
||Roster: <#${team.roster_channel}> ||
_React with ${constants.reactions.approved} to apply for the scrim with your already created team._`);
        post.react(constants.reactions.approved);

        // Done message
        await reply.edit(`Request received, ${message.author.toString()}.`);
    }
}
