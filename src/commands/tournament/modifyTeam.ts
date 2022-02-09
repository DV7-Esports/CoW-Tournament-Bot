import { table } from 'console';
import { ColorResolvable, Message, MessageEmbed, TextChannel, VoiceChannel } from 'discord.js';
import Command from '../../structures/Command';
import db from '../../structures/db';
import DiscordClient from '../../structures/DiscordClient';
import IDb from '../../structures/IDb';
import Team from '../../structures/Team';
import constants from '../../utils/constants';
import getParams from '../../utils/dmInterface';
import { IQuestion } from '../../utils/interfaces';
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
                'modifyTeam @Team'
            ],
            questions: [
                {
                    question: 'What is the name of the team? _Up to 16 symbols_',
                    options: {answerRegex: '.{1,16}', default: true}
                },
                {
                    question: 'What is your tag? _Use only latin capital letters and/or digits. Max 4 symbols_',
                    options: {answerRegex: '[A-Z0-9]{1,4}', default: true}
                },
                {
                    question: 'What color should your role be? _Find the code of your color using <https://www.color-hex.com/>_. Ex: Instead of red put #ff0000',
                    options: {answerRegex: '#[0-9a-f]{6}', default: true}
                },
                {
                    question: 'Who is the manager of the team? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'Who is the captain of the team? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'Now you will need to list your players one by one.',
                    options: {noanswer: true}
                },
                {
                    question: 'Who is your player #1? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'What are all the accounts of player #1? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+', default: true}
                },
                {
                    question: 'Who is your player #2? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'What are all the accounts of player #2? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+', default: true}
                },
                {
                    question: 'Who is your player #3? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'What are all the accounts of player #3? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+', default: true}
                },
                {
                    question: 'Who is your player #4? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'What are all the accounts of player #4? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+', default: true}
                },
                {
                    question: 'Who is your player #5? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', default: true}
                },
                {
                    question: 'What are all the accounts of player #5? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+', default: true}
                },
                {
                    question: 'The following questions are not mandatory. You can stop listing players by typing \'stop\'',
                    options: {noanswer: true}
                },
                {
                    question: 'Who is your player #6? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true, default: true}
                },
                {
                    question: 'What are all the accounts of player #6? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #7? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true, default: true}
                },
                {
                    question: 'What are all the accounts of player #7? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #8? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true, default: true}
                },
                {
                    question: 'What are all the accounts of player #8? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #9? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true, default: true}
                },
                {
                    question: 'What are all the accounts of player #9? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+'}
                },
                {
                    question: 'Who is your player #10? _Ex. CoW Cup Bot#8774_',
                    options: {answerRegex: '.+#[0-9]{4}', optional: true, default: true}
                },
                {
                    question: 'What are all the accounts of player #10? _Make sure to mention the server and to separate the accounts with \',\' (comma)._\n_Ex. Coder of worlds#EUW, Top TTS#EUNE_',
                    options: {answerRegex: '(.+#[EUNE|EUW|NA|BR|LAN|LAS|OCE|KR|RU|TR|JP],?)+', default: true}
                },
            ],
            description: 'Allows you to modify your own team.',
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
            ]
        });
    }

    async run(message: Message, _: string[]) {
        if (_[0] === 'help') {
            message.reply({ embeds: [this.tooltipEmbed] });
            return;
        }

        if (!message.guild) return;
        
        const dmInitiation = await message.author.send('Hello! Thanks for registrating your team. We have to ask you a few questions before completing your application.');

        // Parse parameters
        const args = (await getParams.questionnaire(dmInitiation, this.info.questions as IQuestion[]))
                    .filter(x => x.trim().length !== 0)
                    .map(x => x.trim());
        dmInitiation.channel.send('Thank you for the application! :smiley: We are currently reviewing so we will get back to you as soon as we have a decision.')

        // Notify for processing
        const reply: Message = await message.reply('_Processing..._');

        // Gather the team to edit
        const teamRoleId: string = _[0]
            .split('')
            .filter(x => '0' <= x && x <= '9')
            .join('');
        
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
