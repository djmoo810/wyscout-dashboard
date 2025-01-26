import axios from 'axios'

const api = axios.create({
    baseURL: 'https://rest.wyscout.com/v1',
})

export const searchApi = axios.create({
    baseURL: 'https://searchapi.wyscout.com/api/v1',
})

interface TeamStats {
    possession: { rank: number; perGame: number }
    passes: { rank: number; perGame: number }
    passAccuracy: { rank: number; perGame: number }
    throughPasses: { rank: number; perGame: number }
    keyPasses: { rank: number; perGame: number }
    smartPasses: { rank: number; perGame: number }
}

interface PlayerRankingResponse {
    name: string
    age: number
    image: string
    birthCountryCode: string
    birthCountryName: string
    value: number
    club: string
    passportCountryCodes: string[]
    passportCountryNames: string[]
    assists: number
    foot: string
    goals: number
    goalsAndAssists: number
    goalsTagged: number
    height: number
    marketValue: number
    minutesOnField: number
    playerId: number
    positions: string[]
    positionPercents: { position: string; percent: number }[]
    totalMatches: number
    weight: number
    player: {
        fullName: string
        currentTeam: {
            logoUrl: string
        }
    }
    teams: {
        name: string
        logoUrl: string
        readableColor: string
    }[]
}

// Constants from Java code
const GROUP_ID = '1233520'
const SUBGROUP_ID = '288646'
const LANGUAGE = 'en'
const VENUE = 'home,away'
const SCORE = 'winning,draw,losing'
const AGE_MIN = '16'
const AGE_MAX = '45'

// These values need to be set before using the rankings functions
let leagueId = ''
let teamName = ''

export function setLeagueId(id: string) {
    leagueId = id
}

export function setTeamName(name: string) {
    teamName = name
}

// Column definitions from Java code
const GENERAL_COLUMNS = 'minutesOnField,goal,xgShot,shot,shotSuccess,shotSuccessPercentage,pass,passSuccess,passSuccessPercentage,possession,loss,lossLow,lossMedium,lossHigh,recovery,recoveryLow,recoveryMedium,recoveryHigh,duel,duelSuccess,duelSuccessPercentage'
const INDEXES_COLUMNS = 'minutesOnField,passesPerPossessionMinute,passesPerPossessionCount,longPassPercentage,ppda,averageShotDistance,averagePassLength'
const ATTACKING_COLUMNS = 'name,team,minutesOnField,goal,xgShot,shot,shotSuccess,shotSuccessPercentage,pass,passSuccess,passSuccessPercentage,possession,loss,lossLow,lossMedium,lossHigh,recovery,recoveryLow,recoveryMedium,recoveryHigh,duel,duelSuccess,duelSuccessPercentage,shotFromOutsideArea,shotFromOutsideAreaSuccess,shotFromOutsideAreaSuccessPercentage,positionalAttacks,positionalAttacksWithShot,positionalAttacksWithShotPercentage,counterattacks,counterattacksWithShot,counterattacksWithShotPercentage,setPieces,setPiecesWithShot,setPiecesWithShotPercentage,corner,cornerWithShot,cornerWithShotPercentage,freeKick,shotAfterFreeKick,shotAfterFreeKickPercentage,penalty,penaltyGoal,penaltyGoalPercentage,cross,crossSuccess,crossSuccessPercentage,deepCompletedCross,deepCompletedPass,ballDeliveryToPenaltyArea,controlledPenaltyAreaEntry,crossToPenaltyArea,touchInBox,offensiveDuel,offensiveDuelSuccess,offensiveDuelSuccessPercentage,offside,concededGoal,shotAgainst,shotAgainstSuccess,shotAgainstSuccessPercentage,defensiveDuel,defensiveDuelSuccess,defensiveDuelSuccessPercentage,aerialDuel,aerialDuelSuccess,aerialDuelSuccessPercentage,tackle,tackleSuccess,tackleSuccessPercentage,interception,clearance,foul,yellowCard,redCard,forwardPass,forwardPassSuccess,forwardPassSuccessPercentage,backPass,backPassSuccess,backPassSuccessPercentage,verticalPass,verticalPassSuccess,verticalPassSuccessPercentage,longPass,longPassSuccess,longPassSuccessPercentage,passToFinalThird,passToFinalThirdSuccess,passToFinalThirdSuccessPercentage,progressivePass,progressivePassSuccess,progressivePassSuccessPercentage,smartPass,smartPassSuccess,smartPassSuccessPercentage,throwIn,throwInSuccess,throwInSuccessPercentage,goalKick,passesPerPossessionMinute,passesPerPossessionCount,longPassPercentage,averageShotDistance,averagePassLength,ppda'

