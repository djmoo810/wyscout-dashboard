import { searchApi } from './api'

let leagueId = '';
let teamName = '';
let allRankingsData: { [teamName: string]: RankingData[] } = {};

// Define sets of stats that should be ranked in reverse order (higher values = worse)
const REVERSED_RANK_STATS = new Set([
    'conceded_goals',
    'xg_against',
    'shots_opp_avg',
    'losses',
    'ppda',
    'fouls',
    'yellow_cards',
    'red_cards',
    'corners_opp_avg'
]);

export function setLeagueId(id: string) {
    leagueId = id;
}

export function setTeamName(name: string) {
    teamName = name;
}

export interface RankingData {
    category: string;
    subcategory: string;
    type: string;
    rank: number;
    value: number;
}

interface TeamRankingResponse {
    name: string;
    value: number;
    id: number;
    players_used?: number;
    logo?: string;
    rank?: number;
    xpoints?: number;
}

async function getTotalRankingByType(type: string, category: string, subcategory: string, defending: boolean = false): Promise<{ [teamName: string]: RankingData }> {
    const params = {
        app_name: 'rankings',
        language: 'en',
        age_min: '16',
        age_max: '45',
        round: 'null',
        es5: 'true',
        token: searchApi.defaults.headers.common['x-wyscout-access-token'],
        groupId: '1233520',
        subgroupId: '288646'
    };

    const response = await searchApi.get(`team_rankings/${leagueId}/${type}.json`, { params });

    if (!response.data || typeof response.data !== 'object') {
        throw new Error(`Invalid response data for ${type}`);
    }

    const teams: TeamRankingResponse[] = response.data.results || [];

    if (teams.length === 0) {
        throw new Error(`No team data found for ${type}`);
    }

    // Special handling for expected points
    if (type === 'overview') {
        const teamsWithXPoints = teams.map(team => ({
            ...team,
            value: team.xpoints || 0
        }));

        // Sort by xpoints (higher is better)
        const sortedTeams = [...teamsWithXPoints].sort((a, b) => b.value - a.value);

        const teamRankings: { [teamName: string]: RankingData } = {};
        sortedTeams.forEach((team, idx) => {
            teamRankings[team.name] = {
                category,
                subcategory,
                type,
                rank: idx + 1,
                value: team.value
            };
        });

        return teamRankings;
    }

    // Normal ranking logic for other stats
    const sortedTeams = [...teams].sort((a, b) => {
        if (REVERSED_RANK_STATS.has(type)) {
            return a.value - b.value; // Lower values are better
        }
        return b.value - a.value; // Higher values are better
    });

    const teamRankings: { [teamName: string]: RankingData } = {};

    sortedTeams.forEach((team, idx) => {
        teamRankings[team.name] = {
            category,
            subcategory,
            type,
            rank: idx + 1,
            value: team.value || 0
        };
    });

    return teamRankings;
}

async function getAvgRankingByType(type: string, entity: string, category: string, subcategory: string, defending: boolean = false): Promise<{ [teamName: string]: RankingData }> {
    const params = {
        app_name: 'rankings',
        language: 'en',
        age_min: '16',
        age_max: '45',
        round: 'null',
        es5: 'true',
        token: searchApi.defaults.headers.common['x-wyscout-access-token'],
        groupId: '1233520',
        subgroupId: '288646'
    };

    const response = await searchApi.get(`team_rankings/${leagueId}/${entity}/${type}.json`, { params });

    if (!response.data || typeof response.data !== 'object') {
        throw new Error(`Invalid response data for ${type}`);
    }

    const teams: TeamRankingResponse[] = response.data.results || [];

    if (teams.length === 0) {
        throw new Error(`No team data found for ${type}`);
    }

    // Sort teams by value
    const fullType = `${type}${entity === 'opp/avg' ? '_opp_avg' : ''}`;
    const sortedTeams = [...teams].sort((a, b) => {
        if (REVERSED_RANK_STATS.has(fullType)) {
            return a.value - b.value; // Lower values are better
        }
        return b.value - a.value; // Higher values are better
    });

    const teamRankings: { [teamName: string]: RankingData } = {};

    sortedTeams.forEach((team, idx) => {
        teamRankings[team.name] = {
            category,
            subcategory,
            type,
            rank: idx + 1,
            value: team.value || 0
        };
    });

    return teamRankings;
}

