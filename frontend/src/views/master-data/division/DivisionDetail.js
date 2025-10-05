import React, { useEffect, useState } from 'react'
import { fetchDivisionById } from '../../../services/divisionService'
import { useParams, useNavigate } from 'react-router-dom'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { getObjectLink, hasAccessSync, ensureAccessHydrated } from '../../../utils/permissionUtils'

const DivisionDetail = () => {
  const { divId } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    divisionCode: '',
    divisionName: '',
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
    setCanDetail(hasAccessSync('DivisionDetail'))
  }, [])

  const handleBack = () => {
    const url = getObjectLink('DivisionList')
    if (!url) {
      console.warn('[DivisionDetail] Link for DivisionList not found.')
      return
    }
    navigate(url)
  }

  useEffect(() => {
    if (!divId) {
      setError('Division ID is missing.')
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
            createdBy: division.createdBy,
          })
        } else {
          setError('Failed to fetch division details.')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data.')
      }
    }

    fetchData()
  }, [divId])

  return (
    <div>
      <h4 className="mb-4">Master Data - Division</h4>
      {error && <CAlert color="danger">{error}</CAlert>}
      {success && <CAlert color="success">{success}</CAlert>}

      <CCard>
        <CCardHeader>
          <strong>Detail - Division</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="divisionCode">Division Code</CFormLabel>
                <CFormInput
                  type="text"
                  id="divisionCode"
                  name="divisionCode"
                  value={formData.divisionCode}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="divisionName">Division Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="divisionName"
                  name="divisionName"
                  value={formData.divisionName}
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

export default DivisionDetail
