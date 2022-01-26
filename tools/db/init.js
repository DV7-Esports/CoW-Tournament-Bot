const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.otbfq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = {
    'db': async (callback) => {
        await client.connect(err => {
            const teams = client.db("cow_cup").collection("teams");
            const players = client.db("cow_cup").collection("players");
            const player_stats = client.db("cow_cup").collection("player_stats");
            const matches = client.db("cow_cup").collection("matches");
            
            callback({client, teams, players, player_stats, matches});
            
            client.close();
        });
    }
};