import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTooltip,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons'
import { fetchReferenceById, updateReference } from '../../../services/referenceService'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const ReferenceEdit = () => {
  const { rfhId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  const [accessReady, setAccessReady] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  const [header, setHeader] = useState({
    referenceCode: '',
    referenceName: '',
    description: '',
    createdDate: '',
    createdBy: '',
  })

  const [details, setDetails] = useState([
    { referenceKey: '', referenceValue: '', referenceType: '', description: '' },
  ])

  // Hydrate access rights
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanEdit(hasAccessSync('ReferenceEdit'))
  }, [])

  useEffect(() => {
    if (accessReady && !canEdit) {
      const url = getObjectLink('ReferenceList')
      navigate(url || '/')
    }
  }, [accessReady, canEdit, navigate])

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

  const handleHeaderChange = (e) => {
    const { name, value } = e.target
    setHeader((prev) => ({ ...prev, [name]: value }))
  }

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target
    setDetails((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [name]: value }
      return next
    })
  }

  const addDetailRow = () => {
    setDetails((prev) => [
      ...prev,
      { referenceKey: '', referenceValue: '', referenceType: '', description: '' },
    ])
  }

  const removeDetailRow = (index) => {
    setDetails((prev) => {
      const next = [...prev]
      next.splice(index, 1)
      return next.length > 0
        ? next
        : [{ referenceKey: '', referenceValue: '', referenceType: '', description: '' }]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!header.referenceCode || !header.referenceName) {
      showErrorUpdateToast && showErrorUpdateToast('Reference code & name required')
      return
    }

    for (let i = 0; i < details.length; i++) {
      const d = details[i]
      if ((d.referenceKey && !d.referenceValue) || (!d.referenceKey && d.referenceValue)) {
        showErrorUpdateToast && showErrorUpdateToast('Each detail must have both Key and Value')
        return
      }
    }

    try {
      const payload = { header, details: details.filter((d) => d.referenceKey || d.referenceValue) }
      await updateReference(rfhId, payload)
      showSuccessUpdateToast && showSuccessUpdateToast()
      const url = getObjectLink('ReferenceList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (err) {
      console.error('Error updating reference:', err)
      showErrorUpdateToast && showErrorUpdateToast()
    }
  }

  return (
    <div>
      <h4 className="mb-4">Configuration - Reference</h4>

      {/* Header */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Edit - Reference Header</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel htmlFor="referenceCode">Reference Code</CFormLabel>
              <CFormInput
                id="referenceCode"
                name="referenceCode"
                value={header.referenceCode}
                onChange={handleHeaderChange}
                placeholder="Enter reference code"
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="referenceName">Reference Name</CFormLabel>
              <CFormInput
                id="referenceName"
                name="referenceName"
                value={header.referenceName}
                onChange={handleHeaderChange}
                placeholder="Enter reference name"
                required
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="description">Description</CFormLabel>
              <CFormInput
                id="description"
                name="description"
                value={header.description}
                onChange={handleHeaderChange}
                placeholder="Enter description"
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel htmlFor="createdDate">Created Date</CFormLabel>
              <CFormInput type="text" id="createdDate" value={header.createdDate} disabled />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="createdBy">Created By</CFormLabel>
              <CFormInput type="text" id="createdBy" value={header.createdBy} disabled />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Details */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Edit - Reference Details</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-2 fw-bold">
            <CCol md={3}>Key</CCol>
            <CCol md={3}>Value</CCol>
            <CCol md={2}>Type</CCol>
            <CCol md={3}>Description</CCol>
            <CCol md={1} className="text-center">
              Action
            </CCol>
          </CRow>

          {details.map((detail, index) => (
            <CRow className="mb-3" key={index}>
              <CCol md={3}>
                <CFormInput
                  id="referenceKey"
                  name="referenceKey"
                  value={detail.referenceKey}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter key"
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  id="referenceValue"
                  name="referenceValue"
                  value={detail.referenceValue}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter value"
                />
              </CCol>
              <CCol md={2}>
                <CFormInput
                  id="referenceType"
                  name="referenceType"
                  value={detail.referenceType}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter type"
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  id="description"
                  name="description"
                  value={detail.description}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter description"
                />
              </CCol>
              <CCol md={1} className="d-flex align-items-center justify-content-center">
                <CTooltip content="Delete Detail">
                  <CButton
                    color="danger"
                    size="sm"
                    variant="outline"
                    onClick={() => removeDetailRow(index)}
                    disabled={details.length === 1}
                  >
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTooltip>
              </CCol>
            </CRow>
          ))}

          <div className="mt-4 mb-4">
            <CButton color="info" size="sm" variant="outline" type="button" onClick={addDetailRow}>
              <CIcon icon={cilPlus} className="me-1" />
              Add Detail
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      {/* ACTION BUTTONS */}
      <div className="mb-4">
        <CButton type="submit" color="primary" onClick={handleSubmit}>
          Update Data
        </CButton>{' '}
        <CButton color="secondary" onClick={() => navigate(getObjectLink('ReferenceList') || '/')}>
          Cancel
        </CButton>
      </div>
    </div>
  )
}

export default ReferenceEdit
