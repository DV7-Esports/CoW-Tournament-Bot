import { Collection, GuildMember, Message, TextChannel } from "discord.js";
import db from "../structures/db";
import Ign from "../structures/Ign";
import Player from "../structures/Player";
import { Region } from "../structures/Region";
import Team from "../structures/Team";
import TeamRequest from "../structures/TeamRequest";
import constants from "./constants";

function getDiscordIdByDiscordName(fetchedMemebers: Collection<string, GuildMember> | undefined, discordName: string): string {
    const memberId: string | undefined = fetchedMemebers?.find(member => member.user.username === discordName.split('#')[0] &&
                                            member.user.discriminator === discordName.split('#')[1])?.id;
    if (!memberId) {
        return discordName;
    } else {
        return memberId as string;
    }
}

function mentionOrList(discordUser: string): string {
    if (discordUser.indexOf('#') === -1) {
        return discordUser;
    } else {
        return `<@${discordUser}>`;
    }
}

async function rosterGenerator(team: Team, request?: boolean, validator?: boolean): Promise<string> {
    let roster = '';

    if (validator === true || validator === undefined) roster = `<@&${constants.accountValidatorRoleId}>\n`;

    let teamToPrint: any;
    if (request === true || request === undefined) teamToPrint = team.request;
                                              else teamToPrint = team;
    teamToPrint.requestor = team.request.requestor;

    teamToPrint.manager = teamToPrint.managers.map((x: string) => `${mentionOrList(x)}`).join(' ');
    teamToPrint.captain = teamToPrint.captains.map((x: string) => `${mentionOrList(x)}`).join(' ');

    roster = roster + `Team ${teamToPrint.name} (${teamToPrint.abbr})`;

    if (validator === true || validator === undefined) roster = roster + ` _applied to join the tournament_`;

    roster = roster + `\n\`\`Team managers:\`\` ${teamToPrint.manager}`
                    + `\n\`\`Team captains:\`\` ${teamToPrint.captain}\n`;

    teamToPrint.players.forEach((player: Player) => {
        roster = roster + `\`\`       Player:\`\` ${mentionOrList(player.user)}\n`;
        player.igns.forEach((x: Ign) => {
            roster = roster + `\`\`              \`\` <https://www.leagueofgraphs.com/summoner/${x.region.toLowerCase()}/${encodeURIComponent(x.summoner)}>\n`;
        });
    });

    roster = roster + `\n_Team was initiated by <@!${teamToPrint.requestor}>._`;

    return roster;
}

function getRegionByName (regionName: string): Region {
    const regions: string[] = Object.keys(Region).filter((item) => {
        return isNaN(Number(item));
    });
    if (regions.includes(regionName)) {
        return regionName as Region;
    }
    else {
        return Region.INVALID;
    }
}

async function generateTeam(reply: Message, args : string[]): Promise<Team> {
    let fetchedMemebers = await reply.guild?.members.fetch();
    let name: string, abbrev: string, color: string, managers: string[], captains: string[], members: Player[];
    name = args[0];
    abbrev = args[1];
    color = args[2];
    managers = [getDiscordIdByDiscordName(fetchedMemebers, args[3])];
    captains = [getDiscordIdByDiscordName(fetchedMemebers, args[4])];
    
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
        const userId: string = getDiscordIdByDiscordName(fetchedMemebers, users['user']);
        const igns: Ign[] = users['igns']
            .split(',')
            .map(x => x.trim())
            .map(ign => {
                let accountInfo: Ign = {
                    summoner: ign.split('#')[0],
                    region: getRegionByName(ign.split('#')[1].toUpperCase())
                } as Ign;

                if (accountInfo.region === Region.INVALID) {
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