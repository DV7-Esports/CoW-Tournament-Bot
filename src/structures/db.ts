import { Collection, MongoClient } from 'mongodb';

import IDb from './IDb';
import Match from './Match';
import Team from './Team';

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.otbfq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

export default async (callback: (tables: IDb) => any) => {
    try {
        await client.connect();

        const teams: Collection<Team> = client.db('cow_cup').collection('teams');
        const players: Collection<Document> = client.db('cow_cup').collection('players'); // 
        const player_stats: Collection<Document> = client.db('cow_cup').collection('player_stats'); // 
        const matches: Collection<Match> = client.db('cow_cup').collection('matches'); // the schedule
        const match_stats: Collection<Document> = client.db('cow_cup').collection('match_stats'); // the outcome of the matches

        const result = await callback({
            client: client,
            teams: teams,
            players: players,
            player_stats: player_stats,
            matches: matches,
            match_stats: match_stats
        } as IDb);

        return result;
    } catch (e) {
        console.error(e);
    }
};
