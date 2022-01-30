import { User } from 'discord.js';

import Ign from './Ign';

export default abstract class Player {
    user: string;
    igns: Ign[];
}
