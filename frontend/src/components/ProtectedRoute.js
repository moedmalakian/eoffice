import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, clearUser } from '../redux/authSlice'

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const { user, token } = useSelector((state) => state.auth)

  useEffect(() => {
    const checkToken = () => {
      try {
        const token = localStorage.getItem('token')
        const username = localStorage.getItem('username')
        const rolId = localStorage.getItem('rolId')
        const roleName = localStorage.getItem('roleName')

        if (token) {
          const decoded = jwtDecode(token)
          const currentTime = Date.now() / 1000

          if (decoded.exp < currentTime) {
            localStorage.removeItem('token')
            localStorage.removeItem('username')
            localStorage.removeItem('rolId')
            localStorage.removeItem('roleName')
            localStorage.removeItem('apiData')
            dispatch(clearUser())
          } else {
            dispatch(
              setUser({
                user: { username, rolId, roleName },
                token: token,
              }),
            )
          }
        } else {
          dispatch(clearUser())
        }
      } catch (err) {
        console.error('Invalid token:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('rolId')
        localStorage.removeItem('roleName')
        localStorage.removeItem('apiData')
        dispatch(clearUser())
      } finally {
        setLoading(false)
      }
    }

    checkToken()
  }, [dispatch])

  if (loading) return <div>Loading...</div>
  if (!user || !token) return <Navigate to="/login" replace />

  return children
}

export default ProtectedRoute