type ColumnType = 'General' | 'Indexes' | 'Attacking'

// Constants for storage
const TOKEN_STORAGE_KEY = 'wyscout_token'
const CACHE_PREFIX = 'wyscout_cache_'
const CACHE_EXPIRY_HOURS = 24

// Separate functions for token storage since it's just a string
function setTokenWithExpiry(token: string) {
    const now = new Date()
    const item = {
        token,
        expiry: now.getTime() + CACHE_EXPIRY_HOURS * 60 * 60 * 1000,
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(item))
}

function getStoredToken(): string | null {
    const itemStr = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!itemStr) return null

    try {
        const item = JSON.parse(itemStr)
        const now = new Date()

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(TOKEN_STORAGE_KEY)
            return null
        }
        return item.token
    } catch (e) {
        // If there's any error parsing, remove the invalid token
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        return null
    }
}

// Cache functions for response data
function setStorageWithExpiry(key: string, value: any, expiryHours: number) {
    const now = new Date()
    const item = {
        value,
        expiry: now.getTime() + expiryHours * 60 * 60 * 1000,
    }
    localStorage.setItem(key, JSON.stringify(item))
}

function getStorageWithExpiry(key: string) {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null

    try {
        const item = JSON.parse(itemStr)
        const now = new Date()

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key)
            return null
        }
        return item.value
    } catch (e) {
        // If there's any error parsing, remove the invalid data
        localStorage.removeItem(key)
        return null
    }
}

export function setAuthToken(token: string) {
    api.defaults.headers.common['x-wyscout-access-token'] = token
    searchApi.defaults.headers.common['x-wyscout-access-token'] = token
    setTokenWithExpiry(token)
}

// Try to restore token on startup
const storedToken = getStoredToken()
if (storedToken) {
    setAuthToken(storedToken)
}

export function openWyscoutLogin(): Window | null {
    const win = window.open('https://wyscout.hudl.com/', 'wyscout_login', 'width=800,height=600')
    if (!win) {
        return null
    }

    // Poll for URL changes to detect successful login
    const pollInterval = setInterval(() => {
        try {
            const currentUrl = win.location.href

            // If we're redirected to the app page, we're logged in
            if (currentUrl.includes('/app/')) {
                clearInterval(pollInterval)

                // Try to get the token through the API
                axios.get('https://rest.wyscout.com/v1/token', {
                    withCredentials: true,
                    headers: {
                        'Origin': 'https://wyscout.hudl.com',
                        'Referer': 'https://wyscout.hudl.com/'
                    }
                }).then(response => {
                    const token = response.headers['x-wyscout-access-token']
                    if (token) {
                        window.postMessage({ type: 'WYSCOUT_TOKEN', token }, '*')
                        win.close()
                    }
                })
            }
        } catch (e) {
            // Ignore CORS errors from trying to access win.location
        }
    }, 1000)

    // Clean up interval if window is closed
    const checkClosed = setInterval(() => {
        if (win.closed) {
            clearInterval(pollInterval)
            clearInterval(checkClosed)
        }
    }, 1000)

    return win
}

