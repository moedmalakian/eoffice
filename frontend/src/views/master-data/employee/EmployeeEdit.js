import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchEmployeeById, updateEmployee } from '../../../services/employeeService'
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
import { formatDateWithTime, formatDateForInput } from '../../../utils/formatDateUtils'
import { useToast } from '../../../utils/toastUtils'
import { hasAccessSync, ensureAccessHydrated, getObjectLink } from '../../../utils/permissionUtils'
import { fetchReferenceList } from '../../../services/referenceService'

const EmployeeEdit = () => {
  const { empId } = useParams()
  const navigate = useNavigate()
  const { showSuccessUpdateToast, showErrorUpdateToast } = useToast()

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
  const [canEdit, setCanEdit] = useState(false)

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

  // ensureAccessHydrated
  useEffect(() => {
    const ready = ensureAccessHydrated()
    setAccessReady(ready)
    setCanEdit(hasAccessSync('EmployeeEdit'))
  }, [])

  useEffect(() => {
    if (accessReady && !canEdit) {
      const url = getObjectLink('EmployeeList')
      navigate(url || '/')
    }
  }, [accessReady, canEdit, navigate])

  useEffect(() => {
    if (!empId) {
      showErrorUpdateToast('Employee ID is missing.')
      return
    }

    const fetchData = async () => {
      try {
        const employeeData = await fetchEmployeeById(empId)
        if (employeeData && employeeData.data) {
          const employee = employeeData.data
          setFormData({
            fullName: employee.fullName || '',
            gender: employee.gender || '',
            birthday: formatDateForInput(employee.birthday),
            family: employee.family || '',
            divId: employee.divId || '',
            posId: employee.posId || '',
            phone: employee.phone || '',
            email: employee.email || '',
            address: employee.address || '',
            status: employee.status || '',
            createdDate: formatDateWithTime(employee.createdDate),
            createdBy: employee.createdBy || 'UNKNOWN',
          })
        } else {
          showErrorUpdateToast('Failed to fetch employee details. Invalid response.')
        }

        // Fetch divisions
        const divisionsData = await fetchDivisions()
        if (divisionsData.success) setDivisions(divisionsData.data)

        // Fetch positions
        const positionsData = await fetchPositions()
        if (positionsData.success) setPositions(positionsData.data)
      } catch (err) {
        console.error('Error fetching data:', err)
        showErrorUpdateToast('Failed to fetch data.')
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
      await updateEmployee(empId, formData)
      showSuccessUpdateToast()
      setTimeout(() => {
        const url = getObjectLink('EmployeeList')
        navigate(url || '/')
      }, 1000)
    } catch (err) {
      console.error('Error updating employee:', err)
      showErrorUpdateToast()
    }
  }

  const handleBack = () => {
    const url = getObjectLink('EmployeeList')
    navigate(url || '/')
  }

  return (
    <div>
      <h4 className="mb-4">Master Data - Employee</h4>
      <CCard>
        <CCardHeader>
          <strong>Edit - Employee</strong>
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

export default EmployeeEdit
