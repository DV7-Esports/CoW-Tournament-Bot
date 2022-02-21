import { IntentsString, Message, PartialMessage, Role, User } from 'discord.js';

import DiscordClient from './structures/DiscordClient';

const intents: IntentsString[] = [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING'
];
const client = new DiscordClient(intents);

export default client;
