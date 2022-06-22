import { Router } from "express";
import RiotApi from "../../../utils/riot/api/main";
import db from '../../../structures/db';
import Match from "../../../structures/Match";

export const tournament = Router();

tournament.post('/match/record', (request, response) => {
    const params: any = request.params;
    const matchId = params['region'] + '_' + params['gameId'];
    try {
        const matchData: any = JSON.parse(RiotApi.getInstance().getMatchData(matchId));
        db(async (tables) => {
            await tables.match_stats.insertOne(matchData);
            await tables.matches.findOneAndUpdate(   
                { "tournamentCode" : params['code'] },
                { $set: { "finished" : true } }
            );
        });
    } catch (e: any) {
        response.sendStatus(404);
    }
    response.send('Tournament code record saved.');
});

tournament.get('/schedule', (request, response) => {
    const params: any = request.params;
    try {
        let matches: Match[] = [];
        db(async (tables) => {
            matches = await tables.matches.find( { 'finished': false } ).toArray();
        });
        response.json(matches);
    } catch (e: any) {
        response.sendStatus(404);
    }
});
