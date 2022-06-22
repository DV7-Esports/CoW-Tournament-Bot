import { ObjectId } from 'mongodb';

export default class Match {
    constructor(
        public tournamentCode: string,
        public tournament: string,
        public stage: string,
        public team1: string,
        public team2: string,
        public date: Date,
        public finished: boolean,
        public _id?: ObjectId
    ) {}
}
