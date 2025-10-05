import React, { useState, useEffect, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLeaveRequest } from '../../services/onLeaveService'
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
  CFormSelect,
} from '@coreui/react'
import { useToast } from '../../utils/toastUtils'
import { fetchReferenceList } from '../../services/referenceService'
import { getObjectLink } from '../../utils/permissionUtils'

const LeaveRequestCreate = () => {
  const navigate = useNavigate()
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()

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

  // Load Reference: Type
  const [typeOptions, setTypeOptions] = useState([])

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

  // Handle submit
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
        useId: formData.useId || '',
      }
      await createLeaveRequest(payload)
      showSuccessCreateToast()
      const url = getObjectLink('LeaveRequestList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (error) {
      console.error('Error creating leave request:', error)
      showErrorCreateToast()
    }
  }

  return (
    <div>
      <h4 className="mb-4">On Leave - Request</h4>
      <CCard>
        <CCardHeader>
          <strong>Create - Leave Request</strong>
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
                <CFormLabel>Quantity (Days)</CFormLabel>
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
                <CFormTextarea
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Remarks</CFormLabel>
                <CFormTextarea name="remarks" value={formData.remarks} onChange={handleChange} />
              </CCol>
            </CRow>

            {/* Buttons */}
            <CButton color="primary" type="submit">
              Submit
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

export default LeaveRequestCreate
