import { Message, TextChannel } from "discord.js";
import client from "../client";
import db from "../structures/db";
import DiscordClient from "../structures/DiscordClient";
import Ign from "../structures/Ign";
import Player from "../structures/Player";
import { Region } from "../structures/Region";
import Team from "../structures/Team";
import TeamRequest from "../structures/TeamRequest";
import constants from "./constants";

async function rosterGenerator(team: Team, request?: boolean, validator?: boolean) {
    let roster = '';

    if (validator === true || validator === undefined) roster = `<@&${constants.accountValidatorRoleId}>\n`;

    let teamToPrint: any;
    if (request === true || request === undefined) teamToPrint = team.request;
                                              else teamToPrint = team;
    teamToPrint.requestor = team.request.requestor;

    teamToPrint.manager = teamToPrint.managers.map((x: string) => `<@${x}>`).join(' ');
    teamToPrint.captain = teamToPrint.captains.map((x: string) => `<@${x}>`).join(' ');

    roster = roster + `Team ${teamToPrint.name} (${teamToPrint.abbr})`;

    if (validator === true || validator === undefined) roster = roster + ` _applied to join the tournament_`;

    roster = roster + `\n\`\`Team managers:\`\` ${teamToPrint.manager}`
                    + `\n\`\`Team captains:\`\` ${teamToPrint.captain}\n`;

    teamToPrint.players.forEach((player: Player) => {
        roster = roster + `\`\`       Player:\`\` <@${player.user}>\n`;
        player.igns.forEach((x: Ign) => {
            roster = roster + `\`\`              \`\` <https://www.leagueofgraphs.com/summoner/${x.region.toLowerCase()}/${encodeURIComponent(x.summoner)}>\n`;
        });
    });

    roster = roster + `\n_Team was initiated by <@!${teamToPrint.requestor}>._`;

    return roster;
}

async function generateTeam(reply: Message, args : string[]): Promise<Team> {
    let fetchedMemebers = await reply.guild?.members.fetch();
    let name: string, abbrev: string, color: string, managers: string[], captains: string[], members: Player[];
    name = args[0];
    abbrev = args[1];
    color = args[2];
    managers = [fetchedMemebers?.find(member => member.user.username === args[3].split('#')[0] &&
                                        member.user.discriminator === args[3].split('#')[1])?.id as string];
    captains = [fetchedMemebers?.find(member => member.user.username === args[4].split('#')[0] &&
                                        member.user.discriminator === args[4].split('#')[1])?.id as string];
    
    let warningMessage = '';
    members = args.slice(5).reduce((array, value, index) => {
        if (index % 2 === 0) {
            array.push({
                'user': value,
                'igns': undefined
            } as any);
        }
        else {
            array[array.length - 1]['igns'] = value;
        }
        return array;
    }, [] as {'user': string, 'igns': string}[]).map(users => {
        const userId: string = fetchedMemebers?.find(member => member.user.username === users['user'].split('#')[0] &&
                                                        member.user.discriminator === users['user'].split('#')[1])?.id as string;
        const igns: Ign[] = users['igns']
            .split(',')
            .map(x => x.trim())
            .map(ign => {
                let accountInfo: Ign = {
                    summoner: ign.split('#')[0],
                    region: ign.split('#')[1].toUpperCase()
                } as Ign;

                if (!accountInfo.region) {
                    accountInfo.region = Region.INVALID;
                    warningMessage += `${accountInfo.summoner} **(${accountInfo.region})** is not from a valid region.\n`;
                }

                return accountInfo;
            });
        return {
            user: userId,
            igns: igns
        } as Player;
    });

    if (warningMessage.length !== 0) {
        warningMessage += `**The regions are ${constants.accountRegions.join(', ').toString()}.**`;
        throw warningMessage;
    }

    if (members.length < 5) {
        throw 'Your team is incomplete. You do not have enough (at least 5) players.';
    }

    if (abbrev.length >= 5) {
        throw 'Your team tag (abbreviature) is too long. Please, shorten it up to 4 symbols.';
    }

    const team: Team = new Team(
        '',
        name,
        abbrev,
        managers,
        captains,
        members,
        {
            post: '',
            name: name,
            abbr: abbrev,
            managers: managers,
            captains: captains,
            players: members,
            requestor: '',
            params: args
        } as TeamRequest,
        constants.team.application.pending,
        '',
        '',
        ''
    );

    return team;
}

async function updateTeam(reply: Message, team: Team, updatedTeam: Team) {
    // Update team name
    // - DB
    await db(async (tables) => {
        await tables.teams.updateOne({_id: team._id}, {'$set': {
            'request.name': updatedTeam.name,
            'request.abbr': updatedTeam.abbr,
            'request.managers': updatedTeam.managers,
            'request.captains': updatedTeam.captains,
            'request.players': updatedTeam.players,
            'request.params': updatedTeam.request.params,
            'status': constants.team.application.pending
        }});
        team = await tables.teams.findOne({_id: team._id}) as Team;
    });
    // - Channel names
    await reply.client.guilds.cache.get(constants.guild)?.channels.cache.get(team.voice_channel)?.setName(constants.voice.pending + updatedTeam.name);
    // - Role names
    await reply.client.guilds.cache.get(constants.guild)?.roles.cache.get(team.role)?.setName(updatedTeam.name as string);

    // Update the request
    // - Edit old request
    await (reply.client.guilds.cache.get(constants.guild)?.channels.cache.get(constants.teamRequestChannelId) as TextChannel).messages.cache.get(team.request.post)?.edit(`_New request available for Team <@&${team.role}>._`);
    await (reply.client.guilds.cache.get(constants.guild)?.channels.cache.get(constants.teamRequestChannelId) as TextChannel).messages.cache.get(team.request.post)?.reactions.removeAll();
    // - Create new request
    const request = await (reply.client.guilds.cache.get(constants.guild)?.channels.cache.get(constants.teamRequestChannelId) as TextChannel).send(
        await rosterGenerator(team)
    );
    // - Set reaction votes
    await request.react(constants.reactions.approved);
    await request.react(constants.reactions.denied);
    // - DB
    await db(async (tables) => {
        await tables.teams.updateOne({_id: team._id}, {'$set': {
            'request.post': request.id
        }});
    });
}

export default {
    'rosterGenerator': rosterGenerator,
    'generateTeam': generateTeam,
    'updateTeam': updateTeam,
};