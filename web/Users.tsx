import React, { useState, useEffect } from 'react'
import { alpha } from '@mui/material/styles'
import { useSnackbar, SnackbarKey } from 'notistack'
import type { User } from './types'
import TableContainer from '@mui/material/TableContainer'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
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
import TablePagination from '@mui/material/TablePagination'

const Users: React.FC<{ users: User[], refreshUsers: () => void }> = ({ users, refreshUsers }) => {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [updateNameId, setUpdateNameId] = useState<number | null>()
  const [snack, setSnack] = useState<SnackbarKey | null>(null)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const numSelected = selected.length
  useEffect(() => setSelected([]), [users])

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
        {numSelected > 0
          ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              已选择 {numSelected} 个员工
            </Typography>)
          : (
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            员工管理
          </Typography>)}
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < users.length}
                  checked={users.length > 0 && numSelected === users.length}
                  onChange={e => setSelected(e.target.checked ? users.map(it => it.ID) : [])}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell align='right'>姓名</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(it => {
              const isItemSelected = selected.includes(it.ID)
              return (
                <TableRow
                  hover
                  key={it.ID}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  onClick={() => {
                    const selectedIndex = selected.indexOf(it.ID)
                    let newSelected: number[] = []

                    if (selectedIndex === -1) {
                      newSelected = newSelected.concat(selected, it.ID)
                    } else if (selectedIndex === 0) {
                      newSelected = newSelected.concat(selected.slice(1))
                    } else if (selectedIndex === selected.length - 1) {
                      newSelected = newSelected.concat(selected.slice(0, -1))
                    } else if (selectedIndex > 0) {
                      newSelected = newSelected.concat(
                        selected.slice(0, selectedIndex),
                        selected.slice(selectedIndex + 1)
                      )
                    }

                    setSelected(newSelected)
                  }}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                    />
                  </TableCell>
                  <TableCell component='th' scope='row'><em>#{it.ID}</em></TableCell>
                  <TableCell align='right'>
                    {it.NAME}&nbsp;
                    <Tooltip title='修改名字'>
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          setName(it.NAME)
                          setUpdateNameId(it.ID)
                          setOpen(true)
                        }}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
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
