import { table } from 'console';
import { ColorResolvable, Message, MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import Command from '../../structures/Command';
import db from '../../structures/db';
import DiscordClient from '../../structures/DiscordClient';
import IDb from '../../structures/IDb';
import Team from '../../structures/Team';
import constants from '../../utils/constants';
import teamUtils from '../../utils/teamUtils';

export default class createTeam extends Command {
    private tooltipEmbed: MessageEmbed;

    constructor(client: DiscordClient) {
        super(client, {
            name: 'modifyTeam',
            group: 'Tournament',
            enabled: true,
            onlyNsfw: false,
            examples: [
                'modifyTeam ( @Team ) (Full name) (Abbreviature) (Role color - ex. #00ff00) ( @Manager ) ( @Captain ) ( @Player1 : Account1#EUW, Account2#EUNE) ( @Player2 : Account1#EUW) ( @Player3 : Account1#EUW) ...'
            ],
            description: 'Allows you to create your own team.',
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
        console.log('Called');

        if (args[0] === 'help') {
            message.reply({ embeds: [this.tooltipEmbed] });
            return;
        }

        if (!message.guild) return;

        // Notify for processing
        const reply: Message = await message.reply('_Processing..._');

        // Parse parameters
        console.log('Parsing');
        args = args.join(' ')
            .split(/\(|\)/)
            .filter(x => x.trim().length !== 0)
            .map(x => x.trim());
        console.log('Parsing done', args);

        // Gather the team to edit
        console.log('Gathering the team');
        const teamRoleId: string = args[0]
            .split('')
            .filter(x => '0' <= x && x <= '9')
            .join('');
        args = args.splice(1);
        console.log('Gathering done');

        let team: Team = {} as Team;
        await db(async (tables) => {
            team = await tables.teams.findOne({'role': teamRoleId}) as Team;
        });

        // Check permissions
        // 1. User = Account Validator
        if (message.guild.members.cache.get(message.author.id)?.roles.cache.has(constants.accountValidatorRoleId)) {
            const newTeam = await teamUtils.generateTeam(reply, args);
            await teamUtils.updateTeam(reply, team, newTeam);
            await reply.edit(`${message.author.toString()}, the changes were applied successfully`);
        }
        // 2. User = Team Manager
        else if (team.managers.some((manager) => manager === message.author.id)) {
            const newTeam = await teamUtils.generateTeam(reply, args);
            await teamUtils.updateTeam(reply, team, newTeam);
            await reply.edit(`${message.author.toString()}, the changes were applied successfully`);
        }
        // 3. User = Team Captain
        else if (team.captains.some((captain) => captain === message.author.id)) {
            const newTeam = await teamUtils.generateTeam(reply, args);
            if (!newTeam.managers.every((manager) => team.managers.some((x) => x === manager))) {
                await reply.edit(`${message.author.toString()}, you are captain of Team "${team.name}". Therefore, you cannot change your team manager(s). Please, contact the team managers. (ref. <#${team.roster_channel}>)`);
                return;
            }
            await teamUtils.updateTeam(reply, team, newTeam);
            await reply.edit(`${message.author.toString()}, the changes were applied successfully`);
        }
        // 4. Other
        else
            await reply.edit(`${message.author.toString()}, you are neither manager nor captain of Team "${team.name}". Therefore, you cannot perform team modifications. Please, contact the team managers/captains. (ref. <#${team.roster_channel}>)`);
    }
}
