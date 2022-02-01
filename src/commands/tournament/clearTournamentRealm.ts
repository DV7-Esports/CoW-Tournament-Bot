import { Message, TextChannel } from 'discord.js';

import client from '../../client';
import Command from '../../structures/Command';
import db from '../../structures/db';
import DiscordClient from '../../structures/DiscordClient';
import IDb from '../../structures/IDb';
import Team from '../../structures/Team';
import constants from '../../utils/constants';

export default class clearRealm extends Command {
    constructor(client: DiscordClient) {
        super(client, {
            name: 'clearRealm',
            group: 'Tournament',
            enabled: true,
            onlyNsfw: false,
            description: 'Clears the data base and the channels.',
            cooldown: 30,
            require: {
                developer: true
            }
        });
    }

    async run(message: Message) {
        await db(async (tables: IDb) => {
            (await tables.teams.find().toArray()).forEach(async (team: Team) => {
                await client.channels.cache.get(team.roster_channel)?.delete();
                await client.channels.cache.get(team.voice_channel)?.delete();
                await message.guild?.roles.cache.get(team.role)?.delete();
                team.request.captains.forEach(async (captain) => {
                    ((await client.guilds.cache.get(constants.guild))?.members.cache.get(captain))?.roles.remove(constants.roles.teamCaptain);
                });
                team.request.managers.forEach(async (manager) => {
                    ((await client.guilds.cache.get(constants.guild))?.members.cache.get(manager))?.roles.remove(constants.roles.teamManager);
                });
            });
            await tables.teams.deleteMany({});
            ((await client.channels.cache.get(constants.teamRequestChannelId)) as TextChannel).bulkDelete(100, true);
        });
    }
}
