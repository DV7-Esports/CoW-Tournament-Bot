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

    async run(message: Message, argsOriginal: string[]) {
        if (argsOriginal[0] === 'help') {
            message.reply({ embeds: [this.tooltipEmbed] });
            return;
        }

        if (!message.guild) return;

        // Notify for processing
        const reply: Message = await message.reply('_Processing..._');

        // Parse parameters
        let args = argsOriginal.join(' ')
            .split(/\(|\)/)
            .filter(x => x.trim().length !== 0)
            .map(x => x.trim());

        // Generate Team Object
        let team: Team = {} as Team;
        try {
            team = await teamUtils.generateTeam(reply, args);
            const color = args[2];
            team.creator = message.author.id;
            team.request.requestor = message.author.id;
            team.role = (
                await message.guild.roles.create({
                    name: team.request.name as string,
                    color: color as ColorResolvable,
                    hoist: true,
                    mentionable: true,
                    reason: `Role for the players from team ${team.name}.`,
                    position: 1
                })
            ).id;
        } catch (err: any) {
            reply.reply(err.toString());
        }

        // Generate request message
        const request = await (message.guild.channels.cache.get(constants.teamRequestChannelId) as TextChannel).send(
            await teamUtils.rosterGenerator(team)
        );
        
        // Generate team channels
        const voice_channel: VoiceChannel = await message.guild.channels.create(constants.voice.pending + team.request.name, {
            type: 'GUILD_VOICE',
            parent: constants.teamChannelsCategoryId
        });

        const roster_channel: TextChannel = await message.guild.channels.create(team.request.name, {
            type: 'GUILD_TEXT',
            parent: constants.rosterChannelsCategoryId
        });

        // Send public roster
        await roster_channel.send(await teamUtils.rosterGenerator(team, true, false));
        await roster_channel.send(`To edit the roster, use the following command:
||` + process.env.PREFIX + `modifyTeam (<@&${team.role}>) ${argsOriginal.join(' ')} ||`);

        // Set reaction votes
        await request.react(constants.reactions.approved);
        await request.react(constants.reactions.denied);

        // Finish team object details
        team.request.post = request.id;
        team.roster_channel = roster_channel.id;
        team.voice_channel = voice_channel.id;

        // Set channel permissions
        // - everyone
        voice_channel.permissionOverwrites.edit(constants.roles.everyone, {
            VIEW_CHANNEL: false,
            CONNECT: false
        });
        roster_channel.permissionOverwrites.edit(constants.roles.everyone, {
            VIEW_CHANNEL: true,
            READ_MESSAGE_HISTORY: true,
            SEND_MESSAGES: false
        });
        // - team members
        voice_channel.permissionOverwrites.edit(team.role, {
            VIEW_CHANNEL: true,
            CONNECT: true
        });

        // Give team members roles
        team.request.players.forEach(player => {
            message.guild?.members.cache.get(player.user)?.roles.add(team.role);
        });
        team.request.managers.forEach(user => {
            message.guild?.members.cache.get(user)?.roles.add(team.role);
            message.guild?.members.cache.get(user)?.roles.add(constants.roles.teamManager);
        });
        team.request.captains.forEach(user => {
            message.guild?.members.cache.get(user)?.roles.add(team.role);
            message.guild?.members.cache.get(user)?.roles.add(constants.roles.teamCaptain);
        });

        // Add the team to the database
        await db(async (tables: IDb) => {
            tables.teams.insertOne(team);
        });

        // Done message
        await reply.edit(`Request received, ${message.author.toString()}.`);
    }
}
