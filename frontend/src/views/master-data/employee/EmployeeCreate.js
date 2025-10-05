import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEmployee } from '../../../services/employeeService'
import { fetchDivisions } from '../../../services/divisionService'
import { fetchPositions } from '../../../services/positionService'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CFormSelect,
  CCard,
  CCardBody,
  CCardHeader,
} from '@coreui/react'
import { formatDateWithTime } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'
import { fetchReferenceList } from '../../../services/referenceService'

const EmployeeCreate = () => {
  const navigate = useNavigate()
  const { showSuccessCreateToast, showErrorCreateToast } = useToast()

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
  const [canCreate, setCanCreate] = useState(false)

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanCreate(hasAccessSync('EmployeeCreate'))
  }, [])

  useEffect(() => {
    if (accessReady && !canCreate) {
      const url = getObjectLink('EmployeeList')
      navigate(url || '/')
    }
  }, [accessReady, canCreate, navigate])

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
    status: 'Y',
    createdDate: formatDateWithTime(new Date()),
    createdBy: localStorage.getItem('username') || 'UNKNOWN',
  })

  const [divisions, setDivisions] = useState([])
  const [positions, setPositions] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const divisionResponse = await fetchDivisions()
        if (divisionResponse.success) {
          setDivisions(divisionResponse.data)
        } else {
          console.error('Failed to fetch divisions:', divisionResponse.message)
        }

        const positionResponse = await fetchPositions()
        if (positionResponse.success) {
          setPositions(positionResponse.data)
        } else {
          console.error('Failed to fetch positions:', positionResponse.message)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createEmployee(formData)
      showSuccessCreateToast()
      const url = getObjectLink('EmployeeList')
      setTimeout(() => navigate(url || '/'), 1000)
    } catch (err) {
      console.error('Error creating employee:', err)
      showErrorCreateToast()
    }
  }

  return (
    <div>
      <h4 className="mb-4">Master Data - Employee</h4>
      <CCard>
        <CCardHeader>
          <strong>Create - Employee</strong>
        </CCardHeader>
        <CCardBody>
          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="fullName">Full Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="gender">Gender</CFormLabel>
                <CFormSelect
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
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
                  type="date"
                  id="birthday"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="divId">Division</CFormLabel>
                <CFormSelect
                  id="divId"
                  name="divId"
                  value={formData.divId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
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
                <CFormSelect
                  id="family"
                  name="family"
                  value={formData.family}
                  onChange={handleChange}
                  required
                >
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
                <CFormInput
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="posId">Position</CFormLabel>
                <CFormSelect
                  id="posId"
                  name="posId"
                  value={formData.posId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Position</option>
                  {positions.map((position) => (
                    <option key={position.posId} value={position.posId}>
                      {position.positionName}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="email">Email</CFormLabel>
                <CFormInput
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </CCol>
            </CRow>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="status">Status Employee</CFormLabel>
                <CFormSelect
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Y">Active</option>
                  <option value="N">Not Active</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="address">Address</CFormLabel>
                <CFormTextarea
                  id="address"
                  name="address"
                  rows="1"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  required
                />
              </CCol>
            </CRow>
            <br />
            <CButton type="submit" color="primary">
              Save Data
            </CButton>{' '}
            <CButton
              color="secondary"
              onClick={() => navigate(getObjectLink('EmployeeList') || '/')}
            >
              Cancel
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default EmployeeCreate
