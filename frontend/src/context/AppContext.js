import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState('default')
  const [loading, setLoading] = useState(true)

  const apiData = useSelector((state) => state.auth.apiData)
  const menuObjects = apiData?.menuObjects || []
  const roleAccess = apiData?.roleAccess || []
  const allObjects = apiData?.allObjects || []
  const isDataLoaded = useSelector((state) => state.auth.isDataLoaded)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userData')) || null
    if (storedUser) setUser(storedUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user))
    } else {
      localStorage.removeItem('userData')
    }
  }, [user])

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        setTheme,
        menuObjects,
        roleAccess,
        allObjects,
        loading,
        isDataLoaded,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => useContext(AppContext)
