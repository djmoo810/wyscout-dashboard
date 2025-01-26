import React, { useState } from 'react'
import {
    Box,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material'
import { setTeamName, getRankings, RankingData } from '../services/rankings'

// Define Teams enum based on Java code
export enum Teams {
    BohemianFC = "Bohemians",
    DerryCity = "Derry City",
    DroghedaUnited = "Drogheda United",
    GalwayUnited = "Galway United",
    ShamrockRovers = "Shamrock Rovers",
    Shelbourne = "Shelbourne",
    SligoRovers = "Sligo Rovers",
    StPatricksAth = "St. Patrick's Ath.",
    WaterfordFC = "Waterford FC"
}

// Define stats where rank 10 is bad (high values are bad)
const REVERSED_RANK_COLORS = new Set([
    'Goals against',
    'XGA',
    'PPDA',
    'Red Cards',
    'Corners against'
]);

export function TeamRankings() {
    const [team, setTeam] = useState<keyof typeof Teams>('DroghedaUnited')
    const [rankings, setRankings] = useState<RankingData[]>([])

    const handleTeamSelect = (event: React.SyntheticEvent, selectedTeam: keyof typeof Teams) => {
        setTeam(selectedTeam)

        try {
            setTeamName(Teams[selectedTeam])
            const rankingData = getRankings()
            setRankings(rankingData)
        } catch (error: any) {
            if (error.response?.status === 401) {
                // Token expired, redirect to login
                window.location.reload()
            }
            console.error('Failed to get rankings:', error)
        }
    }

    const getRankColor = (rank: number, subcategory: string, category: string): { bg: string; text: string } => {
        // For stats where rank 10 is bad (like Goals Against, XGA, PPDA)
        if (REVERSED_RANK_COLORS.has(subcategory)) {
            switch (rank) {
                case 10: return { bg: '#d32f2f', text: '#ffffff' } // Bright red
                case 9: return { bg: '#e53935', text: '#ffffff' }
                case 8: return { bg: '#f44336', text: '#ffffff' }
                case 7: return { bg: '#ff9800', text: '#000000' } // Orange
                case 6: return { bg: '#ffc107', text: '#000000' } // Amber
                case 5: return { bg: '#ffeb3b', text: '#000000' } // Yellow
                case 4: return { bg: '#cddc39', text: '#000000' } // Lime
                case 3: return { bg: '#8bc34a', text: '#000000' } // Light green
                case 2: return { bg: '#4caf50', text: '#ffffff' } // Medium green
                case 1: return { bg: '#2e7d32', text: '#ffffff' } // Dark green
                default: return { bg: '#757575', text: '#ffffff' }
            }
        }

        // For all other stats (rank 1 is best)
        switch (rank) {
            case 1: return { bg: '#2e7d32', text: '#ffffff' } // Dark green
            case 2: return { bg: '#4caf50', text: '#ffffff' } // Medium green
            case 3: return { bg: '#8bc34a', text: '#000000' } // Light green
            case 4: return { bg: '#cddc39', text: '#000000' } // Lime
            case 5: return { bg: '#ffeb3b', text: '#000000' } // Yellow
            case 6: return { bg: '#ffc107', text: '#000000' } // Amber
            case 7: return { bg: '#ff9800', text: '#000000' } // Orange
            case 8: return { bg: '#f44336', text: '#ffffff' }
            case 9: return { bg: '#e53935', text: '#ffffff' }
            case 10: return { bg: '#d32f2f', text: '#ffffff' } // Bright red
            default: return { bg: '#757575', text: '#ffffff' }
        }
    }

    const renderRankingsSection = (category: string, rankings: RankingData[]) => {
        const categoryRankings = rankings.filter(r => r.category === category)
        return (
            <>
                <TableRow>
                    <TableCell colSpan={3} style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        {category}
                    </TableCell>
                </TableRow>
                {categoryRankings.map((ranking) => (
                    <TableRow key={`${ranking.category}-${ranking.subcategory}`}>
                        <TableCell>{ranking.subcategory}</TableCell>
                        <TableCell align="center">{ranking.value.toFixed(2)}</TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                bgcolor: getRankColor(ranking.rank, ranking.subcategory, ranking.category).bg,
                                color: getRankColor(ranking.rank, ranking.subcategory, ranking.category).text,
                                fontWeight: 'bold'
                            }}
                        >
                            {ranking.rank}
                        </TableCell>
                    </TableRow>
                ))}
            </>
        )
    }

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                    value={team}
                    onChange={handleTeamSelect}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {Object.entries(Teams)
                        .sort(([, a], [, b]) => a.localeCompare(b))
                        .map(([teamKey, teamName]) => (
                            <Tab
                                key={teamKey}
                                label={teamName}
                                value={teamKey}
                            />
                        ))}
                </Tabs>
            </Box>

            {rankings.length > 0 && (
                <Box display="flex">
                    <TableContainer component={Paper} sx={{ flex: 1, mx: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Construction</TableCell>
                                    <TableCell align="center">Value</TableCell>
                                    <TableCell align="center">Rank</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderRankingsSection('Construction', rankings)}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TableContainer component={Paper} sx={{ flex: 1, mx: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Attack</TableCell>
                                    <TableCell align="center">Value</TableCell>
                                    <TableCell align="center">Rank</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderRankingsSection('Attack', rankings)}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TableContainer component={Paper} sx={{ flex: 1, mx: 1 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Defence</TableCell>
                                    <TableCell align="center">Value</TableCell>
                                    <TableCell align="center">Rank</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderRankingsSection('Defence', rankings)}
                                {renderRankingsSection('General', rankings)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    )
} 