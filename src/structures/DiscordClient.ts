import { Client, IntentsString, WebSocketOptions } from 'discord.js';

import Registry from '../classes/Registry';
import { IConfig } from '../utils/interfaces';

export default class DiscordClient extends Client {
    /**
     * Registry of the client.
     */
    readonly registry: Registry;

    /**
     * Config of the client.
     */
    readonly config: IConfig;

    constructor(intents: IntentsString[]) {
        super({ partials: ['USER', 'REACTION', 'MESSAGE'], intents: intents, ws: { intents: intents } as WebSocketOptions });

        /**
         * Setting up client's config.
         */
        this.config = {
            token: process.env.TOKEN as string,
            prefix: process.env.PREFIX as string,
            developers: JSON.parse(process.env.DEVELOPERS as string) as string[],
            unknownErrorMessage: JSON.parse(process.env.UNKNOWN_COMMAND_ERROR as string)
        };

        /**
         * Creating new registry class.
         */
        this.registry = new Registry(this);

        /**
         * Registering events and commands.
         */
        this.registry.registerAll();
    }
}
