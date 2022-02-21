import { Router } from "express";
import RiotApi from "../../../utils/riot/api/main";
import db from '../../../structures/db';

export const tournament = Router();

tournament.post('/match/record', (request, response) => {
    const params: any = request.params;
    const matchId = params['region'] + '_' + params['gameId'];
    try {
        const matchData: any = JSON.parse(RiotApi.getInstance().getMatchData(matchId));
        db((tables) => {
            tables.matches.insertOne(matchData);
        });
    } catch (e: any) {
        response.sendStatus(404);
    }
    response.send('Tournament code record saved.');
});
