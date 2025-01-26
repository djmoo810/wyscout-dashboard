import { useState } from 'react'
import { Container, Paper, Box } from '@mui/material'
import { TeamRankings } from './components/TeamRankings'
import { Login } from './components/Login'

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    if (!isAuthenticated) {
        return <Login onLogin={() => setIsAuthenticated(true)} />
    }

    return (
        <Container maxWidth={false} disableGutters sx={{ height: '100vh' }}>
            <Paper elevation={3} sx={{ height: '100%' }}>
                <Box p={3}>
                    <TeamRankings />
                </Box>
            </Paper>
        </Container>
    )
}

export default App 