import {
    GuildMember, Message, MessageReaction, PartialMessage, PartialMessageReaction, PartialUser,
    Role, TextChannel, User
} from 'discord.js';

import db from '../structures/db';
import DiscordClient from '../structures/DiscordClient';
import Event from '../structures/Event';
import IDb from '../structures/IDb';
import Team from '../structures/Team';
import constants from '../utils/constants';
import teamSetup from '../utils/teamCheck';
import teamUtils from '../utils/teamUtils';

async function isTeamRequest(message: Message | PartialMessage): Promise<Team> {
    return await db(async (tables: IDb) => {
        return await tables.teams.findOne({ 'request.post': message.id.toString() });
    });
}

export default class MessageReactionAddEvent extends Event {
    constructor(client: DiscordClient) {
        super(client, 'messageReactionAdd');
    }

    async run(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
        if (user.bot) return;

        if (!reaction.message.guild) return;

        if (!reaction.message.guild.members.cache.get(user.id)?.roles.cache.some((role: Role) => role.id === constants.accountValidatorRoleId)) {
            reaction.message.reply(`${user.toString()} has no permission to approve teams.`);
            return;
        }

        try {
            const team = await isTeamRequest(reaction.message);
            if (team !== null) {
                if (!team._id) throw 'No team found';
                if (reaction.emoji.toString() === constants.reactions.approved) {
                    teamSetup.approve(this.client, team._id, user as User);
                    let updatedTeam: Team = {} as Team;
                    await db(async (tables: IDb) => {
                        updatedTeam = await tables.teams.findOne({ 'request.post': reaction.message.id.toString() }) as Team;
                    });
                    const roster_channel = await reaction.message.guild.channels.cache.get(updatedTeam.roster_channel) as TextChannel;
                    await roster_channel.bulkDelete(100, true);
                    await roster_channel.send(await teamUtils.rosterGenerator(team, true, false));
                    await roster_channel.send(`To edit the roster, use the following command:
||` + process.env.prefix + `modifyTeam ||`);
                } else if (reaction.emoji.toString() === constants.reactions.denied) {
                    teamSetup.deny(this.client, team._id, user as User);
                }
            } else {
                throw 'No team found';
            }
        } catch (err: any) {
            let errMsg = err.toString();

            if (errMsg.startsWith('?')) {
                errMsg = errMsg.slice(1);
                await reaction.message.reply(errMsg);
            } else {
                console.log(errMsg);
            }
        }
    }
}
