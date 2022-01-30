import { GuildMember, TextChannel } from 'discord.js';

import DiscordClient from '../structures/DiscordClient';
import Event from '../structures/Event';
import generateImage from '../utils/generateImage';

export default class GuildMemberAddEvent extends Event {
    private welcomeChannelId: string = '935093312711430174';

    constructor(client: DiscordClient) {
        super(client, 'guildMemberAdd');
    }

    async run(member: GuildMember) {
        const img = await generateImage(member);
        (this.client.channels.cache.get(this.welcomeChannelId) as TextChannel).send({
            content: `<@${member.id}> Welcome to the Tournament Realm!`,
            files: [img]
        });
    }
}
