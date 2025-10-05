import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchDivisionById, updateDivision } from '../../../services/divisionService'
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

const DivisionEdit = () => {
  const { divId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanEdit(hasAccessSync('DivisionEdit'))
  }, [])

  useEffect(() => {
    if (accessReady && !canEdit) {
      const url = getObjectLink('DivisionList')
      navigate(url || '/')
    }
  }, [accessReady, canEdit, navigate])

  const [formData, setFormData] = useState({
    divisionCode: '',
    divisionName: '',
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
      await updateDivision(divId, formData)
      showSuccessUpdateToast()
      setTimeout(() => {
        const url = getObjectLink('DivisionList')
        navigate(url || '/')
      }, 1000)
    } catch (err) {
      console.error('Error updating division:', err)
      showErrorUpdateToast()
    }
  }

  const handleBack = () => {
    const url = getObjectLink('DivisionList')
    navigate(url || '/')
  }

  useEffect(() => {
    if (!divId) {
      showErrorUpdateToast('Division ID is missing.')
      return
    }

    const fetchData = async () => {
      try {
        const divisionData = await fetchDivisionById(divId)
        if (divisionData && divisionData.data) {
          const division = divisionData.data
          setFormData({
            divisionCode: division.divisionCode,
            divisionName: division.divisionName,
            createdDate: formatDateWithTime(division.createdDate),
            createdBy: division.createdBy || 'UNKNOWN',
          })
        } else {
          showErrorUpdateToast('Failed to fetch division details.')
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
      <h4 className="mb-4">Master Data - Division</h4>
      <CCard>
        <CCardHeader>
          <strong>Edit - Division</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="divisionCode">Division Code</CFormLabel>
                <CFormInput
                  type="text"
                  id="divisionCode"
                  name="divisionCode"
                  value={formData.divisionCode}
                  onChange={handleChange}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="divisionName">Division Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="divisionName"
                  name="divisionName"
                  value={formData.divisionName}
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

export default DivisionEdit
