import { IntentsString, Message, PartialMessage, Role, User } from 'discord.js';
import { ObjectId } from 'mongodb';

import db from './structures/db';
import DiscordClient from './structures/DiscordClient';
import IDb from './structures/IDb';
import Team from './structures/Team';
import constants from './utils/constants';
import teamSetup from './utils/teamCheck';

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
