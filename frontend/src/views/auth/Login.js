import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/authSlice'
import { buildUserContext } from '../../utils/userContext'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  //Load API: login
  const apiUrl = import.meta.env.VITE_API_URL

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const clearOldStorage = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userDetail')
    localStorage.removeItem('apiData')
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      clearOldStorage()

      const response = await axios.post(`${apiUrl}/auth/login`, formData, {
        withCredentials: true,
      })

      if (!response?.data?.success) {
        setError(response?.data?.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      const token = response.data.token
      if (!token) {
        setError('Login failed: missing access token from server')
        setLoading(false)
        return
      }

      localStorage.setItem('token', token)

      let decoded = null
      try {
        decoded = jwtDecode(token)
      } catch (err) {
        console.error('Failed to decode JWT:', err)
        setError('Invalid token received from server')
        setLoading(false)
        return
      }

      const now = Date.now() / 1000
      if (decoded.exp && decoded.exp < now) {
        setError('Token expired. Please try again.')
        setLoading(false)
        return
      }

      let context = null
      try {
        context = await buildUserContext(token)
      } catch (err) {
        console.error('buildUserContext failed:', err)
        context = {
          token,
          decoded,
          user: {
            useId: decoded.useId ?? null,
            username: decoded.username ?? formData.username,
            rolId: decoded.rolId ?? null,
            empId: null,
            posId: null,
            divId: null,
          },
          apiData: { allObjects: [], menuObjects: [], roleAccess: [], lastFetched: Date.now() },
        }
      }
      localStorage.setItem('userDetail', JSON.stringify(context.user || {}))
      localStorage.setItem('apiData', JSON.stringify(context.apiData || {}))

      dispatch(
        setUser({
          user: {
            ...context.user,
            rolId: context.user.rolId || decoded.rolId,
          },
          token,
          apiData: context.apiData,
        }),
      )

      navigate('/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Login failed. Please check your credentials or try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h2>Login</h2>
                    <p className="text-body-secondary">Sign In to your account</p>

                    {error && (
                      <CAlert color="danger" dismissible onClose={() => setError(null)}>
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Username"
                        autoComplete="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </CInputGroup>

                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4" disabled={loading}>
                          {loading ? 'Loading...' : 'Login'}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0" disabled={loading}>
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
