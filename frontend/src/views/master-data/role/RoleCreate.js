import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRole } from '../../../services/roleService'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const RoleCreate = () => {
  const navigate = useNavigate()
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('RoleCreate'))
  }, [])

  useEffect(() => {
    if (accessReady && !canCreate) {
      const url = getObjectLink('RoleList')
      navigate(url || '/')
    }
  }, [accessReady, canCreate, navigate])

  const storedUser = JSON.parse(localStorage.getItem('userDetail') || '{}')
  const [formData, setFormData] = useState({
    roleName: '',
    createdDate: formatDateWithTime(new Date()),
    createdBy: storedUser.username || 'UNKNOWN',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createRole(formData)
      showSuccessCreateToast()
      const url = getObjectLink('RoleList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (err) {
      console.error('Error creating role:', err)
      showErrorCreateToast()
    }
  }

  return (
    <div>
      <h4 className="mb-4">Master Data - Role</h4>
      <CCard>
        <CCardHeader>
          <strong>Create - Role</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="roleName">Role Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="roleName"
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  placeholder="Enter role name"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="createdDate">Created Date</CFormLabel>
                <CFormInput
                  type="text"
                  id="createdDate"
                  name="createdDate"
                  value={formData.createdDate}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  disabled
                />
              </CCol>
            </CRow>
            <br />
            <CButton type="submit" color="primary">
              Save Data
            </CButton>{' '}
            <CButton color="secondary" onClick={() => navigate(getObjectLink('RoleList') || '/')}>
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default RoleCreate
