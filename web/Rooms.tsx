import React, { useState, useEffect, useMemo } from 'react'
import { alpha } from '@mui/material/styles'
import { useSnackbar, SnackbarKey } from 'notistack'
import { DataGrid, GridColumns, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid'
import type { User, Room } from './types'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

const Rooms: React.FC<{ users: User[] }> = ({ users }) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [updateNameId, setUpdateNameId] = useState<number | null>()
  const [updateOwnerId, setUpdateOwnerId] = useState<string | number>('')
  const [snack, setSnack] = useState<SnackbarKey | null>(null)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const numSelected = selected.length

  function refreshRooms () {
    fetch('/api/rooms')
      .then(res => res.json())
      .then(setRooms)
  }

  useEffect(() => setSelected([]), [users])
  useEffect(refreshRooms, [])

  const map = useMemo(() => {
    const map: Record<number, string> = { }
    users.forEach(user => (map[user.ID] = user.NAME))
    return map
  }, [users])

  const columns: GridColumns = [
    { field: 'ID', headerName: 'ID', width: 50 },
    {
      field: 'NAME',
      headerName: '????????????',
      width: 200
    },
    {
      field: 'OWNER',
      headerName: '?????????',
      width: 200,
      valueGetter: it => map[it.value]
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '??????',
      width: 50,
      cellClassName: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label='??????'
          key='edit'
          color='inherit'
          onClick={() => {
            setName(row.NAME)
            setUpdateNameId(row.ID)
            setUpdateOwnerId(row.OWNER)
            setOpen(true)
          }}
        />
      ]
    }
  ]

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity)
          })
        }}
      >
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          ???????????????
        </Typography>
        {numSelected > 0
          ? (<Tooltip title="??????">
            <IconButton
              disabled={snack !== null}
              onClick={async () => {
                const notify = enqueueSnackbar('?????????...', { variant: 'info', persist: true })
                setSnack(notify)
                try {
                  for (const id of selected) {
                    await fetch('/api/room', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id })
                    }).then(it => it.json()).then(it => { if (it.error) throw new Error(it.error) })
                  }
                  enqueueSnackbar('????????????!', { variant: 'success' })
                } catch (e) {
                  console.error(e)
                  enqueueSnackbar('????????????!', { variant: 'error' })
                }
                setSnack(null)
                closeSnackbar(notify)
                refreshRooms()
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>)
          : (<Tooltip title="??????">
            <IconButton
              onClick={() => {
                setName('')
                setUpdateNameId(null)
                setUpdateOwnerId('')
                setOpen(true)
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>)
        }
      </Toolbar>
      <DataGrid
        rows={rooms}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        disableSelectionOnClick
        sx={{ border: 0 }}
        getRowId={it => it.ID}
        autoHeight
        experimentalFeatures={{ newEditingApi: true }}
        components={{ Toolbar: GridToolbar }}
        onSelectionModelChange={setSelected as any}
        selectionModel={selected}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{updateNameId === null ? '???????????????' : '?????????????????????'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label='???????????????'
            fullWidth
            variant="standard"
            onChange={e => setName(e.target.value)}
            value={name}
          />
          <FormControl fullWidth variant="standard">
            <InputLabel id="demo-simple-select-standard-label">?????????</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={updateOwnerId}
              onChange={e => setUpdateOwnerId(e.target.value as number)}
              label="?????????"
            >
              <MenuItem value=""><em>?????????...</em></MenuItem>
              {users.map(it => <MenuItem key={it.ID} value={it.ID}>{it.NAME}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>??????</Button>
          <Button disabled={!name || !(updateOwnerId in map)} onClick={() => {
            setOpen(false)
            fetch('/api/room', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, owner: updateOwnerId, id: updateNameId })
            }).then(it => it.json()).then(it => {
              if (it.error) throw new Error(it.error)
              enqueueSnackbar('????????????!', { variant: 'success' })
            }).catch(e => {
              console.error(e)
              enqueueSnackbar('????????????!', { variant: 'error' })
            }).then(refreshRooms)
          }}>??????</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Rooms
