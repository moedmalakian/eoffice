import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CFormInput,
  CFormLabel,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CFormSelect,
  CButton,
} from '@coreui/react'
import { fetchReferenceById } from '../../../services/referenceService'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { getObjectLink } from '../../../utils/permissionUtils'

const ReferenceDetail = () => {
  const navigate = useNavigate()
  const { rfhId } = useParams()

  const [header, setHeader] = useState({
    referenceCode: '',
    referenceName: '',
    description: '',
    createdDate: '',
    createdBy: '',
  })

  const [details, setDetails] = useState([])

  // Load reference by ID
  useEffect(() => {
    const fetchReference = async () => {
      try {
        const res = await fetchReferenceById(rfhId)
        if (res?.data) {
          setHeader({
            referenceCode: res.data.header.referenceCode ?? '',
            referenceName: res.data.header.referenceName ?? '',
            description: res.data.header.description ?? '',
            createdDate: formatDateWithTime(res.data.header.createdDate) ?? '',
            createdBy: res.data.header.createdBy || localStorage.getItem('username') || 'UNKNOWN',
          })
          setDetails(
            res.data.details.length > 0
              ? res.data.details.map((d) => ({
                  referenceKey: d.referenceKey ?? '',
                  referenceValue: d.referenceValue ?? '',
                  referenceType: d.referenceType ?? '',
                  description: d.description ?? '',
                }))
              : [{ referenceKey: '', referenceValue: '', referenceType: '', description: '' }],
          )
        }
      } catch (err) {
        console.error('Error fetching reference:', err)
        navigate(getObjectLink('ReferenceList') || '/')
      }
    }

    if (rfhId) fetchReference()
  }, [rfhId, navigate])

  return (
    <div>
      <h4 className="mb-4">Configuration - Reference</h4>

      {/* Header */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Detail - Reference Header</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Reference Code</CFormLabel>
              <CFormInput type="text" value={header.referenceCode} disabled />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Reference Name</CFormLabel>
              <CFormInput type="text" value={header.referenceName} disabled />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Description</CFormLabel>
              <CFormInput type="text" value={header.description} disabled />
            </CCol>
          </CRow>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Created Date</CFormLabel>
              <CFormInput type="text" value={header.createdDate} disabled />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Created By</CFormLabel>
              <CFormInput type="text" value={header.createdBy} disabled />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Details */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Detail - Reference Details</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-2 fw-bold">
            <CCol md={3}>Key</CCol>
            <CCol md={3}>Value</CCol>
            <CCol md={3}>Type</CCol>
            <CCol md={3}>Description</CCol>
          </CRow>

          {details.map((detail, index) => (
            <CRow className="mb-3" key={index}>
              <CCol md={3}>
                <CFormInput type="text" value={detail.referenceKey} disabled />
              </CCol>
              <CCol md={3}>
                <CFormInput type="text" value={detail.referenceValue} disabled />
              </CCol>
              <CCol md={3}>
                <CFormInput type="text" value={detail.referenceType} disabled />
              </CCol>
              <CCol md={3}>
                <CFormInput type="text" value={detail.description} disabled />
              </CCol>
            </CRow>
          ))}
        </CCardBody>
      </CCard>

      <div className="mb-4">
        <CButton color="secondary" onClick={() => navigate(getObjectLink('ReferenceList') || '/')}>
          Back
        </CButton>
      </div>
    </div>
  )
}

export default ReferenceDetail
