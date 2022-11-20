import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { zhCN } from '@mui/material/locale'
import { zhCN as zhCNDataGrid } from '@mui/x-data-grid'
import { SnackbarProvider } from 'notistack'

document.title = '实验室管理系统'

const theme = createTheme({ }, zhCN, zhCNDataGrid)

ReactDOM.createRoot(document.getElementById('root')!).render(<ThemeProvider theme={theme}><SnackbarProvider maxSnack={3}><App /></SnackbarProvider></ThemeProvider>)
