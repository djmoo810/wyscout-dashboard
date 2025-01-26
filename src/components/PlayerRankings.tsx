import React, { useEffect, useState } from 'react';
import { fetchAllPlayerRankings, PlayerRankingResult, RankingType } from '../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';

interface Props {
    seasonIds: string[];
    teamName: string;
}

export function PlayerRankings({ seasonIds, teamName }: Props) {
    const [rankings, setRankings] = useState<PlayerRankingResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRankings = async () => {
            try {
                setLoading(true);
                const results = await fetchAllPlayerRankings(seasonIds);
                setRankings(results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load rankings');
            } finally {
                setLoading(false);
            }
        };

        loadRankings();
    }, [seasonIds]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const formatRankingType = (type: RankingType) =>
        type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <Box>
            {rankings.map((ranking) => {
                // Filter players for the current team
                const teamPlayers = ranking.players
                    .map((player, index) => ({ ...player, rank: index + 1 }))
                    .filter(player => player.club === teamName);

                // Only show sections where the team has players in the top 30
                if (teamPlayers.length === 0) return null;

                return (
                    <Box key={ranking.rankingType} mb={4}>
                        <Typography variant="h6" gutterBottom>
                            {formatRankingType(ranking.rankingType)}
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Player</TableCell>
                                        <TableCell align="right">Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {teamPlayers.map((player) => (
                                        <TableRow key={player.playerId}>
                                            <TableCell>{player.rank}</TableCell>
                                            <TableCell>{player.name}</TableCell>
                                            <TableCell align="right">{player.value.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                );
            })}
        </Box>
    );
} 