import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPosition } from '../../../services/positionService'
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

const PositionCreate = () => {
  const navigate = useNavigate()
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('PositionCreate'))
  }, [])

  useEffect(() => {
    if (accessReady && !canCreate) {
      const url = getObjectLink('PositionList')
      navigate(url || '/')
    }
  }, [accessReady, canCreate, navigate])

  const storedUser = JSON.parse(localStorage.getItem('userDetail') || '{}')
  const [formData, setFormData] = useState({
    positionCode: '',
    positionName: '',
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
      await createPosition(formData)
      showSuccessCreateToast()
      const url = getObjectLink('PositionList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (err) {
      console.error('Error creating position:', err)
      showErrorCreateToast()
    }
  }

  return (
    <div>
      <h4 className="mb-4">Master Data - Position</h4>
      <CCard>
        <CCardHeader>
          <strong>Create - Position</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="positionCode">Position Code</CFormLabel>
                <CFormInput
                  type="text"
                  id="positionCode"
                  name="positionCode"
                  value={formData.positionCode}
                  onChange={handleChange}
                  placeholder="Enter position code"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="positionName">Position Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="positionName"
                  name="positionName"
                  value={formData.positionName}
                  onChange={handleChange}
                  placeholder="Enter position name"
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
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
            <CButton
              color="secondary"
              onClick={() => navigate(getObjectLink('PositionList') || '/')}
            >
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default PositionCreate
