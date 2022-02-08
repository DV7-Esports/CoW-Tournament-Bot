import Player from './Player';

export default class TeamRequest {
    constructor(
        public post: string,
        public name: string,
        public abbr: string,
        public managers: Array<string>,
        public captains: Array<string>,
        public players: Array<Player>,
        public requestor: string,
        public validator: string | null,
        public command: string | null
    ) {}
}
