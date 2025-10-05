import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchRoleById, updateRole } from '../../../services/roleService'
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
import { getObjectLink, hasAccessSync, ensureAccessHydrated } from '../../../utils/permissionUtils'

const RoleEdit = () => {
  const { rolId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanEdit(hasAccessSync('RoleEdit'))
  }, [])

  useEffect(() => {
    if (accessReady && !canEdit) {
      const url = getObjectLink('RoleList')
      navigate(url || '/')
    }
  }, [accessReady, canEdit, navigate])

  const [formData, setFormData] = useState({
    roleName: '',
    createdDate: '',
    createdBy: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateRole(rolId, formData)
      showSuccessUpdateToast()
      setTimeout(() => {
        const url = getObjectLink('RoleList')
        navigate(url || '/')
      }, 1000)
    } catch (err) {
      console.error('Error updating role:', err)
      showErrorUpdateToast()
    }
  }

  const handleBack = () => {
    const url = getObjectLink('RoleList')
    navigate(url || '/')
  }

  useEffect(() => {
    if (!rolId) {
      showErrorUpdateToast('Role ID is missing.')
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
            createdBy: role.createdBy || 'UNKNOWN',
          })
        } else {
          showErrorUpdateToast('Failed to fetch role details.')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        showErrorUpdateToast('Failed to fetch data.')
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <h4 className="mb-4">Master Data - Role</h4>
      <CCard>
        <CCardHeader>
          <strong>Edit - Role</strong>
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
            <CButton type="submit" color="primary">
              Update Data
            </CButton>
            <CButton color="secondary" className="ms-2" onClick={handleBack}>
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default RoleEdit
