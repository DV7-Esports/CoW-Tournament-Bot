import {
    Channel, ColorResolvable, Message, MessageEmbed, TextChannel, User, VoiceChannel
} from 'discord.js';
import { OptionalId } from 'mongodb';

import client from '../../client';
import Command from '../../structures/Command';
import db from '../../structures/db';
import DiscordClient from '../../structures/DiscordClient';
import IDb from '../../structures/IDb';
import Ign from '../../structures/Ign';
import Player from '../../structures/Player';
import Team from '../../structures/Team';
import TeamRequest from '../../structures/TeamRequest';
import constants from '../../utils/constants';

export default class createTeam extends Command {
    private tooltipEmbed: MessageEmbed;

    constructor(client: DiscordClient) {
        super(client, {
            name: 'createTeam',
            group: 'Tournament',
            enabled: true,
            onlyNsfw: false,
            examples: [
                'createTeam (Full name) (Abbreviature) (Role color - ex. #00ff00) ( @Manager ) ( @Captain ) ( @Player1 : Account1#EUW, Account2#EUNE) ( @Player2 : Account1#EUW) ( @Player3 : Account1#EUW) ...'
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

    async rosterGenerator(name: string, abbrev: string, manager: string, captain: string, members: Player[], requestor: string, validator?: boolean) {
        let roster = '';

        if (validator === true || validator === undefined) roster = `<@&${constants.accountValidatorRoleId}>\n`;

        roster = roster + `Team ${name} (${abbrev})`;

        if (validator === true || validator === undefined) roster = roster + ` _applied to join the tournament_`;

        roster = roster + `\n\`\`Team manager:\`\` <@${manager}>\n` + `\`\`Team captain:\`\` <@${captain}>\n`;

        members.forEach(player => {
            roster = roster + `\`\`      Player:\`\` <@${player.user}>\n`;
            player.igns.forEach(x => {
                roster = roster + `\`\`             \`\` <https://www.leagueofgraphs.com/summoner/${x.region.toLowerCase()}/${encodeURIComponent(x.summoner)}>\n`;
            });
        });

        roster = roster + `\n_Team was initiated by <@!${requestor}>._`;

        return roster;
    }

    async run(message: Message, args: string[]) {
        if (args[0] === 'help') {
            message.reply({ embeds: [this.tooltipEmbed] });
            return;
        }
        const reply: Message = await message.reply('_Processing..._');
        const params: string = args.join(' ');
        let name: string, abbrev: string, color: string, manager: string, captain: string, members: Player[];
        try {
            args = params
                .split(/\(|\)/)
                .filter(x => x.trim().length !== 0)
                .map(x => x.trim());
            name = args[0];
            abbrev = args[1];
            color = args[2];
            manager = args[3]
                .split('')
                .filter(x => '0' <= x && x <= '9')
                .join('');
            captain = args[4]
                .split('')
                .filter(x => '0' <= x && x <= '9')
                .join('');

            let warningMessage = '';
            members = args.slice(5).map(mentionAndIGNs => {
                const userId: string = mentionAndIGNs
                    .split('>')[0]
                    .split('')
                    .filter(x => '0' <= x && x <= '9')
                    .join('');
                const igns: Ign[] = mentionAndIGNs
                    .split(':')[1]
                    .split(',')
                    .map(x => x.trim())
                    .map(ign => {
                        let accountInfo: Ign = {
                            summoner: ign.split('#')[0],
                            region: ign.split('#')[1].toUpperCase()
                        } as Ign;

                        if (!accountInfo.region) {
                            warningMessage += `${accountInfo.summoner} **(${accountInfo.region})** is not from a valid region.\n`;
                        }

                        return accountInfo;
                    });
                return {
                    user: userId,
                    igns: igns
                } as Player;
            });

            if (warningMessage.length !== 0) {
                warningMessage += `**The regions are ${constants.accountRegions.join(', ').toString()}.**`;
                await reply.edit(warningMessage);
                return;
            }

            if (members.length < 5) {
                await message.reply('Your team is incomplete. You do not have enough (at least 5) players.');
                return;
            }
        } catch (err: any) {
            throw '?Invalid syntax of the command.\n' + err.toString();
        }

        if (!message.guild) return;

        const request = await (message.guild.channels.cache.get(constants.teamRequestChannelId) as TextChannel).send(
            await this.rosterGenerator(name, abbrev, manager, captain, members, message.author.id)
        );
        await request.react(constants.reactions.approved);
        await request.react(constants.reactions.denied);

        const voice_channel: VoiceChannel = await message.guild.channels.create(constants.voice.pending + name, {
            type: 'GUILD_VOICE',
            parent: constants.teamChannelsCategoryId
        });
        voice_channel.permissionOverwrites.edit(constants.everyoneId, {
            VIEW_CHANNEL: false,
            CONNECT: false
        });
        const roster_channel: TextChannel = await message.guild.channels.create(name, {
            type: 'GUILD_TEXT',
            parent: constants.rosterChannelsCategoryId
        });
        roster_channel.permissionOverwrites.edit(constants.everyoneId, {
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: false
        });
        await roster_channel.send(await this.rosterGenerator(name, abbrev, manager, captain, members, message.author.id, false));

        const team: Team = new Team(
            message.author.id,
            null,
            null,
            [],
            [],
            [],
            {
                post: request.id,
                name: name,
                abbr: abbrev,
                managers: [manager],
                captains: [captain],
                players: members,
                requestor: message.author.id
            } as TeamRequest,
            constants.team.application.pending,
            voice_channel.id,
            roster_channel.id,
            (
                await message.guild.roles.create({
                    name: name,
                    color: color as ColorResolvable,
                    hoist: true,
                    mentionable: true,
                    reason: `Role for the players from team ${name}.`,
                    position: 1
                })
            ).id
        );

        voice_channel.permissionOverwrites.edit(team.role, {
            VIEW_CHANNEL: true,
            CONNECT: true
        });

        team.request.players.forEach(player => {
            message.guild?.members.cache.get(player.user)?.roles.add(team.role);
        });
        team.request.managers.forEach(user => {
            message.guild?.members.cache.get(user)?.roles.add(team.role);
        });
        team.request.captains.forEach(user => {
            message.guild?.members.cache.get(user)?.roles.add(team.role);
        });

        await db(async (tables: IDb) => {
            tables.teams.insertOne(team);
        });

        await reply.edit('Request received.');
    }
}