export async function fetchAllRankings(): Promise<void> {
    if (!leagueId) {
        throw new Error('League ID must be set before fetching rankings');
    }

    allRankingsData = {};

    // Define all ranking requests
    const allRequests = [
        // Construction stats
        getTotalRankingByType('possession', 'Construction', 'Possession'),
        getAvgRankingByType('passes', 'avg', 'Construction', 'Passes'),
        getAvgRankingByType('passes', 'accuracy', 'Construction', '% accurate'),
        getAvgRankingByType('through_passes', 'avg', 'Construction', 'Through passes'),
        getAvgRankingByType('through_passes', 'accuracy', 'Construction', '% accurate'),
        getAvgRankingByType('key_passes', 'avg', 'Construction', 'Key passes'),
        getAvgRankingByType('long_passes', 'avg', 'Construction', 'Long passes'),
        getAvgRankingByType('long_passes', 'accuracy', 'Construction', '% accurate'),
        getAvgRankingByType('pass_to_final_third', 'avg', 'Construction', 'To final 3rd'),
        getAvgRankingByType('pass_to_final_third', 'accuracy', 'Construction', '% accurate'),
        getTotalRankingByType('speed_of_accurate_passes', 'Construction', 'Passing rate'),
        getAvgRankingByType('smart_passes', 'avg', 'Construction', 'Smart'),
        getAvgRankingByType('smart_passes', 'accuracy', 'Construction', '% accurate'),
        getAvgRankingByType('progressive_pass', 'avg', 'Construction', 'Progressive'),
        getAvgRankingByType('progressive_pass', 'accuracy', 'Construction', '% accurate'),
        getAvgRankingByType('progressive_run', 'avg', 'Construction', 'Progressive runs'),
        getAvgRankingByType('deep_completed_pass', 'avg', 'Construction', 'Deep completions'),
        getTotalRankingByType('ppda_opp', 'Construction', 'PPDA against'),

        // Attack stats
        getTotalRankingByType('goals', 'Attack', 'Goals'),
        getTotalRankingByType('xg', 'Attack', 'XG'),
        getAvgRankingByType('shots', 'avg', 'Attack', 'Shots'),
        getAvgRankingByType('shots', 'accuracy', 'Attack', '% on target'),
        getAvgRankingByType('crosses', 'avg', 'Attack', 'Crosses'),
        getAvgRankingByType('crosses', 'accuracy', 'Attack', '% accurate'),
        getAvgRankingByType('dribbles', 'avg', 'Attack', '1v1 dribbles'),
        getAvgRankingByType('dribbles', 'accuracy', 'Attack', 'Dribbles success%'),
        getAvgRankingByType('touch_in_box', 'avg', 'Attack', 'Touches in box'),
        getAvgRankingByType('foul_suffered', 'avg', 'Attack', 'Fouls suffered'),
        getAvgRankingByType('offsides', 'avg', 'Attack', 'Offsides'),
        getAvgRankingByType('corners', 'avg', 'Attack', 'Corners'),
        getTotalRankingByType('penalties', 'Attack', 'Penos'),

        // Defence stats
        getTotalRankingByType('conceded_goals', 'Defence', 'Goals against', true),
        getTotalRankingByType('xg_against', 'Defence', 'XGA', true),
        getAvgRankingByType('shots', 'opp/avg', 'Defence', 'Shots against', true),
        getAvgRankingByType('defensive_duels', 'avg', 'Defence', 'Defensive Duels'),
        getAvgRankingByType('defensive_duels', 'accuracy', 'Defence', '% success'),
        getAvgRankingByType('interceptions', 'avg', 'Defence', 'Interceptions'),
        getAvgRankingByType('aerial_duels', 'avg', 'Defence', 'Aerial Duels'),
        getAvgRankingByType('aerial_duels', 'accuracy', 'Defence', 'AD Success %'),
        getAvgRankingByType('losses', 'avg', 'Defence', 'Ball losses', true),
        getTotalRankingByType('challenges_intensity', 'Defence', 'Challenge Intensity'),
        getTotalRankingByType('ppda', 'Defence', 'PPDA', true),
        getAvgRankingByType('fouls', 'avg', 'Defence', 'Fouls', true),
        getTotalRankingByType('yellow_cards', 'Defence', 'Yellow Cards', true),
        getTotalRankingByType('red_cards', 'Defence', 'Red Cards', true),
        getAvgRankingByType('corners', 'opp/avg', 'Defence', 'Corners against', true),

        // General stats
        getTotalRankingByType('age', 'General', 'Age'),
        getTotalRankingByType('overview', 'General', 'Expected points'),
        getTotalRankingByType('substitution', 'General', 'Subs made', true)
    ];

    // Run all requests in parallel
    const allStats = await Promise.all(allRequests);

    // Process results
    const allTeams = new Set<string>();
    allStats.forEach(statMap => {
        Object.keys(statMap).forEach(team => allTeams.add(team));
    });

    allTeams.forEach(team => {
        allRankingsData[team] = [];
        allStats.forEach(statMap => {
            if (statMap[team]) {
                allRankingsData[team].push(statMap[team]);
            }
        });
    });
}

export function getRankings(): RankingData[] {
    if (!teamName || !allRankingsData[teamName]) {
        throw new Error('Team name must be set and rankings must be fetched before getting rankings');
    }

    return allRankingsData[teamName];
} 