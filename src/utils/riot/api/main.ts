import Mutex = require('ts-mutex');
import getData from './requests';

class RiotApi {
    private static instance: RiotApi;
    private tournamentRealmProviderId: number;
    private tournamentRealmId: number;
    private tournamentCodes: string[];

    private lockTournamentCodesGenerator = new Mutex();
    
    private constructor() {
        if (!this.tournamentRealmProviderId)
            this.getTournamentProvider();
        if (!this.tournamentRealmId)
            this.getTournamentRealm();
    }

    private getTournamentProvider() {
        const body = {"region": "EUW", "url": "https://tournament-realm-bot.herokuapp.com/tournament/match/record"};
        this.tournamentRealmProviderId = parseInt(getData('/lol/tournament-stub/v4/providers', 'POST', body));
    }

    private getTournamentRealm() {
        const body = {"name": "Tournament Realm", "providerId": this.tournamentRealmProviderId};
        this.tournamentRealmId = parseInt(getData('/lol/tournament-stub/v4/tournaments', 'POST', body));
    }

    private async getTournamentCodes() {
        if (this.lockTournamentCodesGenerator.locked) { // Currently generating 1000 tournament codes
            await this.lockTournamentCodesGenerator.use(() => {}); // wait for the generation
        } else {
            await this.lockTournamentCodesGenerator.use(() => {
                const body = {"mapType": "SUMMONERS_RIFT", "pickType": "TOURNAMENT_DRAFT", "spectatorType": "ALL", "teamSize": 5};
                this.tournamentCodes.concat(JSON.parse(
                    getData('/lol/tournament-stub/v4/codes?count=1000&tournamentId=' + this.tournamentRealmId, 
                            'POST', 
                            body
                        )
                ));
            });
        }
    }

    public getMatchData(match_id: string) {
        return getData('/lol/match/v5/matches/' + match_id, 'GET');
    }

    public static getInstance(): RiotApi {
        if (!RiotApi.instance) {
            RiotApi.instance = new RiotApi();
        }

        return RiotApi.instance;
    }

    public async extractTournamentCode(): Promise<string> {
        if (this.tournamentCodes.length === 0) {
            await this.getTournamentCodes();
        }
        return this.tournamentCodes.pop() as string;
    }
}

export default RiotApi;