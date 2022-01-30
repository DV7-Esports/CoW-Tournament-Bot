import { Collection, MongoClient } from 'mongodb';

import Team from './Team';

export default interface IDb {
    client: MongoClient;
    teams: Collection<Team>;
    players: Collection<Document>;
    player_stats: Collection<Document>;
    matches: Collection<Document>;
}
