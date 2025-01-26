import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { fetchTeamStats } from '../services/api'

interface StatRow {
    category: string
    rank: number
    perGame: number
}

export function StatsTable() {
    const [teamId, setTeamId] = useState('-4856') // Default league ID from your code

    const { data, isLoading, error } = useQuery({
        queryKey: ['teamStats', teamId],
        queryFn: () => fetchTeamStats(teamId),
    })

    if (isLoading) {
        return <CircularProgress />
    }

    if (error) {
        return <Alert severity="error">Error loading stats</Alert>
    }

    const constructionStats: StatRow[] = [
        { category: 'Possession', rank: data?.possession?.rank || 0, perGame: data?.possession?.perGame || 0 },
        { category: 'Passes', rank: data?.passes?.rank || 0, perGame: data?.passes?.perGame || 0 },
        { category: 'Pass Accuracy', rank: data?.passAccuracy?.rank || 0, perGame: data?.passAccuracy?.perGame || 0 },
        { category: 'Through Passes', rank: data?.throughPasses?.rank || 0, perGame: data?.throughPasses?.perGame || 0 },
        { category: 'Key Passes', rank: data?.keyPasses?.rank || 0, perGame: data?.keyPasses?.perGame || 0 },
        { category: 'Smart Passes', rank: data?.smartPasses?.rank || 0, perGame: data?.smartPasses?.perGame || 0 },
    ]

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Rank</TableCell>
                        <TableCell align="right">Per Game</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {constructionStats.map((row) => (
                        <TableRow key={row.category}>
                            <TableCell component="th" scope="row">
                                {row.category}
                            </TableCell>
                            <TableCell align="right">{row.rank}</TableCell>
                            <TableCell align="right">{row.perGame.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
} 