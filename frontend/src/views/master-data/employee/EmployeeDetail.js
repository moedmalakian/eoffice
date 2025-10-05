import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEmployeeById } from '../../../services/employeeService'
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
import { formatDateWithTime, formatDate } from '../../../utils/formatDateUtils'
import { getObjectLink, hasAccessSync, ensureAccessHydrated } from '../../../utils/permissionUtils'
import { fetchReferenceList } from '../../../services/referenceService'

const EmployeeDetails = () => {
  const { empId } = useParams()
  const navigate = useNavigate()

  // Load Reference: Gender & Family
  const [genderOptions, setGenderOptions] = useState([])
  const [familyOptions, setFamilyOptions] = useState([])

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const response = await fetchReferenceList(['GENDERTYPE', 'STATUSFAMILY'])
        if (response.success && response.data) {
          setGenderOptions(response.data.GENDERTYPE?.details || [])
          setFamilyOptions(response.data.STATUSFAMILY?.details || [])
        }
      } catch (err) {
        console.error('Error fetching reference list:', err)
        setGenderOptions([])
        setFamilyOptions([])
      }
    }
    loadReferences()
  }, [])

  // permissionUtils
  const [accessReady, setAccessReady] = useState(false)
  const [canDetail, setCanDetail] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanDetail(hasAccessSync('EmployeeDetail'))
  }, [])

  useEffect(() => {
    if (accessReady && !canDetail) {
      const url = getObjectLink('EmployeeList')
      navigate(url || '/')
    }
  }, [accessReady, canDetail, navigate])

  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    birthday: '',
    family: '',
    divId: '',
    posId: '',
    phone: '',
    email: '',
    address: '',
    status: '',
    createdDate: '',
    createdBy: '',
  })

  const [divisions, setDivisions] = useState([])
  const [positions, setPositions] = useState([])
  const [error, setError] = useState(null)

  const convertDateToISO = (date) => {
    const [day, month, year] = date.split('-')
    return `${year}-${month}-${day}`
  }

  const handleBack = () => {
    const url = getObjectLink('EmployeeList')
    if (!url) {
      console.warn('[EmployeeDetail] Link for EmployeeList not found.')
      return
    }
    navigate(url)
  }

  useEffect(() => {
    if (!empId) {
      setError('Employee ID is missing.')
      return
    }

    const fetchData = async () => {
      try {
        const employeeData = await fetchEmployeeById(empId)

        if (employeeData && employeeData.data) {
          const employee = employeeData.data

          setFormData({
            fullName: employee.fullName,
            gender: employee.gender,
            birthday: formatDate(employee.birthday),
            family: employee.family,
            divId: employee.divId,
            divisionCode: employee.divisionCode,
            divisionName: employee.divisionName,
            posId: employee.posId,
            positionCode: employee.positionCode,
            positionName: employee.positionName,
            phone: employee.phone,
            email: employee.email,
            address: employee.address,
            status: employee.status,
            createdDate: formatDateWithTime(employee.createdDate),
            createdBy: employee.createdBy,
          })

          setDivisions([
            {
              divId: employee.divId,
              divisionCode: employee.divisionCode,
              divisionName: employee.divisionName,
            },
          ])

          setPositions([
            {
              posId: employee.posId,
              positionCode: employee.positionCode,
              positionName: employee.positionName,
            },
          ])
        } else {
          setError('Failed to fetch employee details. Invalid response structure.')
        }
      } catch (err) {
        console.error('Error fetching employee details:', err)
        setError('Failed to fetch employee details.')
      }
    }

    fetchData()
  }, [empId])

  return (
    <div>
      <h4 className="mb-4">Master Data - Employee</h4>
      {error && <CAlert color="danger">{error}</CAlert>}

      <CCard>
        <CCardHeader>
          <strong>Detail - Employee</strong>
        </CCardHeader>
        <CCardBody>
          <CForm>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="fullName">Full Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="gender">Gender</CFormLabel>
                <CFormSelect id="gender" name="gender" value={formData.gender} disabled>
                  <option value="">Select Gender</option>
                  {genderOptions.map((g) => (
                    <option key={g.rfdId} value={g.referenceKey}>
                      {g.referenceValue}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="birthday">Birthday</CFormLabel>
                <CFormInput
                  type="text"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  disabled
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="divId">Division</CFormLabel>
                <CFormSelect id="divId" name="divId" value={formData.divId} disabled>
                  {Array.isArray(divisions) &&
                    divisions.map((division) => (
                      <option key={division.divId} value={division.divId}>
                        {division.divisionName}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="family">Status Family</CFormLabel>
                <CFormSelect id="family" name="family" value={formData.family} disabled>
                  <option value="">Select Status</option>
                  {familyOptions.map((f) => (
                    <option key={f.rfdId} value={f.referenceKey}>
                      {f.referenceValue}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="phone">Phone</CFormLabel>
                <CFormInput type="text" id="phone" name="phone" value={formData.phone} disabled />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="posId">Position</CFormLabel>
                <CFormSelect id="posId" name="posId" value={formData.posId} disabled>
                  {Array.isArray(positions) &&
                    positions.map((position) => (
                      <option key={position.posId} value={position.posId}>
                        {position.positionName}
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="email">Email</CFormLabel>
                <CFormInput type="email" id="email" name="email" value={formData.email} disabled />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="status">Status Employee</CFormLabel>
                <CFormSelect id="status" name="status" value={formData.status} disabled>
                  <option value="Y">Active</option>
                  <option value="N">Not Active</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="address">Address</CFormLabel>
                <CFormTextarea
                  type="textarea"
                  id="address"
                  name="address"
                  rows={'1'}
                  value={formData.address}
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

export default EmployeeDetails
