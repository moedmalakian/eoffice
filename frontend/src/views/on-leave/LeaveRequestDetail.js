import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchLeaveRequestById, deleteLeaveRequest } from '../../services/onLeaveService'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CFormLabel,
  CFormInput,
  CFormTextarea,
} from '@coreui/react'
import { formatDate, formatDateWithTime } from '../../utils/formatDateUtils'
import { useToast } from '../../utils/toastUtils'
import { getObjectLink, ensureAccessHydrated, hasAccessSync } from '../../utils/permissionUtils'

const LeaveRequestDetail = () => {
  const { onlId } = useParams()
  const navigate = useNavigate()
  const [leave, setLeave] = useState(null)
  const [loading, setLoading] = useState(true)

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canDetail, setCanDetail] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanDetail(hasAccessSync('LeaveRequestDetail'))
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchLeaveRequestById(onlId)
        if (res.success) setLeave(res.data)
      } catch (err) {
        console.error('Error fetching leave request detail:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) return <CSpinner color="primary" />
  if (!leave) return <p>Leave request not found</p>

  return (
    <div>
      <h4 className="mb-4">On Leave - Request</h4>
      <CCard>
        <CCardHeader>
          <strong>Detail - Leave Request</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel>Full Name</CFormLabel>
              <CFormInput value={leave.fullName} disabled />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Position</CFormLabel>
              <CFormInput value={leave.positionName} disabled />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Division</CFormLabel>
              <CFormInput value={leave.divisionName} disabled />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Leave Type</CFormLabel>
              <CFormInput value={leave.onlType} disabled />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Quantity</CFormLabel>
              <CFormInput value={leave.qty} disabled />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Total Left</CFormLabel>
              <CFormInput value={leave.qty} disabled />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Start Date</CFormLabel>
              <CFormInput value={formatDate(leave.startDate)} disabled />
            </CCol>
            <CCol md={6}>
              <CFormLabel>End Date</CFormLabel>
              <CFormInput value={formatDate(leave.endDate)} disabled />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Reason</CFormLabel>
              <CFormTextarea value={leave.activity} disabled />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Remarks</CFormLabel>
              <CFormTextarea value={leave.remarks} disabled />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Created By</CFormLabel>
              <CFormInput value={leave.createdBy} disabled />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Created Date</CFormLabel>
              <CFormInput value={formatDateWithTime(leave.createdDate)} disabled />
            </CCol>
          </CRow>
          <CButton
            color="secondary"
            className="ms-2"
            onClick={() => navigate(getObjectLink('LeaveRequestList') || '/')}
          >
            Back
          </CButton>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default LeaveRequestDetail
