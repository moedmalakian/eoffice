import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchPositionById, updatePosition } from '../../../services/positionService'
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

const PositionEdit = () => {
  const { posId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanEdit(hasAccessSync('PositionEdit'))
  }, [])

  useEffect(() => {
    if (accessReady && !canEdit) {
      const url = getObjectLink('PositionList')
      navigate(url || '/')
    }
  }, [accessReady, canEdit, navigate])

  const [formData, setFormData] = useState({
    positionCode: '',
    positionName: '',
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
      await updatePosition(posId, formData)
      showSuccessUpdateToast()
      setTimeout(() => {
        const url = getObjectLink('PositionList')
        navigate(url || '/')
      }, 1000)
    } catch (err) {
      console.error('Error updating employee:', err)
      showErrorUpdateToast()
    }
  }

  const handleBack = () => {
    const url = getObjectLink('PositionList')
    navigate(url || '/')
  }

  useEffect(() => {
    if (!posId) {
      showErrorUpdateToast('Position ID is missing.')
      return
    }

    const fetchData = async () => {
      try {
        const positionData = await fetchPositionById(posId)
        if (positionData && positionData.data) {
          const position = positionData.data
          setFormData({
            positionCode: position.positionCode,
            positionName: position.positionName,
            createdDate: formatDateWithTime(position.createdDate),
            createdBy: position.createdBy || 'UNKNOWN',
          })
        } else {
          showErrorUpdateToast('Failed to fetch position details.')
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
      <h4 className="mb-4">Master Data - Position</h4>
      <CCard>
        <CCardHeader>
          <strong>Edit - Position</strong>
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

export default PositionEdit
