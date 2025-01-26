import { useState } from 'react'
import { Box, Button, TextField, CircularProgress } from '@mui/material'
import { setAuthToken } from '../services/api'
import { setLeagueId, fetchAllRankings } from '../services/rankings'

interface Props {
    onLogin: () => void
}

export function Login({ onLogin }: Props) {
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (token) {
            setLoading(true)
            try {
                setAuthToken(token)
                setLeagueId('-4856') // Premier League ID
                await fetchAllRankings()
                onLogin()
            } catch (error) {
                console.error('Failed to fetch rankings:', error)
                setLoading(false)
            }
        }
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 400,
                mx: 'auto',
                mt: 4,
                p: 3
            }}
        >
            <TextField
                label="Enter Wyscout Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                fullWidth
                required
                disabled={loading}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={!token || loading}
                sx={{ position: 'relative' }}
            >
                Set Token
                {loading && (
                    <CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px'
                        }}
                    />
                )}
            </Button>
        </Box>
    )
} 