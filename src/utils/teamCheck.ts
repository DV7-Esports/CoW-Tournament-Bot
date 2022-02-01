import { TextChannel, User, VoiceChannel } from 'discord.js';
import { ObjectId } from 'mongodb';

import db from '../structures/db';
import DiscordClient from '../structures/DiscordClient';
import IDb from '../structures/IDb';
import Team from '../structures/Team';
import constants from './constants';

async function changeChannels(client: DiscordClient, team: Team, by: User) {
    ((await client.channels.cache.get(team.voice_channel)) as VoiceChannel).setName((constants.voice as any)[team.status] + team.name);
    ((await client.channels.cache.get(constants.teamRequestChannelId)) as TextChannel).messages.cache.get(team.request.post)?.reactions.removeAll();
    if (team.status === constants.team.application.approved)
        ((await client.channels.cache.get(constants.teamRequestChannelId)) as TextChannel).messages.cache.get(team.request.post)?.react(constants.reactions.approved);
    else ((await client.channels.cache.get(constants.teamRequestChannelId)) as TextChannel).messages.cache.get(team.request.post)?.react(constants.reactions.denied);
    await (client.channels.cache.get(constants.teamRequestChannelId) as TextChannel).messages.cache
        .get(team.request.post)
        ?.reply(`Team "${team.name} (${team.abbr})" was ${team.status} by ${by.toString()}`);
}

export default {
    approve: async (client: DiscordClient, teamId: ObjectId, by: User) => {
        await db(async (tables: IDb) => {
            const requested_data = await tables.teams.findOne({ _id: teamId });
            if (!requested_data) return;
            await tables.teams.updateOne(
                { _id: teamId },
                {
                    $set: {
                        status: constants.team.application.approved,
                        name: requested_data.request.name,
                        abbr: requested_data.request.abbr,
                        managers: requested_data.request.managers,
                        captains: requested_data.request.captains,
                        players: requested_data.request.players
                    },
                    $currentDate: { lastModified: true }
                }
            );
            const team = await tables.teams.findOne({ _id: teamId });
            if (!team) return;
            await changeChannels(client, team, by);
        });
    },
    deny: async (client: DiscordClient, teamId: ObjectId, by: User) => {
        await db(async (tables: IDb) => {
            const requested_data = await tables.teams.findOne({ _id: teamId });
            if (!requested_data) return;
            await tables.teams.updateOne(
                { _id: teamId },
                {
                    $set: {
                        status: constants.team.application.denied,
                        name: requested_data.request.name,
                        abbr: requested_data.request.abbr,
                        managers: requested_data.request.managers,
                        captains: requested_data.request.captains,
                        players: requested_data.request.players
                    },
                    $currentDate: { lastModified: true }
                }
            );
            const team = await tables.teams.findOne({ _id: teamId });
            if (!team) return;
            await changeChannels(client, team, by);
        });
    }
};
