import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilPlus } from '@coreui/icons'
import { createReference } from '../../../services/referenceService'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'

const ReferenceCreate = () => {
  const navigate = useNavigate()
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()

  const [accessReady, setAccessReady] = useState(false)
  const [canCreate, setCanCreate] = useState(false)

  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('ReferenceCreate'))
  }, [])

  useEffect(() => {
    if (accessReady && !canCreate) {
      const url = getObjectLink('ReferenceList')
      navigate(url || '/')
    }
  }, [accessReady, canCreate, navigate])

  const storedUser = JSON.parse(localStorage.getItem('userDetail') || '{}')
  const [header, setHeader] = useState({
    referenceCode: '',
    referenceName: '',
    description: '',
    createdDate: formatDateWithTime(new Date()),
    createdBy: storedUser.username || 'UNKNOWN',
  })

  const [details, setDetails] = useState([
    { referenceKey: '', referenceValue: '', referenceType: '', description: '' },
  ])

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
      showErrorCreateToast && showErrorCreateToast('Reference code & name required')
      return
    }

    for (let i = 0; i < details.length; i++) {
      const d = details[i]
      if ((d.referenceKey && !d.referenceValue) || (!d.referenceKey && d.referenceValue)) {
        showErrorCreateToast && showErrorCreateToast('Each detail must have both Key and Value')
        return
      }
    }

    try {
      const payload = { header, details: details.filter((d) => d.referenceKey || d.referenceValue) }
      await createReference(payload)
      showSuccessCreateToast && showSuccessCreateToast()
      const url = getObjectLink('ReferenceList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (err) {
      console.error('Error creating reference:', err)
      showErrorCreateToast && showErrorCreateToast()
    }
  }

  return (
    <div>
      <h4 className="mb-4">Configuration - Reference</h4>

      {/* Header */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Reference Header</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3">
            <CCol md={4}>
              <CFormLabel htmlFor="referenceCode">Reference Code</CFormLabel>
              <CFormInput
                type="text"
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
                type="text"
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
                type="text"
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
              <CFormInput
                type="text"
                id="createdDate"
                name="createdDate"
                value={header.createdDate}
                disabled
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="createdBy">Created By</CFormLabel>
              <CFormInput
                type="text"
                id="createdBy"
                name="createdBy"
                value={header.createdBy}
                disabled
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Details */}
      <CCard className="mb-4">
        <CCardHeader>
          <strong>Reference Details</strong>
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
                  type="text"
                  name="referenceKey"
                  value={detail.referenceKey}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter key"
                />
              </CCol>
              <CCol md={3}>
                <CFormInput
                  type="text"
                  name="referenceValue"
                  value={detail.referenceValue}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter value"
                />
              </CCol>
              <CCol md={2}>
                <CFormInput
                  type="text"
                  name="referenceType"
                  value={detail.referenceType}
                  onChange={(e) => handleDetailChange(index, e)}
                  placeholder="Enter type"
                />
              </CCol>

              <CCol md={3}>
                <CFormInput
                  type="text"
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
            <CButton size="sm" color="info" type="button" variant="outline" onClick={addDetailRow}>
              <CIcon icon={cilPlus} className="me-1" />
              Add Detail
            </CButton>
          </div>
        </CCardBody>
      </CCard>

      {/* Action */}
      <div className="mb-4">
        <CButton type="submit" color="primary" onClick={handleSubmit}>
          Save Data
        </CButton>{' '}
        <CButton color="secondary" onClick={() => navigate(getObjectLink('ReferenceList') || '/')}>
          Cancel
        </CButton>
      </div>
    </div>
  )
}

export default ReferenceCreate
