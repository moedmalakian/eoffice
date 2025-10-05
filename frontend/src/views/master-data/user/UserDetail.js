import React, { useEffect, useState } from 'react'
import { fetchUserById } from '../../../services/userService'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'
import { formatDateWithTime } from '../../../utils/formatDateUtils'

const UserDetail = () => {
  const { useId } = useParams()
  const navigate = useNavigate()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canView, setCanView] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanView(hasAccessSync('UserDetail'))
  }, [])

  const handleBack = () => {
    const url = getObjectLink('UserList')
    if (!url) {
      console.warn('[UserDetail] Link for UserList not found.')
      return
    }
    navigate(url)
  }

  const [formData, setFormData] = useState({
    empId: '',
    fullName: '',
    roleName: '',
    divisionName: '',
    positionName: '',
    username: '',
    password: '********', // Mask password for security
    email: '',
    status: '',
    createdDate: '',
    createdBy: '',
  })

  const [error, setError] = useState(null)

  useEffect(() => {
    if (!useId) {
      setError('User ID is missing.')
      return
    }

    const fetchData = async () => {
      try {
        const userData = await fetchUserById(useId)
        if (userData && userData.data) {
          const user = userData.data
          setFormData({
            empId: user.empId,
            fullName: user.fullName,
            roleName: user.roleName,
            divisionName: user.divisionName,
            positionName: user.positionName,
            username: user.username,
            password: '********', // Masked password
            email: user.email,
            status: user.status,
            createdDate: formatDateWithTime(user.createdDate),
            createdBy: user.createdBy || 'UNKNOWN',
          })
        } else {
          setError('Failed to fetch user details.')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data.')
      }
    }

    fetchData()
  }, [useId])

  if (!accessReady) {
    return <div>Loading permissions...</div>
  }

  if (!canView) {
    return null // Already redirected by useEffect
  }

  return (
    <div>
      <h4 className="mb-4">Master Data - User</h4>
      {error && <CAlert color="danger">{error}</CAlert>}

      <CCard>
        <CCardHeader>
          <strong>Detail - User</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="fullName">Full Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="empId">Emp ID</CFormLabel>
                <CFormInput type="text" id="empId" name="empId" value={formData.empId} disabled />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="divisionName">Division</CFormLabel>
                <CFormInput
                  type="text"
                  id="divisionName"
                  name="divisionName"
                  value={formData.divisionName}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="positionName">Position</CFormLabel>
                <CFormInput
                  type="text"
                  id="positionName"
                  name="positionName"
                  value={formData.positionName}
                  disabled
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="username">Username</CFormLabel>
                <CFormInput
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="password">Password</CFormLabel>
                <CFormInput
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  disabled
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="email">Email</CFormLabel>
                <CFormInput type="text" id="email" name="email" value={formData.email} disabled />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="roleName">Role</CFormLabel>
                <CFormInput
                  type="text"
                  id="roleName"
                  name="roleName"
                  value={formData.roleName}
                  disabled
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="status">Status User</CFormLabel>
                <CFormSelect id="status" name="status" value={formData.status} disabled>
                  <option value="Y">Active</option>
                  <option value="N">Not Active</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="createdDate">Created Date</CFormLabel>
                <CFormInput
                  type="text"
                  id="createdDate"
                  name="createdDate"
                  value={formData.createdDate}
                  disabled
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="createdBy">Created By</CFormLabel>
                <CFormInput
                  type="text"
                  id="createdBy"
                  name="createdBy"
                  value={formData.createdBy}
                  disabled
                />
              </CCol>
            </CRow>
            <br />
            <CButton color="secondary" onClick={handleBack}>
              Back
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default UserDetail
