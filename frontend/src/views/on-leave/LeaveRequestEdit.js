import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchLeaveRequestById, updateLeaveRequest } from '../../services/onLeaveService'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
} from '@coreui/react'
import { useToast } from '../../utils/toastUtils'

const LeaveRequestEdit = () => {
  const { onlId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetchLeaveRequestById(onlId)
        if (res.success) {
          setFormData(res.data)
        }
      } catch (err) {
        console.error('Error fetching leave request:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [onlId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateLeaveRequest(onlId, formData)
      showSuccessUpdateToast()
      navigate(`/on-leave/${onlId}`)
    } catch (error) {
      console.error('Error updating leave request:', error)
      showErrorUpdateToast()
    }
  }

  if (loading) return <CSpinner color="primary" />
  if (!formData) return <p>Leave request not found</p>

  return (
    <div>
      <h4 className="mb-4">On Leave - Request</h4>
      <CCard>
        <CCardHeader>
          <strong>Edit - Leave Request</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Full Name</CFormLabel>
                <CFormInput name="empId" value={formData.empId} disabled />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Position</CFormLabel>
                <CFormInput name="posId" value={formData.posId} disabled />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Division</CFormLabel>
                <CFormInput name="divId" value={formData.divId} disabled />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Leave Type</CFormLabel>
                <CFormInput name="onlType" value={formData.onlType} onChange={handleChange} />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Quantity</CFormLabel>
                <CFormInput name="qty" value={formData.qty} disabled />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Total Left</CFormLabel>
                <CFormInput name="qty" value={formData.qty} disabled />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Start Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>End Date</CFormLabel>
                <CFormInput
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel>Reason</CFormLabel>
                <CFormTextarea name="activity" value={formData.activity} onChange={handleChange} />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Remarks</CFormLabel>
                <CFormTextarea name="remarks" value={formData.remarks} onChange={handleChange} />
              </CCol>
            </CRow>

            <CButton color="primary" type="submit">
              Update
            </CButton>
            <CButton color="secondary" className="ms-2" onClick={() => navigate('/on-leave')}>
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default LeaveRequestEdit
