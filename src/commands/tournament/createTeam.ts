import { ColorResolvable, Message, MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import Command from '../../structures/Command';
import db from '../../structures/db';
import DiscordClient from '../../structures/DiscordClient';
import IDb from '../../structures/IDb';
import Team from '../../structures/Team';
import constants from '../../utils/constants';
import teamUtils from '../../utils/teamUtils';
import dotenv from 'dotenv';
import { env } from 'process';
import getParams from '../../utils/dmInterface';
import { IQuestion } from '../../utils/interfaces';

export default class createTeam extends Command {
    private tooltipEmbed: MessageEmbed;

    constructor(client: DiscordClient) {
        super(client, {
            name: 'createTeam',
            group: 'Tournament',
            enabled: true,
            onlyNsfw: false,
            examples: [
                'type ``' + process.env.prefix + 'createTeam`` and check your DMs :smiley:'
            ],
            questions: [
                {
                    question: 'What is the name of the team? _Up to 16 symbols_',
                    options: {answerRegex: '.{1,16}'}
                },
                {
                    question: 'What is your tag? _Use only latin capital letters and/or digits. Max 4 symbols_',
                    options: {answerRegex: '[A-Z0-9]{1,4}'}
                },
                {
                    question: 'What color should your role be? _Find the code of your color using <https://www.color-hex.com/>_. Ex: Instead of red put #ff0000',
                    options: {answerRegex: '#[0-9a-f]{6}'}
                },
                {
                    question: 'Who is the manager of the team? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'Who is the captain of the team? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'Now you will need to list your players one by one.',
                    options: {noanswer: true}
                },
                {
                    question: 'Who is your player #1? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'What are all the accounts of player #1? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #2? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'What are all the accounts of player #2? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #3? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'What are all the accounts of player #3? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #4? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'What are all the accounts of player #4? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #5? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}'}
                },
                {
                    question: 'What are all the accounts of player #5? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'The following questions are not mandatory. You can stop listing players by typing \'stop\'',
                    options: {noanswer: true}
                },
                {
                    question: 'Who is your player #6? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true}
                },
                {
                    question: 'What are all the accounts of player #6? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #7? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true}
                },
                {
                    question: 'What are all the accounts of player #7? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #8? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true}
                },
                {
                    question: 'What are all the accounts of player #8? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #9? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true}
                },
                {
                    question: 'What are all the accounts of player #9? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #10? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true}
                },
                {
                    question: 'What are all the accounts of player #10? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
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
                    value: this.info.examples ? this.info.examples.map(x => `${x}`).join('\n') : 'No examples'
                },
                {
                    name: 'Description',
                    value: this.info.description ? this.info.description : 'No description'
                },
            ]
        });
    }

    async run(message: Message, argsOriginal: string[]) {
        if (argsOriginal[0] === 'help') {
            message.reply({ embeds: [this.tooltipEmbed] });
            return;
        }

        if (!message.guild) return;

        const dmInitiation = await message.author.send('Hello! Thanks for registrating your team. We have to ask you a few questions before completing your application.');

        // Parse parameters
        const args = (await getParams.questionnaire(dmInitiation, this.info.questions as IQuestion[]))
                    .filter(x => x.trim().length !== 0)
                    .map(x => x.trim());
        if(args.length === 0) {
            await message.reply('_Timed out..._');
            return;
        } else {
            dmInitiation.channel.send('Thank you for the application! :smiley: We are currently reviewing so we will get back to you as soon as we have a decision.')
        }
                    
        // Notify for processing
        const reply: Message = await message.reply('_Processing..._');

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
||` + process.env.PREFIX + `modifyTeam <@&${team.role}> ||`);

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
