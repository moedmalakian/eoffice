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
  CFormSelect,
} from '@coreui/react'
import { useToast } from '../../utils/toastUtils'
import { fetchReferenceList } from '../../services/referenceService'
import { getObjectLink } from '../../utils/permissionUtils'

const LeaveRequestEdit = () => {
  const { onlId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  const [formData, setFormData] = useState({
    useId: '',
    empId: '',
    fullName: '',
    posId: '',
    positionName: '',
    divId: '',
    divisionName: '',
    startDate: '',
    endDate: '',
    qty: 0,
    onlType: '',
    activity: '',
    remarks: '',
  })

  // Load localStorage: userDetail
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('userDetail') || '{}')
    setFormData((prev) => ({
      ...prev,
      useId: storedUser.useId || '',
      empId: storedUser.empId || '',
      fullName: storedUser.fullName || '',
      posId: storedUser.posId || '',
      positionName: storedUser.positionName || '',
      divId: storedUser.divId || '',
      divisionName: storedUser.divisionName || '',
    }))
  }, [])

  const [loading, setLoading] = useState(true)
  const [typeOptions, setTypeOptions] = useState([])

  // Load Reference: On Leave Type
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const response = await fetchReferenceList(['ONLEAVETYPE'])
        if (response.success && response.data) {
          setTypeOptions(response.data.ONLEAVETYPE?.details || [])
        }
      } catch (err) {
        console.error('Error fetching reference list:', err)
        setTypeOptions([])
      }
    }
    loadReferences()
  }, [])

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
  }, [])

  // Handle calculate qty
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      if ((name === 'startDate' && updated.endDate) || (name === 'endDate' && updated.startDate)) {
        const start = new Date(updated.startDate)
        const end = new Date(updated.endDate)

        if (!isNaN(start) && !isNaN(end) && end >= start) {
          const diffTime = Math.abs(end - start)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
          updated.qty = diffDays
        } else {
          updated.qty = 0
        }
      }

      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('End date cannot be earlier than start date')
      return
    }

    try {
      const payload = {
        ...formData,
        qty: formData.qty || 0,
      }
      await updateLeaveRequest(onlId, payload)
      showSuccessUpdateToast()
      const url = getObjectLink('LeaveRequestList')
      setTimeout(() => navigate(url || '/'), 1000)
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
            {/* Employee details */}
            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel>Full Name</CFormLabel>
                <CFormInput value={formData.fullName} disabled />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Position</CFormLabel>
                <CFormInput value={formData.positionName} disabled />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Division</CFormLabel>
                <CFormInput value={formData.divisionName} disabled />
              </CCol>
            </CRow>

            {/* Leave type & quantity */}
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="onlType">Leave Type</CFormLabel>
                <CFormSelect
                  id="onlType"
                  name="onlType"
                  value={formData.onlType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {typeOptions.map((t) => (
                    <option key={t.rfdId} value={t.referenceKey}>
                      {t.referenceValue}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel>Quantity</CFormLabel>
                <CFormInput name="qty" value={formData.qty} disabled />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Total Left</CFormLabel>
                <CFormInput name="totalLeft" value={formData.qty} disabled />
              </CCol>
            </CRow>

            {/* Start date & end date */}
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

            {/* Reason & remarks */}
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

            {/* Buttons */}
            <CButton color="primary" type="submit">
              Update
            </CButton>
            <CButton
              color="secondary"
              className="ms-2"
              onClick={() => navigate('/on-leave/request')}
            >
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default LeaveRequestEdit
