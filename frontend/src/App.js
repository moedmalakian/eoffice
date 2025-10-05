import React, { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useColorModes } from '@coreui/react'
import { ToastProvider } from './utils/toastUtils'
import AppContent from './components/AppContent'
import './scss/style.scss'
import './scss/examples.scss'
import { setUser, setApiData } from './redux/authSlice'

const App = () => {
  const dispatch = useDispatch()
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    document.title = 'Eoffice - Office Management System'
  }, [])

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0]
      if (theme) setColorMode(theme)
      if (!isColorModeSet()) setColorMode(storedTheme)
    } catch (err) {
      console.error('Failed to set theme from URL:', err)
    }
  }, [isColorModeSet, storedTheme, setColorMode])

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData')) || null
    const apiData = JSON.parse(localStorage.getItem('apiData')) || null

    if (userData) {
      dispatch(setUser(userData))
    }

    if (apiData && apiData.lastFetched && Date.now() - apiData.lastFetched < 15 * 60 * 1000) {
      dispatch(setApiData(apiData))
    }
  }, [dispatch])

  return (
    <ToastProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
