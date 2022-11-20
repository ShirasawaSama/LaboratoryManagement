import React, { useState, useEffect } from 'react'
import { alpha } from '@mui/material/styles'
import { useSnackbar, SnackbarKey } from 'notistack'
import { DataGrid, GridColumns, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid'
import type { User } from './types'
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

const Users: React.FC<{ users: User[], refreshUsers: () => void }> = ({ users, refreshUsers }) => {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [updateNameId, setUpdateNameId] = useState<number | null>()
  const [snack, setSnack] = useState<SnackbarKey | null>(null)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const numSelected = selected.length
  useEffect(() => setSelected([]), [users])

  const columns: GridColumns = [
    { field: 'ID', headerName: 'ID', width: 50 },
    {
      field: 'NAME',
      headerName: '姓名',
      width: 200
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      width: 50,
      cellClassName: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label='编辑'
          key='edit'
          color='inherit'
          onClick={() => {
            setName(row.NAME)
            setUpdateNameId(row.ID)
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
          员工管理
        </Typography>
        {numSelected > 0
          ? (<Tooltip title="删除">
            <IconButton
              disabled={snack !== null}
              onClick={async () => {
                const notify = enqueueSnackbar('删除中...', { variant: 'info', persist: true })
                setSnack(notify)
                try {
                  for (const id of selected) {
                    await fetch('/api/user', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id })
                    }).then(it => it.json()).then(it => { if (it.error) throw new Error(it.error) })
                  }
                  enqueueSnackbar('操作成功!', { variant: 'success' })
                } catch (e) {
                  console.error(e)
                  enqueueSnackbar('操作失败!', { variant: 'error' })
                }
                setSnack(null)
                closeSnackbar(notify)
                refreshUsers()
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>)
          : (<Tooltip title="添加">
            <IconButton
              onClick={() => {
                setName('')
                setUpdateNameId(null)
                setOpen(true)
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>)
        }
      </Toolbar>
      <DataGrid
        rows={users}
        columns={columns}
        pageSize={10}
        autoHeight
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        disableSelectionOnClick
        sx={{ border: 0 }}
        getRowId={it => it.ID}
        experimentalFeatures={{ newEditingApi: true }}
        components={{ Toolbar: GridToolbar }}
        onSelectionModelChange={setSelected as any}
        selectionModel={selected}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{updateNameId === null ? '添加员工' : '修改员工名字'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label='员工名字'
            fullWidth
            variant="standard"
            onChange={e => setName(e.target.value)}
            value={name}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button disabled={!name} onClick={() => {
            setOpen(false)
            fetch('/api/user', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, id: updateNameId })
            }).then(it => it.json()).then(it => {
              if (it.error) throw new Error(it.error)
              enqueueSnackbar('操作成功!', { variant: 'success' })
            }).catch(e => {
              console.error(e)
              enqueueSnackbar('操作失败!', { variant: 'error' })
            }).then(refreshUsers)
          }}>确认</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default Users
