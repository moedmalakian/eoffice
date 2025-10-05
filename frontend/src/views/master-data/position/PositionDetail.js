import React, { useEffect, useState } from 'react'
import { fetchPositionById } from '../../../services/positionService'
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

const PositionDetail = () => {
  const { posId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    positionCode: '',
    positionName: '',
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
    setCanDetail(hasAccessSync('PositionDetail'))
  }, [])

  const handleBack = () => {
    const url = getObjectLink('PositionList')
    if (!url) {
      console.warn('[PositionDetail] Link for PositionList not found.')
      return
    }
    navigate(url)
  }

  useEffect(() => {
    if (!posId) {
      setError('Position ID is missing.')
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
            createdDate: position.createdDate,
            createdBy: position.createdBy,
          })
        } else {
          setError('Failed to fetch position details.')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data.')
      }
    }

    fetchData()
  }, [posId])

  return (
    <div>
      <h4 className="mb-4">Master Data - Position</h4>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CCard>
        <CCardHeader>
          <strong>Detail - Position</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="positionCode">Position Code</CFormLabel>
                <CFormInput
                  type="text"
                  id="positionCode"
                  name="positionCode"
                  value={formData.positionCode}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="positionName">Position Name</CFormLabel>
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
            <CButton color="secondary" onClick={handleBack}>
              Back
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default PositionDetail