export async function fetchTeamStats(
    teamId: string,
    columnType: ColumnType = 'General'
): Promise<TeamStats> {
    // Generate cache key based on parameters
    const cacheKey = CACHE_PREFIX + `team_stats_${teamId}_${columnType}`

    // Check cache first
    const cachedData = getStorageWithExpiry(cacheKey)
    if (cachedData) {
        return cachedData
    }

    const params = {
        language: LANGUAGE,
        token: api.defaults.headers.common['x-wyscout-access-token'],
        groupId: GROUP_ID,
        subgroupId: SUBGROUP_ID,
        venue: VENUE,
        from: '2024-02-01',
        to: new Date().toISOString().split('T')[0],
        score: SCORE,
        columns: columnType === 'Indexes' ? INDEXES_COLUMNS :
            columnType === 'Attacking' ? ATTACKING_COLUMNS :
                GENERAL_COLUMNS
    }

    const response = await searchApi.get(`team_stats/teams/${teamId}/stats`, { params })

    // Only cache if we have data
    if (response.data?.matches?.[0]?.teamStats) {
        const stats = response.data.matches[0].teamStats
        const result = {
            possession: { rank: 0, perGame: stats.possession || 0 },
            passes: { rank: 0, perGame: stats.pass || 0 },
            passAccuracy: { rank: 0, perGame: stats.passSuccessPercentage || 0 },
            throughPasses: { rank: 0, perGame: stats.forwardPass || 0 },
            keyPasses: { rank: 0, perGame: stats.passToFinalThird || 0 },
            smartPasses: { rank: 0, perGame: stats.smartPass || 0 }
        }
        setStorageWithExpiry(cacheKey, result, CACHE_EXPIRY_HOURS)
        return result
    }

    throw new Error('No team stats data available')
}

// Types for player rankings
export type RankingType =
    | 'goals' | 'assists' | 'shots' | 'crosses' | 'dribbles'
    | 'touch_in_box' | 'foul_suffered' | 'passes' | 'through_passes'
    | 'key_passes' | 'pass_to_final_third' | 'smart_passes'
    | 'progressive_pass' | 'progressive_run' | 'defensive_duels'
    | 'defensive_duels_won' | 'interceptions' | 'aerial_duels'
    | 'aerial_duels_won' | 'fouls';

export interface PlayerRankingResult {
    rankingType: RankingType;
    players: PlayerRankingResponse[];
}

export async function fetchAllPlayerRankings(seasonIds: string[]): Promise<PlayerRankingResult[]> {
    const rankingTypes: RankingType[] = [
        'goals', 'assists', 'shots', 'crosses', 'dribbles',
        'touch_in_box', 'foul_suffered', 'passes', 'through_passes',
        'key_passes', 'pass_to_final_third', 'smart_passes',
        'progressive_pass', 'progressive_run', 'defensive_duels',
        'defensive_duels_won', 'interceptions', 'aerial_duels',
        'aerial_duels_won', 'fouls'
    ];

    // Generate cache key based on parameters
    const cacheKey = CACHE_PREFIX + `player_rankings_${seasonIds.join('_')}_all`;

    // Check cache first
    const cachedData = getStorageWithExpiry(cacheKey);
    if (cachedData) {
        return cachedData;
    }

    // Create request items for each ranking type
    const requests = rankingTypes.map(type => ({
        query: `
            query PlayersLeaderboard($seasonIds: [ID!]!, $age: AgeRangeInput, $searchParam: PlayerStatsEnum!, $language: String, $roundId: Int, $gameweek: Int) {
                playersLeaderboard(seasonIds: $seasonIds, age: $age, param: $searchParam, language: $language, limit: 30, roundId: $roundId, gameweek: $gameweek) {
                    name
                    age
                    image
                    birthCountryCode
                    birthCountryName
                    value
                    club
                    passportCountryCodes
                    passportCountryNames
                    assists
                    foot
                    goals
                    goalsAndAssists
                    goalsTagged
                    height
                    marketValue
                    minutesOnField
                    playerId
                    positions
                    positionPercents {
                        position
                        percent
                    }
                    totalMatches
                    weight
                    player {
                        fullName
                        currentTeam {
                            logoUrl
                        }
                    }
                    teams {
                        name
                        logoUrl
                        readableColor
                    }
                }
            }
        `,
        variables: {
            seasonIds,
            searchParam: type,
            language: 'en',
            age: { min: 16, max: 45 }
        },
        operationName: 'PlayersLeaderboard'
    }));

    const response = await searchApi.post('/graphql', requests);

    if (response.data) {
        const results = response.data.map((result: any, index: number) => ({
            rankingType: rankingTypes[index],
            players: result.data.playersLeaderboard
        }));

        // Cache the results
        setStorageWithExpiry(cacheKey, results, CACHE_EXPIRY_HOURS);
        return results;
    }

    throw new Error('No player rankings data available');
}

