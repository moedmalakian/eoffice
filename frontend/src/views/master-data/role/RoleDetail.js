import React, { useEffect, useState } from 'react'
import { fetchRoleById } from '../../../services/roleService'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { getObjectLink, hasAccessSync, ensureAccessHydrated } from '../../../utils/permissionUtils'

const RoleDetail = () => {
  const { rolId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    roleName: '',
    createdDate: '',
    createdBy: '',
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canDetail, setCanDetail] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanDetail(hasAccessSync('RoleDetail'))
  }, [])

  const handleBack = () => {
    const url = getObjectLink('RoleList')
    if (!url) {
      console.warn('[RoleDetail] Link for RoleList not found.')
      return
    }
    navigate(url)
  }

  useEffect(() => {
    if (!rolId) {
      setError('Role ID is missing.')
      return
    }

    const fetchData = async () => {
      try {
        const roleData = await fetchRoleById(rolId)
        if (roleData && roleData.data) {
          const role = roleData.data
          setFormData({
            roleName: role.roleName,
            createdDate: formatDateWithTime(role.createdDate),
            createdBy: role.createdBy,
          })
        } else {
          setError('Failed to fetch role details.')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data.')
      }
    }

    fetchData()
  }, [rolId])

  return (
    <div>
      <h4 className="mb-4">Master Data - Role</h4>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CCard>
        <CCardHeader>
          <strong>Detail - Role</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="roleName">Role Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="roleName"
                  name="roleName"
                  value={formData.roleName}
                  disabled
                />
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

export default RoleDetail
