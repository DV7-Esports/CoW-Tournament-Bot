import { ObjectId } from 'mongodb';

import Player from './Player';
import TeamRequest from './TeamRequest';

export default class Team {
    constructor(
        public creator: string,
        public name: string | null,
        public abbr: string | null,
        public managers: Array<string>,
        public captains: Array<string>,
        public players: Array<Player>,
        public request: TeamRequest,
        public status: string,
        public voice_channel: string,
        public roster_channel: string,
        public role: string,
        public _id?: ObjectId
    ) {}
}