interface RankingData {
    category: string;
    type: string;
    rank: number;
    value: number;
}

async function getTotalRankingByType(type: string, defending: boolean = false): Promise<RankingData> {
    const params = {
        app_name: 'rankings',
        language: 'en',
        age_min: '16',
        age_max: '45',
        round: 'null',
        es5: 'true',
        token: api.defaults.headers.common['x-wyscout-access-token'],
        groupId: '1233520',
        subgroupId: '288646'
    };

    const response = await searchApi.get(`team_rankings/${leagueId}/${type}.json`, { params });
    const teamNames = response.data.map((team: any) => team.name);
    if (defending) {
        teamNames.reverse();
    }
    const index = teamNames.findIndex((name: string) => name === teamName) + 1;
    const teamData = response.data.find((team: any) => team.name === teamName);
    const value = teamData?.value || 0;

    return {
        category: defending ? 'Defending' : 'General',
        type,
        rank: index,
        value
    };
}

async function getAvgRankingByType(type: string, entity: string, defending: boolean = false): Promise<RankingData> {
    const params = {
        app_name: 'rankings',
        language: 'en',
        age_min: '16',
        age_max: '45',
        round: 'null',
        es5: 'true',
        token: api.defaults.headers.common['x-wyscout-access-token'],
        groupId: '1233520',
        subgroupId: '288646'
    };

    const response = await searchApi.get(`team_rankings/${leagueId}/${entity}/${type}.json`, { params });
    const teamNames = response.data.map((team: any) => team.name);
    if (defending) {
        teamNames.reverse();
    }
    const index = teamNames.findIndex((name: string) => name === teamName) + 1;
    const teamData = response.data.find((team: any) => team.name === teamName);
    const value = teamData?.value || 0;

    return {
        category: defending ? 'Defending' : entity === 'avg' ? 'Average' : 'Accuracy',
        type,
        rank: index,
        value
    };
}

export async function getRankings(): Promise<RankingData[]> {
    if (!leagueId || !teamName) {
        throw new Error('League ID and team name must be set before fetching rankings');
    }

    const rankings: RankingData[] = [];

    // General Stats
    rankings.push(await getTotalRankingByType('age'));
    rankings.push(await getTotalRankingByType('substitution', true));

    // Attacking Stats
    rankings.push(await getTotalRankingByType('goals'));
    rankings.push(await getTotalRankingByType('xg'));
    rankings.push(await getAvgRankingByType('shots', 'avg'));
    rankings.push(await getAvgRankingByType('shots', 'accuracy'));

    // Defending Stats
    rankings.push(await getTotalRankingByType('conceded_goals', true));
    rankings.push(await getTotalRankingByType('xg_against', true));
    rankings.push(await getAvgRankingByType('defensive_duels', 'avg'));
    rankings.push(await getAvgRankingByType('defensive_duels', 'accuracy'));

    // Construction Stats
    rankings.push(await getTotalRankingByType('possession'));
    rankings.push(await getAvgRankingByType('passes', 'avg'));
    rankings.push(await getAvgRankingByType('passes', 'accuracy'));
    rankings.push(await getAvgRankingByType('through_passes', 'avg'));

    return rankings;
} 