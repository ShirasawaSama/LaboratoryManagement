import React, { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'

import Rooms from './Rooms'
import Users from './Users'
import type { User } from './types'

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])

  function refreshUsers () {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers)
  }

  useEffect(refreshUsers, [])

  return (
    <Container maxWidth='lg'>
      <Typography variant='h4' sx={{ mb: '8px' }}>实验室管理系统</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Rooms users={users} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Users users={users} refreshUsers={refreshUsers} />
        </Grid>
      </Grid>
    </Container>
  )
}

export default App
